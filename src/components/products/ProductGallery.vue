<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ images: string[] }>();

const selectedIndex = ref(0);

// Resetear índice cuando cambia el array de imágenes (ej: al navegar entre productos)
// Sin esto, si el índice queda fuera de rango, images[selectedIndex] es undefined
// y la imagen principal no se renderiza.
watch(
  () => props.images,
  () => { selectedIndex.value = 0; },
  { immediate: false }
);

function select(i: number) { selectedIndex.value = i; }
</script>

<template>
  <div class="gallery">
    <img :src="images[selectedIndex]" alt="Imagen del producto" class="main" />
    <div class="thumbs">
      <img v-for="(img, i) in images" :key="i" :src="img" :class="{ active: i === selectedIndex }" @click="select(i)" />
    </div>
  </div>
</template>

<style scoped>
.gallery { display: flex; flex-direction: column; align-items: center; }
.main { width: 100%; max-width: 400px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: var(--transition-smooth); }
.thumbs { display: flex; gap: 0.5rem; margin-top: 0.5rem; overflow-x: auto; }
.thumbs img { width: 60px; height: 60px; object-fit: cover; border-radius: var(--radius-sm); cursor: pointer; opacity: 0.7; transition: var(--transition-smooth); }
.thumbs img.active, .thumbs img:hover { opacity: 1; border: 2px solid var(--color-primary); }
</style>