<template>
  <div class="sidebar-shell">
    <button
      v-if="isMobile && !shouldShowSidebar"
      class="mobile-sidebar-toggle"
      @click="isMenuOpen = true"
    >
      Ver categorías
    </button>

    <aside v-if="shouldShowSidebar" class="category-sidebar">
      <div class="sidebar-heading">
        <p>CATEGORIAS</p>
      </div>

      <button
        class="category-button"
        :class="{ active: activeCategory === 'Todas' }"
        @click="selectCategory('Todas')"
      >
        Todas
      </button>

      <nav class="categories-list">
        <div v-for="group in categoryGroups" :key="group.value" class="category-group">
          <div class="category-row">
            <button
              class="category-button"
              :class="{ active: activeCategory === group.value }"
              @click="selectCategory(group.value)"
            >
              <span>{{ group.label }}</span>
            </button>

            <button
              v-if="group.subcategories.length"
              type="button"
              class="category-toggle"
              :class="{ active: activeCategory === group.value }"
              :aria-expanded="expandedCategory === group.value"
              :aria-label="`Mostrar subcategorías de ${group.label}`"
              @click="toggleCategory(group.value)"
            >
              <svg
                class="chevron"
                :class="{ expanded: expandedCategory === group.value }"
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div v-if="expandedCategory === group.value && group.subcategories.length" class="subcategory-list">
            <button
              v-for="subcategory in group.subcategories"
              :key="subcategory"
              class="subcategory-button"
              :class="{ active: activeSubcategory === subcategory }"
              @click="selectSubcategory(subcategory, group.value)"
            >
              {{ subcategory }}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const activeCategory = computed(() => String(route.query.category || 'Todas'))
const activeSubcategory = computed(() => String(route.query.subcategory || 'Todas'))
const expandedCategory = ref<string | null>(activeCategory.value === 'Todas' ? null : activeCategory.value)
const isMobile = ref(false)
const isMenuOpen = ref(false)

const shouldShowSidebar = computed(() => {
  if (!isMobile.value) return true
  return isMenuOpen.value || activeCategory.value === 'Todas'
})

function updateIsMobile() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    isMenuOpen.value = true
  }
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
})

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
      subcategories,
    }
  })
})

function selectCategory(category: string) {
  const group = categoryGroups.value.find(g => g.value === category)
  const hasSubcategories = group && group.subcategories && group.subcategories.length > 0

  if (hasSubcategories) {
    toggleCategory(category)
    return
  }

  isMenuOpen.value = false
  router.push({ name: 'Catalog', query: { category, subcategory: 'Todas' } })
}

function toggleCategory(category: string) {
  expandedCategory.value = expandedCategory.value === category ? null : category
}

function selectSubcategory(subcategory: string, category: string) {
  isMenuOpen.value = false
  router.push({
    name: 'Catalog',
    query: {
      category,
      subcategory,
    },
  })
}
</script>

<style scoped>
.sidebar-shell {
  width: auto;
}

.mobile-sidebar-toggle {
  display: none;
}

.category-sidebar {
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 5px;
  padding: 14px;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  min-width: 260px;
  width: 260px;
}

@media (max-width: 768px) {
  .sidebar-shell {
    width: 100%;
  }

  .mobile-sidebar-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.8rem 1rem;
    border: none;
    border-radius: 999px;
    background: var(--color-primary);
    color: var(--color-on-primary);
    font-weight: 700;
    font-family: var(--font-body);
    cursor: pointer;
    margin-bottom: 8px;
  }

  .category-sidebar {
    position: static;
    width: 100%;
    min-width: 0;
    max-height: none;
    margin-bottom: 8px;
  }

  .sidebar-heading p,
  .eyebrow {
    font-size: 21px;
  }

  .category-button,
  .subcategory-button {
    font-size: 21px;
  }
}

.sidebar-heading {
  margin-bottom: 10px;
}

.sidebar-heading p,
.eyebrow {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #1f1a17;
  font-weight: 800;
  font-family: var(--font-title);
}

.category-button {
  flex: 1;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.65rem 0.7rem;
  border-radius: 5px;
  cursor: pointer;
  color: #2a2320;
  transition: var(--transition-smooth);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-body);
}

.category-row {
  display: flex;
  align-items: stretch;
}

.category-toggle {
  flex: 0 0 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: #2a2320;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.category-toggle:hover {
  background: rgba(248, 121, 159, 0.05);
}

.category-button.active,
.category-toggle.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.category-button:hover {
  background: rgba(248, 121, 159, 0.05);
}

.category-button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.subcategory-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.25rem;
  padding-left: 0.8rem;
  margin-left: 0.8rem;
  margin-top: 4px;
  border-left: 2px solid rgba(0, 0, 0, 0.06);
}

.subcategory-button {
  width: 100%;
  align-self: stretch;
  display: flex;
  justify-content: flex-start;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.45rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  color: #6a6461;
  font-size: 0.9em;
  transition: var(--transition-smooth);
  font-family: var(--font-body);
}

.subcategory-button:hover {
  background: rgba(0, 0, 0, 0.04);
  color: #2a2320;
}

.subcategory-button.active {
  color: var(--color-primary);
  font-weight: 600;
  position: relative;
}

.subcategory-button.active::before {
  content: '';
  position: absolute;
  left: -0.8rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--color-primary);
}

.chevron {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
  opacity: 0.6;
}

.chevron.expanded {
  transform: rotate(180deg);
}

.category-group {
  margin-bottom: 0.45rem;
}

</style>
