<script setup lang="ts">
import { ref, computed } from 'vue';
import ProductCard from '@/components/products/ProductCard.vue';
import { useProductsStore } from '@/stores/products';

const productsStore = useProductsStore();
const route = useRoute();
const searchTerm = ref('');

const activeCategory = computed(() => String(route.query.category || 'Todas'));
const activeSubcategory = computed(() => String(route.query.subcategory || 'Todas'));

const currentGroupLabel = computed(() => {
  return activeCategory.value === 'Todas' ? 'Todas' : activeCategory.value;
});

const filteredProducts = computed(() => {
  let list = productsStore.products;

  if (activeCategory.value !== 'Todas') {
    list = list.filter((product) => product.categoria === activeCategory.value);
  }

  if (activeSubcategory.value !== 'Todas') {
    list = list.filter((product) => product.subcategoria === activeSubcategory.value);
  }

  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase();
    list = list.filter((product) =>
      product.nombre.toLowerCase().includes(term) ||
      product.descripcion.toLowerCase().includes(term)
    );
  }

  return list;
});
</script>

<template>
  <section class="catalog-shell">
    <div class="catalog-content">
      <div class="catalog-header">
        <div>
          <p class="eyebrow">Colección</p>
          <h1>{{ currentGroupLabel }}</h1>
          <p v-if="activeSubcategory !== 'Todas'" class="subtitle">{{ activeSubcategory }}</p>
        </div>
        <p class="results-count">{{ filteredProducts.length }} productos</p>
      </div>

      <transition-group name="fade" tag="div" class="grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </transition-group>

      <p v-if="!filteredProducts.length" class="empty">
        No hay productos que coincidan con tu búsqueda.
      </p>
    </div>
  </section>
</template>

<style scoped>
.catalog-shell {
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr;
  gap: 1.5rem;
  align-items: start;
  margin-top: 0; /* asegure que no quede un banner/corte debajo del navbar */
}
.sidebar {
  background: #ffffff;
  border: 2px solid #f8799f;
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 96px;
}
.sidebar-heading p, .eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-secondary);
  font-weight: 700;
}
.sidebar-heading h2, .catalog-header h1 {
  margin: 0.2rem 0 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
}
.search-input {
  width: 100%;
  margin: 1rem 0;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.category-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  padding-bottom: 0.45rem;
}
.category-button, .subcategory-button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
  font-weight: 600;
  transition: var(--transition-smooth);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-button:hover, .subcategory-button:hover {
  background: var(--color-bg-secondary);
}
.category-button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.subcategory-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-left: 1rem;
}
.back-button {
  display: inline-flex;
  margin-bottom: 0.75rem;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text);
  text-decoration: none;
  transition: var(--transition-smooth);
}
.back-button:hover {
  background: var(--color-border);
}
.subcategory-button.active {
  background: rgba(192, 92, 62, 0.12);
  color: var(--color-primary);
  font-weight: 600;
}
.count {
  color: var(--color-secondary);
  font-size: 0.9rem;
}
.catalog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
}
.subtitle {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
}
.results-count {
  color: var(--color-secondary);
  font-weight: 600;
}
.grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.empty {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-text-muted);
}
.fade-enter-active,
.fade-leave-active { transition: opacity .3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
@media (max-width: 900px) {
  .catalog-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: static;
    border-width: 1px;
  }
}
</style>
<style scoped>
.catalog-shell {
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr;
  gap: 1.5rem;
  align-items: start;
}
.sidebar {
  background: var(--color-bg-primary);
  border: 1px solid rgba(192, 92, 62, 0.12);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 96px;
}
.sidebar-heading p, .eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-secondary);
  font-weight: 700;
}
.sidebar-heading h2, .catalog-header h1 {
  margin: 0.2rem 0 0;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
}
.search-input {
  width: 100%;
  margin: 1rem 0;
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.category-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.category-button, .subcategory-button {
  width: 100%;
  text-align: left;
  border: none;
  background: transparent;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
  transition: var(--transition-smooth);
}
.category-button:hover, .subcategory-button:hover {
  background: var(--color-bg-secondary);
}
.category-button.active {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
.subcategory-list {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-left: 0.4rem;
}
.subcategory-button.active {
  background: rgba(192, 92, 62, 0.12);
  color: var(--color-primary);
  font-weight: 600;
}
.catalog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
}
.subtitle {
  margin: 0.25rem 0 0;
  color: var(--color-text-muted);
}
.results-count {
  color: var(--color-secondary);
  font-weight: 600;
}
.grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.empty {
  text-align: center;
  margin-top: 1rem;
  color: var(--color-text-muted);
}
.fade-enter-active,
.fade-leave-active { transition: opacity .3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}

@media (max-width: 900px) {
  .catalog-shell {
    grid-template-columns: 1fr;
  }
  .sidebar {
    position: static;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>