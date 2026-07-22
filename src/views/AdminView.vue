<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import {
  deleteSupabaseStorageUrls,
  isSupabaseStorageUrl,
  uploadProductImage,
} from '@/lib/supabaseStorage'
import { useRouter } from 'vue-router'
import AdminOrders from '@/components/admin/AdminOrders.vue'
import AdminAbout from '@/components/admin/AdminAbout.vue'
import AdminMessages from '@/components/admin/AdminMessages.vue'
import { useMessagesStore } from '@/stores/messages'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const messagesStore = useMessagesStore()
const router = useRouter()
const activeSection = ref(null)
const selectedProductId = ref(null)
const editingProduct = ref(null)
const persistError = ref('')
const form = ref({
  nombre: '',
  slug: '',
  categoria: '',
  subcategoria: '',
  descripcion: '',
  precio: 0,
  destacado: false,
  nuevo: false,
})

// Lista unificada de imágenes del producto.
// Cada entrada es un string (data URL o URL externa).
// La posición 0 siempre es la imagen principal.
const productImageList = ref([])
const isUploadingImages = ref(false)

const products = computed(() => productsStore.products)
const ordersCount = computed(() => ordersStore.orders.length)
const categories = computed(() => productsStore.categories)
const subcategories = computed(() => productsStore.getSubcategories(form.value.categoria))
const unreadMessagesCount = computed(() => messagesStore.unreadCount)

watch(
  () => form.value.categoria,
  (categoria) => {
    if (!categoria) {
      form.value.subcategoria = ''
      return
    }

    const options = productsStore.getSubcategories(categoria)
    if (form.value.subcategoria && !options.includes(form.value.subcategoria)) {
      form.value.subcategoria = ''
    }
  }
)

const saveFeedback = ref('')
const newCategory = ref('')
const categoryEdit = ref(null)
const categoryEditName = ref('')
const categoryError = ref('')
const selectedCategoryForSubcategories = ref(null)
const newSubcategory = ref('')
const subcategoryError = ref('')

function getPersistErrorMessage(error, fallback) {
  if (!error) return fallback
  if (typeof error === 'string') return error
  return error.message || fallback
}

function createUrlImageEntry(url) {
  return {
    kind: 'url',
    value: url,
  }
}

function createFileImageEntry(file) {
  return {
    kind: 'file',
    file,
    previewUrl: URL.createObjectURL(file),
  }
}

function getImageSource(image) {
  if (!image) return ''
  if (typeof image === 'string') return image
  return image.kind === 'file' ? image.previewUrl : image.value
}

function revokeImageEntryPreview(image) {
  if (image?.kind === 'file' && image.previewUrl) {
    URL.revokeObjectURL(image.previewUrl)
  }
}

function clearImageEntries(entries = []) {
  entries.forEach((entry) => revokeImageEntryPreview(entry))
}

function getStorageImageUrls(images = []) {
  return images.filter((image) => typeof image === 'string' && isSupabaseStorageUrl(image))
}

async function clearCatalog() {
  if (!confirm('Esta acción vaciará todo el catálogo y no se puede deshacer. ¿Querés continuar?')) return
  const productImagesToDelete = products.value.flatMap((product) => getStorageImageUrls(product.imagenes))
  const result = await productsStore.resetToSeed()
  if (!result?.ok) {
    persistError.value = getPersistErrorMessage(
      result?.error,
      'No se pudo vaciar el catalogo en Supabase.'
    )
    return
  }
  if (productImagesToDelete.length) {
    const cleanupResult = await deleteSupabaseStorageUrls(productImagesToDelete)
    if (!cleanupResult.ok) {
      console.warn('No se pudieron borrar algunas imágenes del Storage:', cleanupResult.error)
    }
  }
  resetForm()
  selectedProductId.value = null
  editingProduct.value = null
}

