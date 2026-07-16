import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import initialProducts from '../data/products.js'

const STORAGE_KEY = 'fan_del_papel_products'
const CATEGORY_STORAGE_KEY = 'fan_del_papel_categories'
const SUBCATEGORY_STORAGE_KEY = 'fan_del_papel_subcategories'

const safeLocalStorageSet = (key, value) => {
  try {
    if (typeof window === 'undefined') return { ok: false, error: 'no-window' }
    window.localStorage.setItem(key, value)
    return { ok: true }
  } catch (error) {
    // Suele fallar por cuota de localStorage (ej: imágenes en base64)
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('fan-del-papel:persist-error', {
            detail: { key, message: error?.message || String(error) },
          })
        )
      }
    } catch (_) {}
    return { ok: false, error }
  }
}

const cloneProducts = (items = []) =>
  items.map((product) => ({
    ...product,
    imagenes: Array.isArray(product.imagenes) ? [...product.imagenes] : [],
  }))

const createSlug = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const safePersist = (key, data) => {
  if (typeof window === 'undefined') return { ok: true }
  return safeLocalStorageSet(key, JSON.stringify(data))
}

export const useProductsStore = defineStore('products', () => {
  const products = ref(cloneProducts(initialProducts))

  // Categorías por defecto para cuando el catálogo está vacío
  const DEFAULT_CATEGORIES = [
    'Papelería',
    'Sobres chicos + cartas',
    'Sobres grandes + cartas',
    'Cartas simples',
    'Cuadernillos',
    'Cuadernillos regional',
  ]

  const categoryList = ref([...DEFAULT_CATEGORIES])
  const subcategoryMap = ref({})

  function syncCategoryListFromProducts() {
    const productCategories = products.value
      .map((product) => product.categoria)
      .filter(Boolean)
    const merged = [...new Set([...categoryList.value, ...productCategories])]
    categoryList.value = merged.sort((a, b) => a.localeCompare(b))
  }

  function syncSubcategoryMapFromProducts() {
    const map = {}
    products.value.forEach((product) => {
      const category = product.categoria || 'Sin categoría'
      const subcategory = product.subcategoria && String(product.subcategoria).trim()
      if (subcategory) {
        map[category] = map[category] || []
        if (!map[category].includes(subcategory)) {
          map[category].push(subcategory)
        }
      }
    })
    Object.keys(map).forEach((category) => {
      map[category].sort((a, b) => a.localeCompare(b))
    })
    subcategoryMap.value = { ...subcategoryMap.value, ...map }
  }

  if (typeof window !== 'undefined') {
    const savedProducts = window.localStorage.getItem(STORAGE_KEY)
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts)
        if (Array.isArray(parsed) && parsed.length) {
          products.value = cloneProducts(parsed)
        }
      } catch (error) {
        console.error('No se pudieron cargar los productos guardados:', error)
      }
    }

    const savedCategories = window.localStorage.getItem(CATEGORY_STORAGE_KEY)
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories)
        if (Array.isArray(parsed) && parsed.length) {
          categoryList.value = parsed.filter((item) => typeof item === 'string' && item.trim())
        }
      } catch (error) {
        console.error('No se pudieron cargar las categorías guardadas:', error)
      }
    }

    const savedSubcategories = window.localStorage.getItem(SUBCATEGORY_STORAGE_KEY)
    if (savedSubcategories) {
      try {
        const parsed = JSON.parse(savedSubcategories)
        if (parsed && typeof parsed === 'object') {
          subcategoryMap.value = parsed
        }
      } catch (error) {
        console.error('No se pudieron cargar las subcategorías guardadas:', error)
      }
    }

    syncCategoryListFromProducts()
    syncSubcategoryMapFromProducts()
  }

  watch(
    products,
    (updatedProducts) => {
      safePersist(STORAGE_KEY, updatedProducts)
    },
    { deep: true }
  )

  watch(
    categoryList,
    (updatedCategories) => {
      safePersist(CATEGORY_STORAGE_KEY, updatedCategories)
    },
    { deep: true }
  )

  const persistProducts = () => safePersist(STORAGE_KEY, products.value)

  const persistCategories = () => safePersist(CATEGORY_STORAGE_KEY, categoryList.value)

  const persistSubcategories = () => safePersist(SUBCATEGORY_STORAGE_KEY, subcategoryMap.value)

  watch(
    subcategoryMap,
    (updatedMap) => {
      safePersist(SUBCATEGORY_STORAGE_KEY, updatedMap)
    },
    { deep: true }
  )

  const categories = computed(() => {
    const productCategories = products.value
      .map((product) => product.categoria)
      .filter(Boolean)
    const unique = [...new Set([...categoryList.value, ...productCategories])]
    return unique.sort((a, b) => a.localeCompare(b))
  })

  function addProduct(payload = {}) {
    const newProduct = {
      id: Date.now(),
      nombre: payload.nombre || 'Nuevo producto',
      slug: payload.slug || createSlug(payload.nombre || 'nuevo-producto'),
      categoria: payload.categoria || 'Papelería',
      subcategoria: payload.subcategoria || '',
      descripcion: payload.descripcion || 'Descripción breve del producto.',
      precio: Number(payload.precio) || 0,
      destacado: Boolean(payload.destacado),
      nuevo: Boolean(payload.nuevo),
      stock: Number(payload.stock) || 0,
      imagenes: Array.isArray(payload.imagenes) ? payload.imagenes : [],
    }

    if (newProduct.categoria && !categoryList.value.includes(newProduct.categoria)) {
      categoryList.value.push(newProduct.categoria)
    }

    if (newProduct.categoria && newProduct.subcategoria) {
      subcategoryMap.value[newProduct.categoria] = subcategoryMap.value[newProduct.categoria] || []
      if (!subcategoryMap.value[newProduct.categoria].includes(newProduct.subcategoria)) {
        subcategoryMap.value[newProduct.categoria].push(newProduct.subcategoria)
        subcategoryMap.value[newProduct.categoria].sort((a, b) => a.localeCompare(b))
      }
    }

    products.value.unshift(newProduct)
    syncCategoryListFromProducts()
    const persistResult = persistProducts()
    persistCategories()
    persistSubcategories()
    return { product: newProduct, persistResult }
  }

  function updateProduct(id, updates = {}) {
    const index = products.value.findIndex((product) => product.id === id)
    if (index === -1) return null

    const current = products.value[index]
    const nextProduct = {
      ...current,
      ...updates,
      id: current.id,
      precio: updates.precio !== undefined ? Number(updates.precio) : current.precio,
      stock: updates.stock !== undefined ? Number(updates.stock) : current.stock,
      imagenes: Array.isArray(updates.imagenes) ? updates.imagenes : current.imagenes,
      subcategoria: updates.subcategoria !== undefined ? updates.subcategoria : current.subcategoria,
      slug: updates.slug ? updates.slug : current.slug || createSlug(updates.nombre || current.nombre),
    }

    if (nextProduct.categoria && !categoryList.value.includes(nextProduct.categoria)) {
      categoryList.value.push(nextProduct.categoria)
    }

    if (nextProduct.categoria && nextProduct.subcategoria) {
      subcategoryMap.value[nextProduct.categoria] = subcategoryMap.value[nextProduct.categoria] || []
      if (!subcategoryMap.value[nextProduct.categoria].includes(nextProduct.subcategoria)) {
        subcategoryMap.value[nextProduct.categoria].push(nextProduct.subcategoria)
        subcategoryMap.value[nextProduct.categoria].sort((a, b) => a.localeCompare(b))
      }
    }

    products.value.splice(index, 1, nextProduct)
    syncCategoryListFromProducts()
    const persistResult = persistProducts()
    persistCategories()
    persistSubcategories()
    return { product: nextProduct, persistResult }
  }

  function addCategory(name = '') {
    const normalized = String(name).trim()
    if (!normalized || categoryList.value.includes(normalized)) return false
    categoryList.value.push(normalized)
    categoryList.value.sort((a, b) => a.localeCompare(b))
    persistCategories()
    return true
  }

  function updateCategory(oldName, newName) {
    const normalized = String(newName).trim()
    if (!normalized || normalized === oldName) return false
    if (categoryList.value.includes(normalized)) return false

    const index = categoryList.value.findIndex((category) => category === oldName)
    if (index === -1) return false

    categoryList.value.splice(index, 1, normalized)
    categoryList.value.sort((a, b) => a.localeCompare(b))
    products.value = products.value.map((product) =>
      product.categoria === oldName ? { ...product, categoria: normalized } : product
    )

    if (subcategoryMap.value[oldName]) {
      subcategoryMap.value[normalized] = subcategoryMap.value[oldName]
      delete subcategoryMap.value[oldName]
    }

    persistProducts()
    persistCategories()
    persistSubcategories()
    return true
  }

  function removeCategory(name) {
    const fallbackCategory = categoryList.value.find((category) => category !== name) || 'Papelería'
    products.value = products.value.map((product) =>
      product.categoria === name ? { ...product, categoria: fallbackCategory } : product
    )
    categoryList.value = categoryList.value.filter((category) => category !== name)
    delete subcategoryMap.value[name]
    subcategoryMap.value = { ...subcategoryMap.value }
    syncSubcategoryMapFromProducts()
    persistProducts()
    persistCategories()
    persistSubcategories()
    return true
  }

  function removeProduct(id) {
    products.value = products.value.filter((product) => product.id !== id)
    syncSubcategoryMapFromProducts()
    persistProducts()
    persistSubcategories()
  }

  function resetToSeed() {
    products.value = cloneProducts(initialProducts)
    categoryList.value = [...DEFAULT_CATEGORIES]
    subcategoryMap.value = {}
    syncCategoryListFromProducts()
    syncSubcategoryMapFromProducts()
    persistProducts()
    persistCategories()
    persistSubcategories()
  }

  function getSubcategories(category) {
    return Array.from(new Set([...(subcategoryMap.value[category] || []),
      ...products.value
        .filter((product) => product.categoria === category)
        .map((product) => product.subcategoria)
        .filter(Boolean)
    ])).sort((a, b) => a.localeCompare(b))
  }

  function addSubcategory(category, subcategory) {
    const normalizedCategory = String(category).trim()
    const normalizedSubcategory = String(subcategory).trim()
    if (!normalizedCategory || !normalizedSubcategory) return false
    subcategoryMap.value[normalizedCategory] = subcategoryMap.value[normalizedCategory] || []
    if (subcategoryMap.value[normalizedCategory].includes(normalizedSubcategory)) return false
    subcategoryMap.value[normalizedCategory].push(normalizedSubcategory)
    subcategoryMap.value[normalizedCategory].sort((a, b) => a.localeCompare(b))
    return true
  }

  function removeSubcategory(category, subcategory) {
    if (!subcategoryMap.value[category]) return false
    subcategoryMap.value[category] = subcategoryMap.value[category].filter((item) => item !== subcategory)
    subcategoryMap.value = { ...subcategoryMap.value }
    return true
  }

  return {
    products,
    categories,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    updateCategory,
    removeCategory,
    addSubcategory,
    removeSubcategory,
    getSubcategories,
    resetToSeed,
  }
})
