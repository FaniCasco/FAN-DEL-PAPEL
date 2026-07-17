<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{ images: string[] }>();

const selectedIndex = ref(0);
const isLightboxOpen = ref(false);

// Resetear índice cuando cambia el array de imágenes (ej: al navegar entre productos)
// Sin esto, si el índice queda fuera de rango, images[selectedIndex] es undefined
// y la imagen principal no se renderiza.
watch(
  () => props.images,
  () => { selectedIndex.value = 0; },
  { immediate: false }
);

function select(i: number) { selectedIndex.value = i; }
function openLightbox() { isLightboxOpen.value = true; }
function closeLightbox() { isLightboxOpen.value = false; }

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeLightbox();
}

watch(isLightboxOpen, (open) => {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = open ? 'hidden' : '';
});

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <div class="gallery">
    <button
      type="button"
      class="main-button"
      @click="openLightbox"
      :aria-label="'Abrir imagen grande'"
    >
      <img :src="images[selectedIndex]" alt="Imagen del producto" class="main" />
    </button>
    <div class="thumbs">
      <img v-for="(img, i) in images" :key="i" :src="img" :class="{ active: i === selectedIndex }" @click="select(i)" />
    </div>
    <teleport to="body">
      <transition name="fade">
        <div v-if="isLightboxOpen" class="lightbox" @click.self="closeLightbox">
          <button type="button" class="lightbox-close" @click="closeLightbox">×</button>
          <img :src="images[selectedIndex]" alt="Imagen ampliada del producto" class="lightbox-image" />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
.gallery { display: flex; flex-direction: column; align-items: center; width: 100%; }
.main-button {
  width: 100%;
  max-width: 100%;
  border: none;
  background: transparent;
  padding: 0;
  cursor: zoom-in;
}
.main {
  width: 100%;
  max-width: 100%;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  display: block;
}
.thumbs { display: flex; gap: 0.5rem; margin-top: 0.5rem; overflow-x: auto; }
.thumbs img { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; opacity: 0.7; transition: var(--transition-smooth); }
.thumbs img.active, .thumbs img:hover { opacity: 1; border: 2px solid var(--color-primary); }
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(18, 16, 15, 0.88);
  display: grid;
  place-items: center;
  padding: 0.75rem;
}
.lightbox-image {
  width: min(88vw, 760px);
  max-height: 78vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  background: rgba(255, 255, 255, 0.06);
}
.lightbox-close {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 1.6rem;
  cursor: pointer;
  touch-action: manipulation;
}

@media (min-width: 1024px) {
  .lightbox-image {
    width: min(82vw, 900px);
  }
}

@media (max-width: 640px) {
  .lightbox {
    padding: 0.5rem;
  }

  .lightbox-image {
    width: min(92vw, 640px);
    max-height: 74vh;
  }

  .lightbox-close {
    top: 0.75rem;
    right: 0.75rem;
    width: 40px;
    height: 40px;
    font-size: 1.4rem;
  }
}
</style>