function logout() {
  sessionStorage.removeItem('isAdmin')
  window.dispatchEvent(new Event('admin-status-changed'))
  activeSection.value = null
  selectedProductId.value = null
  editingProduct.value = null
  resetForm()
  router.push({ name: 'AdminLogin' })
}

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files?.length) return

  persistError.value = ''
  try {
    for (const file of Array.from(files)) {
      productImageList.value.push(createFileImageEntry(file))
    }
  } catch {
    persistError.value = 'No se pudo procesar una de las imágenes. Probá con otra.'
  }
  event.target.value = ''
}

// Mueve la imagen en `index` a la posición 0 (la hace principal)
function setMainImage(index) {
  if (index === 0) return
  const [main] = productImageList.value.splice(index, 1)
  productImageList.value.unshift(main)
}

function removeImage(index) {
  revokeImageEntryPreview(productImageList.value[index])
  productImageList.value.splice(index, 1)
}

// Agrega un campo para URL externa
const newImageUrl = ref('')
function addImageUrl() {
  const url = newImageUrl.value.trim()
  if (!url) return
  productImageList.value.push(createUrlImageEntry(url))
  newImageUrl.value = ''
}

function resetForm() {
  clearImageEntries(productImageList.value)
  form.value = {
    nombre: '',
    slug: '',
    categoria: categories.value.length ? categories.value[0] : '',
    subcategoria: '',
    descripcion: '',
    precio: 0,
    destacado: false,
    nuevo: false,
  }
  productImageList.value = []
  newImageUrl.value = ''
}

function startCreate() {
  editingProduct.value = null
  selectedProductId.value = null
  resetForm()
}

function startEdit(product) {
  editingProduct.value = product
  selectedProductId.value = product.id
  // Cargar imágenes directamente en la lista unificada (sin separar por tipo)
  productImageList.value = Array.isArray(product.imagenes)
    ? product.imagenes.filter(Boolean).map((image) => createUrlImageEntry(image))
    : []
  newImageUrl.value = ''
  form.value = {
    nombre: product.nombre,
    slug: product.slug,
    categoria: product.categoria,
    subcategoria: product.subcategoria || '',
    descripcion: product.descripcion,
    precio: product.precio,
    destacado: Boolean(product.destacado),
    nuevo: Boolean(product.nuevo),
  }
}

function addImageField() {
  // Mantenida por compatibilidad — ahora se usa addImageUrl()
  addImageUrl()
}

function removeImageField() {}

async function saveProduct() {
  if (isUploadingImages.value) {
    persistError.value = 'Esperá a que terminen de procesarse las imágenes antes de guardar.'
    return
  }

  persistError.value = ''
  const nombre = String(form.value.nombre).trim()
  if (!nombre) {
    persistError.value = 'Ingresá un nombre para el producto.'
    return
  }

  const previousImages = Array.isArray(editingProduct.value?.imagenes)
    ? [...editingProduct.value.imagenes]
    : []

  isUploadingImages.value = true
  const uploadedImages = []
  const imageUrls = []

  try {
    for (const [index, image] of productImageList.value.entries()) {
      if (typeof image === 'string') {
        const trimmed = image.trim()
        if (trimmed) imageUrls.push(trimmed)
        continue
      }

      if (image.kind === 'file') {
        const uploadResult = await uploadProductImage(image.file, {
          slug: form.value.slug || nombre,
          index,
        })

        if (!uploadResult.ok) {
          await deleteSupabaseStorageUrls(uploadedImages)
          persistError.value = getPersistErrorMessage(uploadResult.error, 'No se pudo subir una imagen.')
          return
        }

        imageUrls.push(uploadResult.url)
        uploadedImages.push(uploadResult.url)
        continue
      }

      if (typeof image.value === 'string' && image.value.trim()) {
        imageUrls.push(image.value.trim())
      }
    }
  } catch (error) {
    await deleteSupabaseStorageUrls(uploadedImages)
    persistError.value = getPersistErrorMessage(error, 'No se pudo procesar una de las imágenes.')
    return
  } finally {
    isUploadingImages.value = false
  }

  const payload = {
    ...form.value,
    nombre,
    slug: form.value.slug || undefined,
    imagenes: imageUrls,
  }

  let result
  if (editingProduct.value) {
    result = await productsStore.updateProduct(editingProduct.value.id, payload)
    if (!result) {
      await deleteSupabaseStorageUrls(uploadedImages)
      persistError.value = 'No se encontró el producto a editar.'
      return
    }
    if (!result.persistResult?.ok) {
      await deleteSupabaseStorageUrls(uploadedImages)
      persistError.value = getPersistErrorMessage(
        result.persistResult?.error,
        'No se pudo guardar en Supabase.'
      )
      return
    }
    const previousStorageImages = getStorageImageUrls(previousImages)
    const nextStorageImages = getStorageImageUrls(imageUrls)
    const removedImages = previousStorageImages.filter((url) => !nextStorageImages.includes(url))
    if (removedImages.length) {
      const cleanupResult = await deleteSupabaseStorageUrls(removedImages)
      if (!cleanupResult.ok) {
        console.warn('No se pudieron borrar algunas imágenes reemplazadas:', cleanupResult.error)
      }
    }
    saveFeedback.value = 'Producto actualizado correctamente.'
  } else {
    result = await productsStore.addProduct(payload)
    if (!result.persistResult?.ok) {
      await deleteSupabaseStorageUrls(uploadedImages)
      persistError.value = getPersistErrorMessage(
        result.persistResult?.error,
        'No se pudo guardar en Supabase.'
      )
      return
    }
    saveFeedback.value = 'Producto agregado correctamente.'
  }

  resetForm()
  editingProduct.value = null
  selectedProductId.value = null
  setTimeout(() => { saveFeedback.value = '' }, 3000)
}

