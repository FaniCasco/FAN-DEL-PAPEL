<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';
import type { Product } from '@/data/products';

const props = defineProps<{ product: Product }>();

const cartStore = useCartStore();
const router = useRouter();
const quantity = ref(1);
const isAdmin = ref(false);

function updateAdminStatus() {
  isAdmin.value = typeof window !== 'undefined' && window.sessionStorage.getItem('isAdmin') === 'true'
}

if (typeof window !== 'undefined') {
  updateAdminStatus()
  window.addEventListener('admin-status-changed', updateAdminStatus)
}

function handleAddToCart(event?: Event) {
  event?.stopPropagation();
  cartStore.addToCart(props.product, quantity.value);
  quantity.value = 1;
}

function increment(event?: Event) {
  event?.stopPropagation();
  if (quantity.value < props.product.stock) quantity.value += 1;
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
    <img :src="props.product.imagenes?.[0] || '/recursos/mockups/sobremascarta.png'" alt="Imagen del producto" class="image" />
    <div class="content">
      <div class="card-header">
        <div>
          <p class="category">{{ props.product.categoria }}</p>
          <h3 class="title">{{ props.product.nombre }}</h3>
        </div>
        <p class="price">{{ `$${props.product.precio.toLocaleString('es-AR')}` }}</p>
      </div>
      <div class="actions">
        <div v-if="!isAdmin" class="quantity-selector">
          <button @click="decrement">−</button>
          <span>{{ quantity }}</span>
          <button @click="increment">+</button>
        </div>
        <button v-if="!isAdmin" class="btn-cart" @click="handleAddToCart">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" stroke="currentColor" fill="none">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
          </svg>
          <span>Agregar</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  position: relative;
  transition: var(--transition-smooth);
  cursor: pointer;
}
.card:hover { transform: translateY(-4px); }
.image { width: 100%; height: 180px; object-fit: cover; transition: var(--transition-smooth); }
.card:hover .image { transform: scale(1.05); }
.badge-wrapper { position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; }
.badge { padding: 2px 6px; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
.badge.nuevo { background: var(--color-accent); color: var(--color-on-accent); }
.badge.destacado { background: var(--color-secondary); color: var(--color-on-secondary); }
.content { padding: 1rem; display: flex; flex-direction: column; gap: 0.8rem; }
.card-header { display: flex; justify-content: space-between; gap: 0.75rem; align-items: start; }
.category { margin: 0 0 0.25rem; color: var(--color-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }
.title { font-family: 'Playfair Display', serif; margin: 0; font-size: 1.1rem; }
.price { font-weight: 600; color: var(--color-primary); margin: 0; white-space: nowrap; }
.actions { display: flex; gap: 0.5rem; justify-content: space-between; align-items: center; }
.quantity-selector { display: flex; align-items: center; gap: 0.4rem; }
.quantity-selector button {
  border: none; width: 28px; height: 28px; border-radius: 50%; background: var(--color-bg-secondary); cursor: pointer;
}
.quantity-selector span { min-width: 1.5rem; text-align: center; font-weight: 600; }
.btn-cart { display: flex; align-items: center; gap: 4px; border: none; cursor: pointer; font-family: 'Inter', sans-serif; border-radius: var(--radius-sm); padding: 0.45rem 0.8rem; transition: var(--transition-smooth); background: var(--color-primary); color: var(--color-on-primary); }
.btn-cart:hover { background: var(--color-primary-hover); }
.icon { width: 1rem; height: 1rem; }
</style>