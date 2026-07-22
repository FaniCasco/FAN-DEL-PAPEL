<template>
  <div class="about-page">
    <section class="about-hero" :style="{ backgroundImage: hero.image ? `url(${hero.image})` : 'none' }">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>{{ hero.title }}</h1>
        <p v-if="hero.subtitle" class="subtitle">{{ hero.subtitle }}</p>
      </div>
    </section>

    <div class="about-content">
      <div v-if="isLoading" class="loading-state">
        Cargando...
      </div>
      
      <div v-else class="sections">
        <div v-for="section in sortedSections" :key="section.id" class="about-section">
          <div v-if="section.type === 'text'" class="text-section">
            <p>{{ section.content }}</p>
          </div>
          
          <div v-else-if="section.type === 'list'" class="list-section">
            <ul>
              <li v-for="(item, index) in section.items" :key="index">{{ item }}</li>
            </ul>
          </div>

          <div v-else-if="section.type === 'image'" class="image-section">
            <img :src="section.url" :alt="section.caption || 'Imagen sobre mi'" />
            <p v-if="section.caption" class="caption">{{ section.caption }}</p>
          </div>

          <div v-else-if="section.type === 'video'" class="video-section">
            <iframe
              v-if="isYoutubeUrl(section.url)"
              :src="getYoutubeEmbedUrl(section.url)"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
            <video v-else :src="section.url" controls></video>
          </div>
        </div>
      </div>

      <section class="cta-section">
        <h2>¿Querés saber más o hacer un pedido personalizado?</h2>
        
        <form @submit.prevent="submitForm" class="contact-form">
          <div class="form-group">
            <label for="name">Nombre</label>
            <input id="name" v-model="form.name" required placeholder="Tu nombre" />
          </div>
          <div class="form-group">
            <label for="phone">WhatsApp de contacto (para responderte)</label>
            <input id="phone" type="text" v-model="form.phone" required placeholder="Ej: 11 1234 5678 o +54 9 11 1234 5678" />
          </div>
          <div class="form-group">
            <label for="message">Mensaje</label>
            <textarea id="message" v-model="form.message" required rows="4" placeholder="¿En qué te puedo ayudar?"></textarea>
          </div>
          
          <button type="submit" class="cta-btn submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Enviando...' : 'Enviar Mensaje' }}
          </button>
          
          <p v-if="submitFeedback" class="feedback" :class="{ error: submitError }">
            {{ submitFeedback }}
          </p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAboutStore } from '@/stores/about'
import { useMessagesStore } from '@/stores/messages'

const aboutStore = useAboutStore()
const messagesStore = useMessagesStore()

const hero = computed(() => aboutStore.hero)
const sections = computed(() => aboutStore.sections)
const isLoading = computed(() => aboutStore.isLoading)

const sortedSections = computed(() => {
  return [...sections.value].sort((a, b) => (a.order || 0) - (b.order || 0))
})

onMounted(() => {
  aboutStore.fetchAboutContent()
})

const form = ref({ name: '', phone: '', message: '' })
const isSubmitting = ref(false)
const submitFeedback = ref('')
const submitError = ref(false)

async function submitForm() {
  if (!form.value.name || !form.value.phone || !form.value.message) return
  
  isSubmitting.value = true
  submitFeedback.value = ''
  submitError.value = false
  
  const result = await messagesStore.sendMessage(form.value)
  isSubmitting.value = false
  
  if (result.ok) {
    submitFeedback.value = '¡Mensaje enviado correctamente! Me pondré en contacto pronto.'
    form.value = { name: '', phone: '', message: '' }
    setTimeout(() => { submitFeedback.value = '' }, 5000)
  } else {
    submitError.value = true
    submitFeedback.value = 'Hubo un error al enviar el mensaje. Intentá nuevamente.'
  }
}

function isYoutubeUrl(url) {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function getYoutubeEmbedUrl(url) {
  if (!url) return ''
  try {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]
    return `https://www.youtube.com/embed/${videoId}`
  } catch (e) {
    return url
  }
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: var(--color-background);
}

.about-hero {
  position: relative;
  height: 40vh;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-size: cover;
  background-position: center;
  background-color: var(--color-primary);
  color: #ffffff;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.2) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 0 20px;
  color: #ffffff;
}

.hero-content h1 {
  font-family: var(--font-title);
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.hero-content p,
.hero-content .subtitle {
  font-size: 1.25rem;
  font-weight: 300;
  color: #ffffff;
  margin-bottom: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 4rem 20px;
}

.loading-state {
  text-align: center;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  padding: 2rem;
}

.about-section {
  margin-bottom: 3rem;
}

.text-section p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
  white-space: pre-wrap;
}

.list-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.list-section li {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.image-section img {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.image-section .caption {
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
  font-style: italic;
}

.video-section {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.video-section iframe,
.video-section video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.cta-section {
  margin-top: 5rem;
  text-align: center;
  padding: 3rem;
  background-color: var(--color-bg-terracotta);
  border-radius: var(--radius-lg);
}

.cta-section h2 {
  font-family: var(--font-title);
  color: var(--color-primary);
  margin-bottom: 2rem;
}

.contact-form {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: var(--color-text);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
}

.submit-btn {
  background-color: var(--color-primary);
  padding: 5px;
  border-radius: 10px;
  color: white;
  border: none;
  cursor: pointer;
  width: 100%;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.feedback {
  text-align: center;
  color: #25D366;
  font-weight: bold;
  margin-top: 1rem;
}

.feedback.error {
  color: var(--color-danger);
}
</style>
