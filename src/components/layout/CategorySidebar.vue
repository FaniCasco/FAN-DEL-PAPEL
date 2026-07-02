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
  background: var(--color-bg-primary);
  border: 1px solid rgba(192, 92, 62, 0.15);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}
.sidebar-heading p,
.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-secondary);
  font-weight: 700;
}
.sidebar-heading h2 {
  margin: 0.2rem 0 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
}
.category-button,
.subcategory-button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.8rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
  transition: var(--transition-smooth);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-button:hover,
.subcategory-button:hover {
  background: var(--color-bg-secondary);
}
.category-button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.subcategory-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-left: 0.75rem;
}
.subcategory-button.active {
  background: rgba(192, 92, 62, 0.12);
  color: var(--color-primary);
  font-weight: 600;
}
.category-group {
  margin-bottom: 0.75rem;
}
.count {
  color: var(--color-secondary);
  font-size: 0.85rem;
}
</style>
