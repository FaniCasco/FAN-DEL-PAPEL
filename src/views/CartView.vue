<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import CartItem from '@/components/cart/CartItem.vue';
import CartSummary from '@/components/cart/CartSummary.vue';
import { computed } from 'vue';

const cart = useCartStore();
const hasItems = computed(() => (cart.items?.length ?? 0) > 0);
</script>

<template>
  <section class="cart-page" v-if="hasItems">
    <RouterLink to="/catalogo" class="back-button">← Volver al catálogo</RouterLink>
    <div class="items">
      <CartItem v-for="item in cart.items" :key="item.id" :item="item" />
    </div>
    <CartSummary />
  </section>

  <section v-else class="empty-cart">
    <h2>El carrito está vacío.</h2>
    <router-link to="/catalogo" class="go-shop">Ir al catálogo</router-link>
  </section>
</template>

<style scoped>
.cart-page { display: flex; flex-direction: column; gap: 2rem; padding: 2rem; }
@media(min-width: 768px) { .cart-page { flex-direction: row; } }
.items { flex: 2; }
.empty-cart { text-align: center; margin-top: 4rem; }
.go-shop { margin-top: 1rem; color: var(--color-primary); text-decoration: underline; }
.back-button { color: var(--color-primary); text-decoration: none; font-weight: 700; }
.back-button:hover { text-decoration: underline; }
</style>