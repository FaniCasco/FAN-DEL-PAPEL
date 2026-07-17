import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { supabase, supabaseConfigError } from '@/lib/supabase'

const CATEGORY_STORAGE_KEY = 'fan_del_papel_categories'
const SUBCATEGORY_STORAGE_KEY = 'fan_del_papel_subcategories'

const DEFAULT_CATEGORIES = [
  'Papelería',
  'Sobres chicos + cartas',
  'Sobres grandes + cartas',
  'Cartas simples',
  'Cuadernillos',
  'Cuadernillos regional',
]

const hasWindow = () => typeof window !== 'undefined'

const safeLocalStorageSet = (key, value) => {
  try {
    if (!hasWindow()) return { ok: false, error: 'no-window' }
    window.localStorage.setItem(key, value)
    return { ok: true }
  } catch (error) {
    try {
      window.dispatchEvent(
        new CustomEvent('fan-del-papel:persist-error', {
          detail: { key, message: error?.message || String(error) },
        })
      )
    } catch (_) {}
    return { ok: false, error }
  }
}

const readJson = (key, fallback) => {
  if (!hasWindow()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (error) {
    console.warn(`No se pudo leer ${key}:`, error)
    return fallback
  }
}

const persistJson = (key, value) => safeLocalStorageSet(key, JSON.stringify(value))

const normalizeText = (value = '', fallback = '') => {
  const text = value === undefined || value === null ? '' : String(value).trim()
  return text || fallback
}

const normalizeCategoryList = (items = []) =>
  [...new Set(items.map((item) => normalizeText(item)).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  )

const normalizeSubcategoryMap = (input = {}) => {
  const normalized = {}

  Object.entries(input || {}).forEach(([category, subcategories]) => {
    const normalizedCategory = normalizeText(category)
    if (!normalizedCategory) return

    const values = Array.isArray(subcategories) ? subcategories : []
    normalized[normalizedCategory] = normalizeCategoryList(values)
  })

  return normalized
}

const createSlug = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const cloneProduct = (product = {}) => ({
  ...product,
  imagenes: Array.isArray(product.imagenes) ? [...product.imagenes] : [],
})

const normalizeProduct = (row = {}) => {
  const id = Number(row.id)
  const nombre = normalizeText(row.nombre, 'Nuevo producto')

  return {
    id: Number.isFinite(id) ? id : Date.now(),
    nombre,
    slug: normalizeText(row.slug, createSlug(nombre)),
    categoria: normalizeText(row.categoria, 'Papelería'),
    subcategoria: normalizeText(row.subcategoria),
    descripcion: normalizeText(row.descripcion, 'Descripción breve del producto.'),
    precio: Number(row.precio) || 0,
    destacado: Boolean(row.destacado),
    nuevo: Boolean(row.nuevo),
    imagenes: Array.isArray(row.imagenes) ? row.imagenes.filter(Boolean) : [],
  }
}

const buildProductRow = (payload = {}, current = {}) => {
  const merged = {
    ...current,
    ...payload,
  }
  const nombre = normalizeText(merged.nombre, 'Nuevo producto')

  return {
    nombre,
    slug: normalizeText(merged.slug, current.slug || createSlug(nombre)),
    categoria: normalizeText(merged.categoria, current.categoria || 'Papelería'),
    subcategoria: normalizeText(merged.subcategoria, current.subcategoria || ''),
    descripcion: normalizeText(
      merged.descripcion,
      current.descripcion || 'Descripción breve del producto.'
    ),
    precio: Number(merged.precio) || 0,
    destacado: Boolean(merged.destacado),
    nuevo: Boolean(merged.nuevo),
    imagenes: Array.isArray(merged.imagenes) ? merged.imagenes.filter(Boolean) : [],
  }
}

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const categoryList = ref([...DEFAULT_CATEGORIES])
  const subcategoryMap = ref({})
  const isLoaded = ref(false)

  let loadPromise = null

  const syncCategoryListFromProducts = () => {
    categoryList.value = normalizeCategoryList([
      ...DEFAULT_CATEGORIES,
      ...categoryList.value,
      ...products.value.map((product) => product.categoria),
    ])
  }

  const syncSubcategoryMapFromProducts = () => {
    const merged = normalizeSubcategoryMap(subcategoryMap.value)

    products.value.forEach((product) => {
      const category = normalizeText(product.categoria)
      const subcategory = normalizeText(product.subcategoria)
      if (!category || !subcategory) return

      const values = merged[category] || []
      if (!values.includes(subcategory)) {
        values.push(subcategory)
        merged[category] = values.sort((a, b) => a.localeCompare(b))
      }
    })

    subcategoryMap.value = merged
  }

  const persistCategories = () => persistJson(CATEGORY_STORAGE_KEY, categoryList.value)
  const persistSubcategories = () => persistJson(SUBCATEGORY_STORAGE_KEY, subcategoryMap.value)

  const loadLocalTaxonomy = () => {
    const savedCategories = readJson(CATEGORY_STORAGE_KEY, [])
    const savedSubcategories = readJson(SUBCATEGORY_STORAGE_KEY, {})

    if (Array.isArray(savedCategories) && savedCategories.length) {
      categoryList.value = normalizeCategoryList([...DEFAULT_CATEGORIES, ...savedCategories])
    }

    if (savedSubcategories && typeof savedSubcategories === 'object') {
      subcategoryMap.value = normalizeSubcategoryMap(savedSubcategories)
    }
  }

  if (hasWindow()) {
    loadLocalTaxonomy()
  }

  watch(
    categoryList,
    (updatedCategories) => {
      persistJson(CATEGORY_STORAGE_KEY, updatedCategories)
    },
    { deep: true }
  )

  watch(
    subcategoryMap,
    (updatedMap) => {
      persistJson(SUBCATEGORY_STORAGE_KEY, updatedMap)
    },
    { deep: true }
  )

  const categories = computed(() =>
    normalizeCategoryList([
      ...DEFAULT_CATEGORIES,
      ...categoryList.value,
      ...products.value.map((product) => product.categoria),
    ])
  )

  const buildSupabaseError = (fallbackMessage) =>
    supabaseConfigError || new Error(fallbackMessage)

  async function loadProducts() {
    if (loadPromise) return loadPromise

    loadPromise = (async () => {
      if (!supabase) {
        isLoaded.value = true
        return {
          ok: false,
          error: buildSupabaseError('Supabase no esta configurado'),
        }
      }

      const {
        data,
        error,
      } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        isLoaded.value = true
        return {
          ok: false,
          error,
        }
      }

      products.value = Array.isArray(data) ? data.map((row) => normalizeProduct(row)) : []
      syncCategoryListFromProducts()
      syncSubcategoryMapFromProducts()
      persistCategories()
      persistSubcategories()
      isLoaded.value = true

      return {
        ok: true,
        count: products.value.length,
      }
    })().finally(() => {
      loadPromise = null
    })

    return loadPromise
  }

  void loadProducts()

  async function addProduct(payload = {}) {
    if (!supabase) {
      return {
        product: null,
        persistResult: {
          ok: false,
          error: buildSupabaseError('Supabase no esta configurado'),
        },
      }
    }

    const row = buildProductRow(payload)
    const { data, error } = await supabase.from('products').insert([row]).select('*').single()

    if (error) {
      return {
        product: null,
        persistResult: {
          ok: false,
          error,
        },
      }
    }

    const newProduct = normalizeProduct(data)
    products.value.unshift(newProduct)
    syncCategoryListFromProducts()
    syncSubcategoryMapFromProducts()
    persistCategories()
    persistSubcategories()

    return {
      product: newProduct,
      persistResult: {
        ok: true,
        data: newProduct,
      },
    }
  }

  async function updateProduct(id, updates = {}) {
    const numericId = Number(id)
    const index = products.value.findIndex((product) => product.id === numericId)
    if (index === -1) return null

    if (!supabase) {
      return {
        product: products.value[index],
        persistResult: {
          ok: false,
          error: buildSupabaseError('Supabase no esta configurado'),
        },
      }
    }

    const current = products.value[index]
    const row = buildProductRow(updates, current)
    const { data, error } = await supabase
      .from('products')
      .update(row)
      .eq('id', numericId)
      .select('*')
      .single()

    if (error) {
      return {
        product: current,
        persistResult: {
          ok: false,
          error,
        },
      }
    }

    const nextProduct = normalizeProduct(data)
    products.value.splice(index, 1, nextProduct)
    syncCategoryListFromProducts()
    syncSubcategoryMapFromProducts()
    persistCategories()
    persistSubcategories()

    return {
      product: nextProduct,
      persistResult: {
        ok: true,
        data: nextProduct,
      },
    }
  }

  async function removeProduct(id) {
    const numericId = Number(id)
    const index = products.value.findIndex((product) => product.id === numericId)
    if (index === -1) return null

    if (!supabase) {
      return {
        product: products.value[index],
        persistResult: {
          ok: false,
          error: buildSupabaseError('Supabase no esta configurado'),
        },
      }
    }

    const current = products.value[index]
    const { error } = await supabase.from('products').delete().eq('id', numericId)

    if (error) {
      return {
        product: current,
        persistResult: {
          ok: false,
          error,
        },
      }
    }

    products.value = products.value.filter((product) => product.id !== numericId)
    syncCategoryListFromProducts()
    syncSubcategoryMapFromProducts()
    persistCategories()
    persistSubcategories()

    return {
      product: current,
      persistResult: {
        ok: true,
      },
    }
  }

  function addCategory(name = '') {
    const normalized = normalizeText(name)
    if (!normalized || categoryList.value.includes(normalized)) return false

    categoryList.value = normalizeCategoryList([...categoryList.value, normalized])
    persistCategories()
    return true
  }

  function updateCategory(oldName, newName) {
    const previousName = normalizeText(oldName)
    const normalized = normalizeText(newName)
    if (!previousName || !normalized || normalized === previousName) return false
    if (categoryList.value.includes(normalized)) return false

    categoryList.value = categoryList.value.map((category) =>
      category === previousName ? normalized : category
    )

    products.value = products.value.map((product) =>
      product.categoria === previousName ? { ...product, categoria: normalized } : product
    )

    if (subcategoryMap.value[previousName]) {
      subcategoryMap.value[normalized] = subcategoryMap.value[previousName]
      delete subcategoryMap.value[previousName]
    }

    persistCategories()
    persistSubcategories()
    return true
  }

  function removeCategory(name) {
    const normalized = normalizeText(name)
    if (!normalized) return false

    const fallbackCategory =
      categoryList.value.find((category) => category !== normalized) || 'Papelería'

    categoryList.value = categoryList.value.filter((category) => category !== normalized)
    products.value = products.value.map((product) =>
      product.categoria === normalized ? { ...product, categoria: fallbackCategory } : product
    )
    delete subcategoryMap.value[normalized]
    subcategoryMap.value = { ...subcategoryMap.value }

    persistCategories()
    persistSubcategories()
    return true
  }

  async function resetToSeed() {
    if (!supabase) {
      return {
        ok: false,
        error: buildSupabaseError('Supabase no esta configurado'),
      }
    }

    const { data, error } = await supabase.from('products').select('id')
    if (error) {
      return {
        ok: false,
        error,
      }
    }

    if (Array.isArray(data) && data.length) {
      const ids = data.map((item) => item.id)
      const { error: deleteError } = await supabase.from('products').delete().in('id', ids)
      if (deleteError) {
        return {
          ok: false,
          error: deleteError,
        }
      }
    }

    products.value = []
    categoryList.value = [...DEFAULT_CATEGORIES]
    subcategoryMap.value = {}
    persistCategories()
    persistSubcategories()
    return {
      ok: true,
      count: 0,
    }
  }

  function getSubcategories(category) {
    const normalizedCategory = normalizeText(category)
    return Array.from(
      new Set([
        ...(subcategoryMap.value[normalizedCategory] || []),
        ...products.value
          .filter((product) => product.categoria === normalizedCategory)
          .map((product) => product.subcategoria)
          .filter(Boolean),
      ])
    ).sort((a, b) => a.localeCompare(b))
  }

  function addSubcategory(category, subcategory) {
    const normalizedCategory = normalizeText(category)
    const normalizedSubcategory = normalizeText(subcategory)
    if (!normalizedCategory || !normalizedSubcategory) return false

    subcategoryMap.value[normalizedCategory] = subcategoryMap.value[normalizedCategory] || []
    if (subcategoryMap.value[normalizedCategory].includes(normalizedSubcategory)) return false

    subcategoryMap.value[normalizedCategory].push(normalizedSubcategory)
    subcategoryMap.value[normalizedCategory].sort((a, b) => a.localeCompare(b))
    persistSubcategories()
    return true
  }

  function removeSubcategory(category, subcategory) {
    const normalizedCategory = normalizeText(category)
    const normalizedSubcategory = normalizeText(subcategory)
    if (!normalizedCategory || !subcategoryMap.value[normalizedCategory]) return false

    const nextItems = subcategoryMap.value[normalizedCategory].filter(
      (item) => item !== normalizedSubcategory
    )
    if (nextItems.length === subcategoryMap.value[normalizedCategory].length) return false

    subcategoryMap.value[normalizedCategory] = nextItems
    subcategoryMap.value = { ...subcategoryMap.value }
    persistSubcategories()
    return true
  }

  return {
    products,
    categories,
    isLoaded,
    loadProducts,
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
