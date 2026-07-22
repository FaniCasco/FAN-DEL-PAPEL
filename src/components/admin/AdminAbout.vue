<template>
  <div class="admin-about">
    <h2>Administrar 'Sobre Mí'</h2>

    <div v-if="isLoading" class="loading">Cargando datos...</div>
    <div v-else>
      <!-- Hero Section -->
      <div class="admin-section">
        <h3>Hero (Cabecera)</h3>
        <label>
          Título
          <input v-model="form.hero.title" type="text" />
        </label>
        <label>
          Subtítulo
          <input v-model="form.hero.subtitle" type="text" />
        </label>
        
        <label>
          Imagen de Cabecera (URL o archivo)
          <input v-model="form.hero.image" type="text" placeholder="https://..." />
          <input type="file" accept="image/*" @change="e => uploadHeroImage(e.target.files[0])" />
        </label>
        <p v-if="uploadingHero" class="info">Subiendo imagen...</p>
        <img v-if="form.hero.image" :src="form.hero.image" class="preview-img" alt="Hero preview" />
      </div>

      <hr />

      <!-- Sections -->
      <div class="admin-section">
        <h3>Secciones</h3>
        <div v-for="(section, index) in form.sections" :key="section.id || index" class="section-card">
          <div class="section-header">
            <h4>Sección {{ index + 1 }}</h4>
            <div>
              <button class="ghost small" @click="moveSection(index, -1)" :disabled="index === 0">↑</button>
              <button class="ghost small" @click="moveSection(index, 1)" :disabled="index === form.sections.length - 1">↓</button>
              <button class="danger small" @click="removeSection(index)">Eliminar</button>
            </div>
          </div>

          <label>
            Tipo
            <select v-model="section.type">
              <option value="text">Texto</option>
              <option value="list">Lista</option>
              <option value="image">Imagen</option>
              <option value="video">Video</option>
            </select>
          </label>

          <div v-if="section.type === 'text'">
            <label>
              Contenido
              <textarea v-model="section.content" rows="4"></textarea>
            </label>
          </div>

          <div v-if="section.type === 'list'">
            <label>Items de la lista (uno por línea)</label>
            <textarea :value="section.items ? section.items.join('\n') : ''" @input="e => updateListItems(section, e.target.value)" rows="4"></textarea>
          </div>

          <div v-if="section.type === 'image'">
            <label>
              URL o Archivo
              <input v-model="section.url" type="text" placeholder="https://..." />
              <input type="file" accept="image/*" @change="e => uploadSectionImage(e.target.files[0], section)" />
            </label>
            <p v-if="section.uploading" class="info">Subiendo imagen...</p>
            <label>
              Pie de foto (opcional)
              <input v-model="section.caption" type="text" />
            </label>
            <img v-if="section.url" :src="section.url" class="preview-img" alt="Preview" />
          </div>

          <div v-if="section.type === 'video'">
            <label>
              URL del video (YouTube o directo)
              <input v-model="section.url" type="text" placeholder="https://youtube.com/..." />
            </label>
          </div>
        </div>

        <button class="ghost" @click="addSection">+ Agregar Sección</button>
      </div>

      <div class="actions">
        <button class="primary" @click="save" :disabled="isSaving">
          {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
        <span v-if="feedback" class="feedback">{{ feedback }}</span>
        <span v-if="error" class="error">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAboutStore } from '@/stores/about'
import { uploadProductImage } from '@/lib/supabaseStorage'

const aboutStore = useAboutStore()

const isLoading = ref(true)
const isSaving = ref(false)
const feedback = ref('')
const error = ref('')

const uploadingHero = ref(false)

const form = ref({
  hero: { title: '', subtitle: '', image: '' },
  sections: []
})

onMounted(async () => {
  await aboutStore.fetchAboutContent()
  // clonar para edición
  form.value = JSON.parse(JSON.stringify({
    hero: aboutStore.hero,
    sections: aboutStore.sections
  }))
  isLoading.value = false
})

async function uploadHeroImage(file) {
  if (!file) return
  uploadingHero.value = true
  const res = await uploadProductImage(file, { slug: 'about-hero' })
  if (res.ok) {
    form.value.hero.image = res.url
  } else {
    alert('Error al subir: ' + res.error?.message)
  }
  uploadingHero.value = false
}

async function uploadSectionImage(file, section) {
  if (!file) return
  section.uploading = true
  const res = await uploadProductImage(file, { slug: 'about-section' })
  if (res.ok) {
    section.url = res.url
  } else {
    alert('Error al subir: ' + res.error?.message)
  }
  section.uploading = false
}

function updateListItems(section, text) {
  section.items = text.split('\n').filter(line => line.trim() !== '')
}

function addSection() {
  form.value.sections.push({
    id: Date.now().toString(),
    type: 'text',
    content: '',
    order: form.value.sections.length
  })
}

function removeSection(index) {
  if (confirm('¿Eliminar esta sección?')) {
    form.value.sections.splice(index, 1)
  }
}

function moveSection(index, dir) {
  const arr = form.value.sections
  const newIndex = index + dir
  if (newIndex < 0 || newIndex >= arr.length) return
  const temp = arr[index]
  arr[index] = arr[newIndex]
  arr[newIndex] = temp
  // update orders
  arr.forEach((s, i) => { s.order = i })
}

async function save() {
  isSaving.value = true
  feedback.value = ''
  error.value = ''
  
  // Update orders just in case
  form.value.sections.forEach((s, i) => { s.order = i })

  const result = await aboutStore.saveAboutContent(form.value)
  if (result.ok) {
    feedback.value = result.fallback ? 'Guardado localmente (sin conexión a BD).' : 'Cambios guardados con éxito.'
    setTimeout(() => { feedback.value = '' }, 3000)
  } else {
    error.value = result.error
  }
  isSaving.value = false
}
</script>

<style scoped>
.admin-about {
  max-width: 800px;
}
.admin-section {
  background: var(--color-bg-primary);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(192, 92, 62, 0.15);
}
.section-card {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: var(--radius-md);
  background: #fafafa;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.section-header h4 {
  margin: 0;
}
.preview-img {
  max-width: 100%;
  max-height: 200px;
  margin-top: 1rem;
  border-radius: var(--radius-sm);
  object-fit: contain;
}
.actions {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.feedback {
  color: green;
  font-weight: 500;
}
.error {
  color: red;
  font-weight: 500;
}
.info {
  font-size: 0.9rem;
  color: var(--color-primary);
}
textarea {
  width: 100%;
  padding: 0.5rem;
  font-family: inherit;
}
input[type="file"] {
  margin-top: 0.5rem;
}
</style>
