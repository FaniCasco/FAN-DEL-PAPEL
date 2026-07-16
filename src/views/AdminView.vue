<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useRouter } from 'vue-router'

const productsStore = useProductsStore()
const router = useRouter()
const selectedProductId = ref(null)
const editingProduct = ref(null)
const persistError = ref('')
const form = ref({
  nombre: '',
  slug: '',
  categoria: 'Papelería',
  subcategoria: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  destacado: false,
  nuevo: false,
})

// Lista unificada de imágenes del producto.
// Cada entrada es un string (data URL o URL externa).
// La posición 0 siempre es la imagen principal.
const productImageList = ref([])
const isUploadingImages = ref(false)

const products = computed(() => productsStore.products)
const categories = computed(() => productsStore.categories)
const subcategories = computed(() => productsStore.getSubcategories(form.value.categoria))

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

function clearCatalog() {
  if (!confirm('Esta acción vaciará todo el catálogo y no se puede deshacer. ¿Querés continuar?')) return
  productsStore.resetToSeed()
  // Remove saved data keys from localStorage as well
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('fan_del_papel_products')
      window.localStorage.removeItem('fan_del_papel_categories')
      window.localStorage.removeItem('fan_del_papel_subcategories')
    }
  } catch (e) {}
  resetForm()
  selectedProductId.value = null
  editingProduct.value = null
}

function logout() {
  // Clear admin flag and redirect to admin login
  sessionStorage.removeItem('isAdmin')
  window.dispatchEvent(new Event('admin-status-changed'))
  selectedProductId.value = null
  editingProduct.value = null
  resetForm()
  router.push({ name: 'AdminLogin' })
}

async function compressImageFile(file, { maxSide = 1400, quality = 0.82, type = 'image/webp' } = {}) {
  // Reduce tamaño antes de persistir en localStorage (evita superar cuota)
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'))
    reader.readAsDataURL(file)
  })

  const img = await new Promise((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    el.src = dataUrl
  })

  const w = img.naturalWidth || img.width || 1
  const h = img.naturalHeight || img.height || 1
  const scale = Math.min(1, maxSide / Math.max(w, h))
  const targetW = Math.max(1, Math.round(w * scale))
  const targetH = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) return dataUrl

  ctx.drawImage(img, 0, 0, targetW, targetH)
  try {
    return canvas.toDataURL(type, quality)
  } catch (_) {
    // Fallback si el browser no soporta webp/quality
    return canvas.toDataURL('image/jpeg', 0.85)
  }
}

async function handleFileUpload(event) {
  const files = event.target.files
  if (!files?.length) return

  persistError.value = ''
  isUploadingImages.value = true
  try {
    for (const file of Array.from(files)) {
      const compressed = await compressImageFile(file)
      if (compressed) productImageList.value.push(compressed)
    }
  } catch {
    persistError.value = 'No se pudo procesar una de las imágenes. Probá con otra.'
  } finally {
    isUploadingImages.value = false
    event.target.value = ''
  }
}

// Mueve la imagen en `index` a la posición 0 (la hace principal)
function setMainImage(index) {
  if (index === 0) return
  const [main] = productImageList.value.splice(index, 1)
  productImageList.value.unshift(main)
}

function removeImage(index) {
  productImageList.value.splice(index, 1)
}

// Agrega un campo para URL externa
const newImageUrl = ref('')
function addImageUrl() {
  const url = newImageUrl.value.trim()
  if (!url) return
  productImageList.value.push(url)
  newImageUrl.value = ''
}