function onPersistError() {
  persistError.value =
    'No se pudo guardar la cache local del navegador.'
}

onMounted(() => {
  window.addEventListener('fan-del-papel:persist-error', onPersistError)
  ordersStore.loadOrders()
})

function openSection(section) {
  activeSection.value = section
}

function backToDashboard() {
  activeSection.value = null
  selectedProductId.value = null
  editingProduct.value = null
  resetForm()
}

onUnmounted(() => {
  window.removeEventListener('fan-del-papel:persist-error', onPersistError)
  clearImageEntries(productImageList.value)
})

async function removeProduct(id) {
  if (confirm('¿Querés eliminar este producto?')) {
    const result = await productsStore.removeProduct(id)
    if (!result?.persistResult?.ok) {
      persistError.value = getPersistErrorMessage(
        result?.persistResult?.error,
        'No se pudo eliminar en Supabase.'
      )
      return
    }
    const imagesToDelete = getStorageImageUrls(result.product?.imagenes || [])
    if (imagesToDelete.length) {
      const cleanupResult = await deleteSupabaseStorageUrls(imagesToDelete)
      if (!cleanupResult.ok) {
        console.warn('No se pudieron borrar algunas imágenes del producto:', cleanupResult.error)
      }
    }
    if (selectedProductId.value === id) {
      resetForm()
      selectedProductId.value = null
      editingProduct.value = null
    }
  }
}

function selectCategoryForSubcategories(category) {
  selectedCategoryForSubcategories.value = category
  newSubcategory.value = ''
  subcategoryError.value = ''
}

function addSubcategory() {
  if (!selectedCategoryForSubcategories.value) {
    subcategoryError.value = 'Seleccioná una categoría primero.'
    return
  }
  const name = String(newSubcategory.value).trim()
  if (!name) {
    subcategoryError.value = 'Ingresa un nombre de subcategoría válido.'
    return
  }
  const added = productsStore.addSubcategory(selectedCategoryForSubcategories.value, name)
  if (!added) {
    subcategoryError.value = 'La subcategoría ya existe o no es válida.'
    return
  }
  newSubcategory.value = ''
  subcategoryError.value = ''
}

function removeSubcategory(category, subcategory) {
  if (!confirm(`¿Querés eliminar la subcategoría "${subcategory}" de ${category}?`)) return
  productsStore.removeSubcategory(category, subcategory)
}

