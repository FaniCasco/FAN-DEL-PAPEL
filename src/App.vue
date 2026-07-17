<template>
  <div class="app-layout">
    <Navbar />
    <div class="app-body">
      <CategorySidebar v-if="showSidebar" />
      <main class="main-content" :class="{ 'full-width': !showSidebar }">
        <RouterView />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import CategorySidebar from './components/layout/CategorySidebar.vue'

const route = useRoute()
const showSidebar = computed(() => route.meta.showCategorySidebar === true)
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

.app-body {
  display: flex;
  justify-content: center;
  gap: 18px;
  width: 100%;
  padding: 0 18px;
  box-sizing: border-box;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px var(--spacing-base);
  animation: fadeIn 0.6s ease-out;
}

.main-content.full-width {
  max-width: 1200px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .app-body {
    flex-direction: column;
    gap: 12px;
    padding: 0 14px;
  }
  
  .main-content {
    padding: 16px 0;
  }
}
</style>
