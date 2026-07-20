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
const product = ref<any>(null);
const quantity = ref(1);
const added = ref(false);

function syncProduct() {
  const found = products.value.find((item: any) => item.id === Number(route.params.id));
  product.value = found || null;
  quantity.value = 1;
}

// Filtramos strings vacíos: un array [''] tiene .length > 0 pero genera src vacío
const productImages = computed<string[]>(() => {
  if (!product.value?.imagenes?.length) return [];
  return product.value.imagenes.filter((img: string) => Boolean(img));
});

watch(() => route.params.id, syncProduct, { immediate: true });

function increment() {
  quantity.value++;
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

</script>

<template>
  <div v-if="product" class="product-view-wrapper">
    <div class="detail-header">
      <RouterLink to="/catalogo" class="back-button">
        <span class="back-arrow">←</span> Volver al catálogo
      </RouterLink>
    </div>

    <main class="product-detail-card" :class="{ 'no-image': !productImages.length }">
      <div v-if="productImages.length" class="gallery-column">
        <ProductGallery :images="productImages" />
      </div>

      <div class="info-column">
        <div class="badge-group">
          <span class="badge">{{ product.categoria }}</span>
          <span v-if="product.subcategoria" class="badge secondary">{{ product.subcategoria }}</span>
        </div>

        <h1 class="title">{{ product.nombre }}</h1>
        <p class="description">{{ product.descripcion }}</p>

        <hr class="divider" />

        <div class="meta-section">
          <div class="price-container">
            <span class="price-label">Precio</span>
            <p class="price">{{ formatPrice(product.precio) }}</p>
          </div>
        </div>

        <div class="purchase-section">
          <div class="quantity-wrapper">
            <span class="quantity-label">Cantidad</span>
            <div class="quantity-selector">
              <button @click="decrement" :disabled="quantity <= 1" class="qty-btn">-</button>
              <span class="qty-val">{{ quantity }}</span>
              <button @click="increment" class="qty-btn">+</button>
            </div>
          </div>

          <button class="add-to-cart" @click="addToCart">
            <span>Encargar</span>
            <span class="cart-icon">🛒</span>
          </button>
        </div>

        <transition name="fade">
          <div v-if="added" class="feedback">
            <span class="feedback-icon">💌</span> ¡Agregado con éxito!
          </div>
        </transition>
      </div>
    </main>
  </div>

  <div v-else class="not-found-wrapper">
    <div class="not-found-card">
      <span class="sad-icon">💌</span>
      <h2>Producto no encontrado</h2>
      <p>Lo sentimos, el producto que estás buscando no existe o fue retirado.</p>
      <RouterLink to="/catalogo" class="back-link-btn">Volver al catálogo</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.product-view-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-base);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.detail-header {
  display: flex;
  align-items: center;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: var(--transition-smooth);
}

.back-button:hover {
  color: var(--color-primary-hover);
  transform: translateX(-4px);
}

.back-arrow {
  transition: var(--transition-smooth);
}

/* Glassmorphism Product Card */
.product-detail-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(232, 220, 208, 0.6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-base);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-base);
  transition: var(--transition-smooth);
}

/* Breakpoint 768px */
@media (min-width: 768px) {
  .product-detail-card {
    grid-template-columns: 1.1fr 1fr;
    gap: 3rem;
    padding: 3rem;
  }
  .product-detail-card.no-image {
    grid-template-columns: 1fr;
    max-width: 800px;
    margin: 0 auto;
  }
}

.gallery-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

/* Overriding ProductGallery styles inside the wrapper */
:deep(.gallery) {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.main) {
  width: 100%;
  max-width: 100%;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  aspect-ratio: 1 / 1;
  object-fit: contain;
  background-color: var(--color-bg-sage);
  padding: 16px;
  box-sizing: border-box;
  transition: var(--transition-smooth);
}

:deep(.thumbs) {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 4px;
}

:deep(.thumbs img) {
  width: 68px;
  height: 68px;
  object-fit: cover;
  border-radius: var(--radius-md);
  cursor: pointer;
  opacity: 0.7;
  transition: var(--transition-smooth);
  border: 2px solid transparent;
}

:deep(.thumbs img.active),
:deep(.thumbs img:hover) {
  opacity: 1;
  border-color: var(--color-primary);
}

/* Info Column styling */
.info-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  justify-content: center;
}

.badge-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-full);
  background: rgba(248, 121, 159, 0.12);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid rgba(248, 121, 159, 0.2);
}

.badge.secondary {
  background: var(--color-secondary);
  color: var(--color-gray);
  border: 1px solid rgba(217, 233, 211, 0.6);
}

.title {
  font-family: var(--font-title);
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.description {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--color-gray);
  margin: 0;
}

.divider {
  border: none;
  border-top: 1px dashed var(--color-border);
  margin: 0.5rem 0;
}

.meta-section {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
}

.price-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.price {
  font-size: 2.2rem;
  color: var(--color-primary);
  font-weight: 700;
  margin: 0;
}

/* Purchase section */
.purchase-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.quantity-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 4px;
  background: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.qty-btn {
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: var(--transition-smooth);
  color: var(--color-text);
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-bg-secondary);
  color: var(--color-primary);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-val {
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 36px;
  text-align: center;
  color: var(--color-text);
}

.add-to-cart {
  flex: 1;
  min-width: 200px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
  box-shadow: 0 4px 14px rgba(248, 121, 159, 0.35);
}

.add-to-cart:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(248, 121, 159, 0.45);
}

.add-to-cart:active {
  transform: translateY(0);
}

.cart-icon {
  font-size: 1.1rem;
}

.feedback {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(217, 233, 211, 0.5);
  border: 1px solid rgba(217, 233, 211, 0.8);
  border-radius: var(--radius-md);
  color: #4b6a3c;
  font-weight: 600;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  backdrop-filter: blur(4px);
  animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.feedback-icon {
  font-size: 1.1rem;
}

@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Not Found View */
.not-found-wrapper {
  max-width: 600px;
  margin: 4rem auto;
  padding: var(--spacing-base);
}

.not-found-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 220, 208, 0.6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.sad-icon {
  font-size: 3rem;
}

.not-found-card h2 {
  font-family: var(--font-title);
  color: var(--color-text);
  font-size: 2rem;
  margin: 0;
}

.not-found-card p {
  color: var(--color-gray);
  margin: 0;
  line-height: 1.6;
}

.back-link-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2rem;
  background: var(--color-primary);
  color: var(--color-on-primary);
  text-decoration: none;
  font-weight: 600;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 12px rgba(248, 121, 159, 0.3);
  transition: var(--transition-smooth);
}

.back-link-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(248, 121, 159, 0.4);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
