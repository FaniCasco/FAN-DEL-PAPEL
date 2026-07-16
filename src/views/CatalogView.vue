<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
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
  width: 100%;
}

.catalog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--spacing-base);
  margin-bottom: 8px;
}

.eyebrow {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  font-weight: 700;
}

.catalog-header h1 {
  margin: 4px 0 0;
  font-family: var(--font-title);
  font-size: 2.25rem;
  color: var(--color-text);
}

.subtitle {
  margin: 4px 0 0;
  font-size: 1.1rem;
  color: var(--color-text-muted);
}

.results-count {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.95rem;
}

.grid {
  display: grid;
  gap: var(--spacing-base);
  grid-template-columns: repeat(3, 1fr);
  width: 100%;
}

.empty {
  text-align: center;
  padding: 48px;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-md);
  border: 1px dashed rgba(75, 75, 75, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive grid */
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .catalog-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>