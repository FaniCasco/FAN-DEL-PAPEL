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
  gap: 1.5rem;
  width: 100%;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
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
  .main-content {
    padding: 24px 16px;
  }
}
</style>