async function deleteCategory(name) {
  if (!confirm(`¿Querés eliminar la categoría "${name}"? Los productos asociados pasarán a otra categoría.`)) return
  const result = await productsStore.removeCategory(name)
  if (!result) {
    categoryError.value = 'No se pudo eliminar la categoria.'
    return
  }
  if (selectedCategoryForSubcategories.value === name) {
    selectedCategoryForSubcategories.value = null
  }
}

function formatPrice(value) {
  return `$${Number(value).toLocaleString('es-AR')}`
}

function editCategory(category) {
  categoryEdit.value = category
  categoryEditName.value = category
  categoryError.value = ''
}

function cancelCategoryEdit() {
  categoryEdit.value = null
  categoryEditName.value = ''
  categoryError.value = ''
}

function addCategory() {
  const name = String(newCategory.value).trim()
  if (!name) {
    categoryError.value = 'Ingresa un nombre de categoría válido.'
    return
  }
  const added = productsStore.addCategory(name)
  if (!added) {
    categoryError.value = 'La categoría ya existe o el nombre no es válido.'
    return
  }
  newCategory.value = ''
  categoryError.value = ''
}

async function updateCategoryName() {
  if (!categoryEdit.value) return
  const name = String(categoryEditName.value).trim()
  if (!name) {
    categoryError.value = 'Ingresa un nombre de categoría válido.'
    return
  }
  const updated = await productsStore.updateCategory(categoryEdit.value, name)
  if (!updated) {
    categoryError.value = 'No se pudo actualizar la categoría. Revisa que no exista otro nombre igual.'
    return
  }
  if (selectedCategoryForSubcategories.value === categoryEdit.value) {
    selectedCategoryForSubcategories.value = name
  }
  categoryEdit.value = null
  categoryEditName.value = ''
  categoryError.value = ''
}
</script>

