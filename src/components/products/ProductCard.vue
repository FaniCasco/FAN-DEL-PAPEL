<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import type { Product } from '@/data/products';

const props = defineProps<{ product: Product }>();

const cartStore = useCartStore();
const router = useRouter();
const quantity = ref(1);

function handleAddToCart(event?: Event) {
  event?.stopPropagation();
  cartStore.addToCart(props.product, quantity.value);
  quantity.value = 1;
}

function increment(event?: Event) {
  event?.stopPropagation();
  quantity.value += 1;
}

function decrement(event?: Event) {
  event?.stopPropagation();
  if (quantity.value > 1) quantity.value -= 1;
}

function goToDetail(event?: Event) {
  event?.stopPropagation();
  router.push({ name: 'ProductDetail', params: { id: props.product.id } });
}
</script>

<template>
  <article class="card" @click="goToDetail">
    <img v-if="props.product.imagenes?.length && props.product.imagenes[0]" :src="props.product.imagenes[0]" alt="Imagen del producto" class="image" />
    <div class="content">
      <div class="card-header">
        <div>
          <p class="category">{{ props.product.categoria }}</p>
          <h3 class="title">{{ props.product.nombre }}</h3>
        </div>
        <p class="price">{{ `$${props.product.precio.toLocaleString('es-AR')}` }}</p>
      </div>
      <div class="actions">
        <div class="quantity-selector">
          <button @click="decrement">−</button>
          <span>{{ quantity }}</span>
          <button @click="increment">+</button>
        </div>
        <button class="btn-cart" @click="handleAddToCart">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
          </svg>
          <span>Encargar</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  transition: var(--transition-smooth);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(75, 75, 75, 0.08), 0 4px 12px rgba(248, 121, 159, 0.05);
  border-color: rgba(248, 121, 159, 0.2);
}

.image {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background-color: var(--color-primary);
  padding: 12px;
  box-sizing: border-box;
  transition: var(--transition-smooth);
}

.card:hover .image {
  transform: scale(1.03);
}

.badge-wrapper {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.badge.nuevo {
  background: var(--color-accent);
  color: var(--color-white);
}

.badge.destacado {
  background: var(--color-secondary);
  color: var(--color-text);
}

.content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-grow: 1;
  justify-content: space-between;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.category {
  margin: 0 0 4px;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 600;
}

.title {
  font-family: var(--font-title);
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-text);
  line-height: 1.3;
  transition: var(--transition-smooth);
}

.card:hover .title {
  color: var(--color-primary);
}

.price {
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  white-space: nowrap;
  font-size: 1.25rem;
  font-family: var(--font-body);
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-selector button {
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  transition: var(--transition-smooth);
}

.quantity-selector button:hover {
  background: var(--color-secondary);
  color: var(--color-text);
}

.quantity-selector span {
  min-width: 1.5rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.95rem;
}

.btn-cart {
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  transition: var(--transition-smooth);
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.btn-cart:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.icon {
  width: 1.1rem;
  height: 1.1rem;
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
    gap: 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 8px;
  }

  .badge {
    font-size: calc(0.75rem + 5px);
  }

  .category {
    font-size: calc(0.75rem + 5px);
  }

  .title {
    font-size: calc(1.15rem + 5px);
  }

  .price {
    font-size: calc(1.25rem + 5px);
  }

  .quantity-selector button {
    font-size: calc(1rem + 5px);
  }

  .quantity-selector span {
    font-size: calc(0.95rem + 5px);
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .quantity-selector {
    justify-content: center;
  }

  .btn-cart {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
    font-size: calc(1rem + 5px);
  }
}
</style>