function resetForm() {
  form.value = {
    nombre: '',
    slug: '',
    categoria: categories.value.length ? categories.value[0] : 'Papelería',
    subcategoria: '',
    descripcion: '',
    precio: 0,
    stock: 0,
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
    ? product.imagenes.filter(Boolean)
    : []
  newImageUrl.value = ''
  form.value = {
    nombre: product.nombre,
    slug: product.slug,
    categoria: product.categoria,
    subcategoria: product.subcategoria || '',
    descripcion: product.descripcion,
    precio: product.precio,
    stock: product.stock,
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
    persistError.value = 'Esperá a que terminen de cargar las imágenes antes de guardar.'
    return
  }

  persistError.value = ''
  const nombre = String(form.value.nombre).trim()
  if (!nombre) {
    persistError.value = 'Ingresá un nombre para el producto.'
    return
  }

  const payload = {
    ...form.value,
    nombre,
    slug: form.value.slug || undefined,
    // Filtramos strings vacíos o corruptos antes de guardar
    imagenes: productImageList.value.filter((img) => typeof img === 'string' && img.length > 10),
  }

  let result
  if (editingProduct.value) {
    result = productsStore.updateProduct(editingProduct.value.id, payload)
    if (!result) {
      persistError.value = 'No se encontró el producto a editar.'
      return
    }
    if (!result.persistResult?.ok) {
      persistError.value =
        'No se pudo guardar en el navegador. Probá con imágenes más chicas o usá URLs en lugar de subir archivos.'
      return
    }
    saveFeedback.value = 'Producto actualizado correctamente.'
  } else {
    result = productsStore.addProduct(payload)
    if (!result.persistResult?.ok) {
      persistError.value =
        'No se pudo guardar en el navegador. Probá con imágenes más chicas o usá URLs en lugar de subir archivos.'
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
    'No se pudo guardar porque el almacenamiento del navegador se llenó (pasa con imágenes pesadas). Probá con menos imágenes o más livianas.'
}

onMounted(() => {
  window.addEventListener('fan-del-papel:persist-error', onPersistError)
})

onUnmounted(() => {
  window.removeEventListener('fan-del-papel:persist-error', onPersistError)
})

function removeProduct(id) {
  if (confirm('¿Querés eliminar este producto?')) {
    productsStore.removeProduct(id)
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

function deleteCategory(name) {
  if (!confirm(`¿Querés eliminar la categoría "${name}"? Los productos asociados pasarán a otra categoría.`)) return
  productsStore.removeCategory(name)
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

function updateCategoryName() {
  if (!categoryEdit.value) return
  const name = String(categoryEditName.value).trim()
  if (!name) {
    categoryError.value = 'Ingresa un nombre de categoría válido.'
    return
  }
  const updated = productsStore.updateCategory(categoryEdit.value, name)
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
    <div class="admin-shell">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <h2>Administración</h2>
          <RouterLink to="/catalogo" class="back-button">← Volver al catálogo</RouterLink>
          <button class="ghost" @click="logout">Cerrar sesión</button>
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

          <label>
            Stock
            <input v-model.number="form.stock" type="number" min="0" />
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

          <!-- Lista unificada de imágenes -->
          <div v-if="productImageList.length" class="unified-image-list">
            <p class="images-hint">La primera imagen es la <strong>principal</strong>. Hacé click en ⭐ para cambiarla.</p>
            <div class="preview-grid">
              <div
                v-for="(image, index) in productImageList"
                :key="`img-${index}`"
                class="preview-item"
                :class="{ 'is-main': index === 0 }"
              >
                <div class="preview-badge" v-if="index === 0">⭐ Principal</div>
                <img :src="image" alt="Imagen del producto" />
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

          <p v-else class="images-empty-hint">Aún no hay imágenes. Subí archivos o agregá una URL.</p>
          <p v-if="isUploadingImages" class="form-hint">⏳ Cargando imágenes...</p>
        </div>

        <div class="actions">
          <button type="button" class="primary" @click="saveProduct">Guardar cambios</button>
          <button type="button" v-if="editingProduct" class="danger" @click="removeProduct(editingProduct.id)">Eliminar</button>
        </div>
        <p v-if="saveFeedback" class="save-feedback">{{ saveFeedback }}</p>
        <p v-if="persistError" class="form-error">{{ persistError }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-page {
  background: var(--color-background);
  min-height: 100vh;
  padding: 2rem 0;
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
}
.product-item:hover {
  transform: translateX(2px);
}
.product-item.active {
  outline: 2px solid var(--color-primary);
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
