<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import ProductGallery from '@/components/products/ProductGallery.vue';
import { useCartStore } from '@/stores/cart';
import { useProductsStore } from '@/stores/products';

const productsStore = useProductsStore();
const products = computed(() => productsStore.products);

const route = useRoute();
const cartStore = useCartStore();
const isAdmin = ref(false);

const product = ref<any>(null);
const quantity = ref(1);
const added = ref(false);

function syncProduct() {
  const found = products.value.find((item: any) => item.id === Number(route.params.id));
  product.value = found || null;
  quantity.value = 1;
}

watch(() => route.params.id, syncProduct, { immediate: true });

function increment() {
  if (product.value && quantity.value < product.value.stock) quantity.value++;
}
function decrement() {
  if (quantity.value > 1) quantity.value--;
}
function addToCart() {
  if (!product.value) return;
  cartStore.addToCart(product.value, quantity.value);
  added.value = true;
  setTimeout(() => (added.value = false), 2000);
}
function formatPrice(val?: number) {
  return val ? `$${val.toLocaleString('es-AR')}` : '';
}

function setAdminStatus() {
  if (typeof window !== 'undefined') {
    isAdmin.value = window.sessionStorage.getItem('isAdmin') === 'true'
  }
}

setAdminStatus()
</script>

<template>
  <section v-if="product" class="detail-container">
    <div class="detail-header">
      <RouterLink to="/catalogo" class="back-button">← Volver al catálogo</RouterLink>
    </div>

    <ProductGallery :images="product.imagenes" />

    <div class="info">
      <span class="badge">{{ product.categoria }}</span>
      <span v-if="product.subcategoria" class="badge secondary">{{ product.subcategoria }}</span>
      <h1 class="title">{{ product.nombre }}</h1>
      <p class="description">{{ product.descripcion }}</p>

      <p class="price">{{ formatPrice(product.precio) }}</p>
      <p class="stock">Stock disponible: {{ product.stock }}</p>

      <div v-if="!isAdmin" class="quantity-selector">
        <button @click="decrement" :disabled="quantity <= 1">‑</button>
        <span>{{ quantity }}</span>
        <button @click="increment" :disabled="quantity >= product.stock">+</button>
      </div>

      <button v-if="!isAdmin" class="add-to-cart" @click="addToCart">
        Agregar al Carrito
      </button>

      <transition name="fade">
        <div v-if="added" class="feedback">¡Agregado con éxito! 💌</div>
      </transition>
    </div>
  </section>

  <section v-else class="not-found">
    <h2>Producto no encontrado 💌</h2>
    <router-link to="/catalogo" class="back-link">Volver al catálogo</router-link>
  </section>
</template>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
}
.detail-header {
  width: 100%;
}
@media (min-width: 900px) {
  .detail-container {
    flex-direction: row;
    align-items: flex-start;
  }
  .gallery,
  .info {
    flex: 1;
    max-width: 50%;
    min-width: 0;
  }
  .gallery {
    order: 2;
  }
  .info {
    order: 1;
  }
}
.info {
  width: 100%;
}
.title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-top: 0.5rem;
}
.badge {
  display: inline-block;
  margin-right: 0.4rem;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  background: rgba(192, 92, 62, 0.12);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
}
.badge.secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}
.back-button {
  display: inline-flex;
  margin-bottom: 1rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 700;
}
.back-button:hover {
  text-decoration: underline;
}
.price {
  font-size: 1.5rem;
  color: var(--color-primary);
  font-weight: 600;
  margin: 0.8rem 0;
}
.add-to-cart {
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-smooth);
}
.add-to-cart:hover {
  transform: translateY(-2px);
}
.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 1rem 0;
}
.quantity-selector button {
  background: var(--color-bg-secondary);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  font-size: 1.2rem;
  cursor: pointer;
}
.feedback {
  margin-top: 0.5rem;
  color: var(--color-success);
  animation: pop .5s ease-out;
}
@keyframes pop {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
.not-found {
  text-align: center;
  margin-top: 4rem;
}
.back-link {
  display: inline-block;
  margin-top: 1rem;
  color: var(--color-primary);
  text-decoration: underline;
}
.fade-enter-active,
.fade-leave-active { transition: opacity .3s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>