<template>
  <section class="admin-page">
    <div class="admin-dashboard">
      <header class="dashboard-header">
        <div>
          <h1>Panel de administración</h1>
          <RouterLink to="/catalogo" class="back-button">← Volver al catálogo</RouterLink>
        </div>
        <button class="ghost" @click="logout">Cerrar sesión</button>
      </header>

      <div v-if="!activeSection" class="dashboard-home">
        <p class="dashboard-intro">Elegí qué querés administrar:</p>
        <div class="dashboard-cards">
          <button type="button" class="dashboard-card" @click="openSection('catalog')">
            <span class="card-icon" aria-hidden="true">📦</span>
            <h2>Administrar catálogo</h2>
            <p>Agregá categorías, subcategorías y productos.</p>
            <span class="card-meta">{{ categories.length }} categorías · {{ products.length }} productos</span>
          </button>
          <button type="button" class="dashboard-card" @click="openSection('orders')">
            <span class="card-icon" aria-hidden="true">📋</span>
            <h2>Pedidos</h2>
            <p>Ver, editar, eliminar y marcar si está pagado.</p>
            <span class="card-meta">{{ ordersCount }} pedidos registrados</span>
          </button>
          <button type="button" class="dashboard-card" @click="openSection('about')">
            <span class="card-icon" aria-hidden="true">👤</span>
            <h2>Sobre Mí</h2>
            <p>Editar la cabecera y el contenido de la sección.</p>
          </button>
          <button type="button" class="dashboard-card" @click="openSection('messages')">
            <span class="card-icon" aria-hidden="true">✉️</span>
            <h2>Mensajes</h2>
            <p>Leer y responder consultas.</p>
            <span class="card-meta" v-if="unreadMessagesCount > 0">{{ unreadMessagesCount }} nuevos</span>
          </button>
        </div>
      </div>

      <template v-else>
        <nav class="dashboard-nav">
          <button type="button" class="ghost back-dashboard" @click="backToDashboard">← Dashboard</button>
          <button
            type="button"
            class="nav-tab"
            :class="{ active: activeSection === 'catalog' }"
            @click="openSection('catalog')"
          >
            Administrar catálogo
          </button>
          <button
            type="button"
            class="nav-tab"
            :class="{ active: activeSection === 'orders' }"
            @click="openSection('orders')"
          >
            Pedidos
          </button>
          <button
            type="button"
            class="nav-tab"
            :class="{ active: activeSection === 'about' }"
            @click="openSection('about')"
          >
            Sobre Mí
          </button>
          <button
            type="button"
            class="nav-tab"
            :class="{ active: activeSection === 'messages' }"
            @click="openSection('messages')"
          >
            Mensajes
            <span v-if="unreadMessagesCount > 0" class="badge-tab">{{ unreadMessagesCount }}</span>
          </button>
        </nav>

        <div v-if="activeSection === 'orders'" class="section-panel">
          <AdminOrders :active="activeSection === 'orders'" />
        </div>

        <div v-else-if="activeSection === 'about'" class="section-panel">
          <AdminAbout />
        </div>

        <div v-else-if="activeSection === 'messages'" class="section-panel">
          <AdminMessages />
        </div>

        <div v-else class="admin-shell">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h2>Catálogo</h2>
        </div>

        <button type="button" class="primary" @click="startCreate">+ Nuevo producto</button>
        <button type="button" class="ghost" @click="clearCatalog">Vaciar catálogo</button>

        <section class="category-manager">
          <h3>Categorías</h3>
          <div class="category-actions">
            <input v-model="newCategory" placeholder="Nueva categoría" />
            <button type="button" class="primary" @click="addCategory">Agregar</button>
          </div>
          <div class="category-list-admin">
            <div v-for="category in categories" :key="category" class="category-entry">
              <div>
                <strong>{{ category }}</strong>
                <div class="category-meta">
                  <button type="button" class="ghost small" @click="selectCategoryForSubcategories(category)">Subcategorías</button>
                </div>
              </div>
              <div class="category-entry-actions">
                <button type="button" class="ghost" @click="editCategory(category)">Editar</button>
                <button type="button" class="icon-button" @click="deleteCategory(category)" aria-label="Eliminar categoría">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div v-if="categoryEdit" class="category-edit-form">
            <label>
              Editar categoría:
              <input v-model="categoryEditName" />
            </label>
            <div class="category-edit-actions">
              <button type="button" class="primary" @click="updateCategoryName">Guardar</button>
              <button type="button" class="ghost" @click="cancelCategoryEdit">Cancelar</button>
            </div>
          </div>

          <div v-if="selectedCategoryForSubcategories" class="subcategory-manager">
            <h4>Subcategorías de {{ selectedCategoryForSubcategories }}</h4>
            <div class="subcategory-actions">
              <input v-model="newSubcategory" placeholder="Nueva subcategoría" />
              <button type="button" class="primary" @click="addSubcategory">Agregar</button>
            </div>
            <div class="subcategory-list-admin">
              <div
                v-for="sub in productsStore.getSubcategories(selectedCategoryForSubcategories)"
                :key="sub"
                class="subcategory-entry"
              >
                <span>{{ sub }}</span>
                <button type="button" class="danger small" @click="removeSubcategory(selectedCategoryForSubcategories, sub)">Eliminar</button>
              </div>
            </div>
            <button type="button" class="ghost small" @click="selectedCategoryForSubcategories = null">Cerrar subcategorías</button>
          </div>

          <p v-if="categoryError" class="form-error">{{ categoryError }}</p>
          <p v-if="subcategoryError" class="form-error">{{ subcategoryError }}</p>
        </section>

        <div class="product-list">
          <button
            v-for="product in products"
            :key="product.id"
            class="product-item"
            :class="{ active: selectedProductId === product.id }"
            @click="startEdit(product)"
          >
            <span>{{ product.nombre }}</span>
            <small>{{ product.categoria }}</small>
          </button>
        </div>
      </div>

      <div class="admin-content">
        <h2>{{ editingProduct ? 'Editar producto' : 'Crear producto' }}</h2>

        <div class="form-grid">
          <label>
            Nombre
            <input v-model="form.nombre" placeholder="Nombre del producto" />
          </label>

          <label>
            Slug
            <input v-model="form.slug" placeholder="slug-del-producto" />
          </label>

          <label>
            Categoría
            <select v-model="form.categoria">
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </label>

          <label>
            Subcategoría
            <div class="subcategory-field">
              <select v-model="form.subcategoria">
                <option value="">Sin subcategoría</option>
                <option
                  v-for="sub in subcategories"
                  :key="sub"
                  :value="sub"
                >
                  {{ sub }}
                </option>
              </select>
              <input v-model="form.subcategoria" placeholder="O escribe una nueva" />
            </div>
          </label>

          <label>
            Precio
            <input v-model.number="form.precio" type="number" min="0" />
          </label>

          <label class="checkbox">
            <input v-model="form.destacado" type="checkbox" />
            Destacado
          </label>

          <label class="checkbox">
            <input v-model="form.nuevo" type="checkbox" />
            Nuevo
          </label>
        </div>

        <label>
          Descripción
          <textarea v-model="form.descripcion" rows="4" />
        </label>

        <div class="images-section">
          <div class="images-header">
            <h3>Imágenes del producto</h3>
            <div class="image-actions">
              <label class="file-upload">
                <input type="file" accept="image/*" multiple @change="handleFileUpload" />
                📁 Subir desde archivo
              </label>
            </div>
          </div>

          <!-- Agregar imagen por URL -->
          <div class="url-input-row">
            <input v-model="newImageUrl" placeholder="URL de imagen (https://...)" @keyup.enter="addImageUrl" />
            <button class="ghost" type="button" @click="addImageUrl">Agregar URL</button>
          </div>

          <!-- Lista unificada de imagenes -->
          <div v-if="productImageList.length" class="unified-image-list">
            <p class="images-hint">La primera imagen es la <strong>principal</strong>. Hacé click en ⭐ para cambiarla.</p>
            <div class="preview-grid">
              <div
                v-for="(image, index) in productImageList"
                :key="typeof image === 'string' ? image : image.kind === 'file' ? image.previewUrl : image.value"
                class="preview-item"
                :class="{ 'is-main': index === 0 }"
              >
                <div class="preview-badge" v-if="index === 0">⭐ Principal</div>
                <img :src="getImageSource(image)" alt="Imagen del producto" />
                <div class="preview-controls">
                  <button
                    v-if="index !== 0"
                    class="ghost small"
                    type="button"
                    @click="setMainImage(index)"
                    title="Hacer imagen principal"
                  >⭐ Principal</button>
                  <button class="danger small" type="button" @click="removeImage(index)">Eliminar</button>
                </div>
              </div>
            </div>
          </div>

          <p v-else class="images-empty-hint">Aún no hay imagenes. Subí archivos o agregá una URL.</p>
          <p v-if="isUploadingImages" class="form-hint">⏳ Cargando imagenes...</p>
        </div>

        <div class="actions">
          <button type="button" class="primary" @click="saveProduct">Guardar cambios</button>
          <button type="button" v-if="editingProduct" class="danger" @click="removeProduct(editingProduct.id)">Eliminar</button>
        </div>
        <p v-if="saveFeedback" class="save-feedback">{{ saveFeedback }}</p>
        <p v-if="persistError" class="form-error">{{ persistError }}</p>
      </div>
      </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  background: var(--color-background);
  min-height: 100vh;
  padding: 2rem 0;
}
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  gap: 1.5rem;
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.dashboard-header h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
}
.dashboard-nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
}
.back-dashboard {
  margin-right: auto;
}
.dashboard-home {
  display: grid;
  gap: 1.25rem;
}
.dashboard-intro {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1.05rem;
}
.dashboard-cards {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
}
.dashboard-card {
  display: grid;
  gap: 0.65rem;
  text-align: left;
  padding: 1.5rem;
  border: 1px solid rgba(192, 92, 62, 0.15);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(75, 75, 75, 0.08);
  border-color: rgba(192, 92, 62, 0.25);
}
.badge-tab {
  background: var(--color-primary);
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  margin-left: 0.5rem;
}
.nav-tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.dashboard-card h2 {
  margin: 0;
  font-size: 1.35rem;
  color: var(--color-text);
}
.dashboard-card p {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.card-icon {
  font-size: 1.75rem;
}
.card-meta {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
}
.section-panel {
  background: var(--color-bg-primary);
  border: 1px solid rgba(192, 92, 62, 0.15);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}
.nav-tab {
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: white;
  color: var(--color-text);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.nav-tab.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
.login-card, .admin-shell {
  background: var(--color-bg-primary);
  border: 1px solid rgba(192, 92, 62, 0.15);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
}
.login-card {
  max-width: 480px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
}
.login-card input, .admin-content input, .admin-content textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
button {
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-weight: 600;
  
}
.file-upload {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  cursor: pointer;
}
.file-upload input {
  display: none;
}
.image-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.image-previews {
  margin-top: 1rem;
}
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}
.preview-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: white;
  display: grid;
  gap: 0.35rem;
}
.preview-item img {
  width: 100%;
  height: 100px;
  object-fit: cover;
}
.uploaded-images {
  display: grid;
  gap: 0.75rem;
}
.form-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
.primary { background: var(--color-primary); color: white; }
.ghost { background: var(--color-bg-secondary); color: var(--color-text); }
.danger { background: #b33a3a; color: white; }
.admin-shell {
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr;
  gap: 2rem;
}
.admin-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 0.2rem;
}
.category-manager {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.85rem;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}
.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.sidebar-header h2 {
  margin: 0;
  font-size: 1.3rem;
}
.sidebar-header .back-button,
.sidebar-header button {
  width: 100%;
}
.category-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}
.category-actions input {
  width: 100%;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.category-actions button {
  white-space: nowrap;
}
.category-list-admin {
  display: grid;
  gap: 0.55rem;
}
.category-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.category-entry > div:first-child {
  min-width: 0;
}
.category-meta {
  margin-top: 0.35rem;
}
.category-entry-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-danger);
  cursor: pointer;
  width: 34px;
  height: 34px;
  padding: 0.25rem;
  border-radius: 999px;
  transition: background 0.2s ease;
  
}
.icon-button:hover {
  background: rgba(179, 58, 58, 0.12);
}
.category-edit-form {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: var(--radius-sm);
}
.category-edit-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.subcategory-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
}
.subcategory-actions input {
  width: 100%;
  min-width: 0;
  padding: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.subcategory-list-admin {
  display: grid;
  gap: 0.5rem;
}
.subcategory-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.7rem 0.85rem;
  background: white;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.form-error {
  color: var(--color-danger);
  font-size: 0.95rem;
  margin: 0;
}
.product-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--color-bg-secondary);
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  text-align: left;
  transition: var(--transition);
  color: var(--color-text);
}
.product-item:hover {
  transform: translateX(2px);
}
.product-item.active {
  outline: 2px solid var(--color-primary);
}
.product-item small {
  color: var(--color-primary-hover);
}
.admin-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}
.form-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(320px, 1fr));
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-weight: 600;
}
label input,
label select,
label textarea {
  width: 100%;
  min-width: 0;
}
.subcategory-field {
  display: grid;
  gap: 0.75rem;
}
.subcategory-field select {
  width: 100%;
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.6rem;
}
.images-section { display: grid; gap: 1rem; }
.images-header { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.image-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start; }
.image-row input { flex: 1 1 220px; min-width: 0; }
.actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
.save-feedback {
  color: var(--color-success);
  font-weight: 600;
}
@media (max-width: 1100px) {
  .form-grid { grid-template-columns: 1fr; }
  .category-actions,
  .subcategory-actions {
    grid-template-columns: 1fr;
  }
  .category-actions button,
  .subcategory-actions button,
  .sidebar-header .back-button,
  .sidebar-header button {
    width: 100%;
  }
}
@media (max-width: 900px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
  .admin-shell { grid-template-columns: 1fr; }
  .admin-sidebar {
    order: 2;
  }
  .admin-content {
    order: 1;
  }
  .category-entry,
  .subcategory-entry,
  .image-row {
    flex-direction: column;
    align-items: stretch;
  }
  .category-entry-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>


