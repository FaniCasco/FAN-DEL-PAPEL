<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import CartItem from '@/components/cart/CartItem.vue';
import CartSummary from '@/components/cart/CartSummary.vue';
import CheckoutForm from '@/components/cart/CheckoutForm.vue';
import { computed, ref } from 'vue';

const cart = useCartStore();
const hasItems = computed(() => (cart.items?.length ?? 0) > 0);
const orderConfirmed = ref(false);

function handleOrderSubmitted() {
  orderConfirmed.value = true;
}
</script>

<template>
  <section class="cart-page" v-if="hasItems || orderConfirmed">
    <RouterLink to="/catalogo" class="back-button">← Volver al catálogo</RouterLink>

    <div class="cart-layout">
      <div v-if="!orderConfirmed" class="items">
        <CartItem v-for="item in cart.items" :key="item.id" :item="item" />
      </div>

      <aside class="checkout-panel" :class="{ 'full-width': orderConfirmed }">
        <CheckoutForm v-if="!orderConfirmed" @submitted="handleOrderSubmitted" />
        <CartSummary v-else />
      </aside>
    </div>
  </section>

  <section v-else class="empty-cart">
    <h2>El pedido está vacío.</h2>
    <router-link to="/catalogo" class="go-shop">Ir al catálogo</router-link>
  </section>
</template>

<style scoped>
.cart-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  color: white;
  background: var(--color-primary);
}

.cart-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.items {
  flex: 2;
  color: white;
  display: grid;
  gap: 1rem;
}

.checkout-panel {
  flex: 1;
}

.checkout-panel.full-width {
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.empty-cart {
  text-align: center;
  margin-top: 4rem;
}

.go-shop {
  margin-top: 1rem;
  color: var(--color-primary);
  text-decoration: underline;
}

.back-button {
  color: white;
  text-decoration: none;
  font-weight: 700;
}

.back-button:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .cart-layout {
    flex-direction: row;
    align-items: flex-start;
  }
}
</style>
