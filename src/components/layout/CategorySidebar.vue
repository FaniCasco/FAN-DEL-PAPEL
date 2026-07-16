<template>
  <aside class="category-sidebar">
    <div class="sidebar-heading">
      <p>Categorías</p>
      <h2>Explorá la colección</h2>
    </div>

    <button
      class="category-button"
      :class="{ active: activeCategory === 'Todas' }"
      @click="selectCategory('Todas')"
    >
      Todas
      <span class="count">x {{ totalProducts }}</span>
    </button>

    <nav class="categories-list">
      <div v-for="group in categoryGroups" :key="group.value" class="category-group">
        <button
          class="category-button"
          :class="{ active: activeCategory === group.value }"
          @click="selectCategory(group.value)"
        >
          {{ group.label }}
          <span class="count">x {{ group.count }}</span>
        </button>

        <div v-if="activeCategory === group.value && group.subcategories.length" class="subcategory-list">
          <button
            v-for="subcategory in group.subcategories"
            :key="subcategory"
            class="subcategory-button"
            :class="{ active: activeSubcategory === subcategory }"
            @click="selectSubcategory(subcategory)"
          >
            {{ subcategory }}
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const activeCategory = computed(() => String(route.query.category || 'Todas'))
const activeSubcategory = computed(() => String(route.query.subcategory || 'Todas'))

const categoryGroups = computed(() => {
  const categories = productsStore.categories
  return categories.map((category) => {
    const products = productsStore.products.filter((product) => product.categoria === category)
    const subcategories = Array.from(
      new Set(products.map((product) => product.subcategoria).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
    return {
      label: category,
      value: category,
      count: products.length,
      subcategories,
    }
  })
})

const totalProducts = computed(() => productsStore.products.length)

function selectCategory(category: string) {
  router.push({ name: 'Catalog', query: { category, subcategory: 'Todas' } })
}

function selectSubcategory(subcategory: string) {
  router.push({
    name: 'Catalog',
    query: {
      category: activeCategory.value === 'Todas' ? 'Todas' : activeCategory.value,
      subcategory,
    },
  })
}
</script>

<style scoped>
.category-sidebar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  padding: var(--spacing-base);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  min-width: 260px;
  width: 260px;
}

@media (max-width: 768px) {
  .category-sidebar {
    position: static;
    width: 100%;
    min-width: 0;
    max-height: none;
    margin-bottom: 8px;
  }
}

.sidebar-heading {
  margin-bottom: 16px;
}

.sidebar-heading p,
.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  font-weight: 700;
}

.sidebar-heading h2 {
  margin: 0.2rem 0 0;
  font-family: var(--font-title);
  font-size: 1.5rem;
  color: var(--color-text);
}

.category-button,
.subcategory-button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.8rem 0.75rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text);
  transition: var(--transition-smooth);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-body);
}

.category-button:hover,
.subcategory-button:hover {
  background: rgba(248, 121, 159, 0.05);
}

.category-button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.category-button.active .count {
  color: rgba(255, 255, 255, 0.8);
}

.subcategory-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-left: 0.75rem;
  margin-top: 4px;
}

.subcategory-button.active {
  background: rgba(248, 121, 159, 0.1);
  color: var(--color-primary);
  font-weight: 600;
}

.category-group {
  margin-bottom: 0.75rem;
}

.count {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}
</style>
