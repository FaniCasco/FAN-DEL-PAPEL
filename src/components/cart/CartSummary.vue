<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { computed } from 'vue';

const cart = useCartStore();

const totalPriceString = computed(() => {
  const price = Number(cart.totalPrice ?? 0);
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price);
});

const totalItems = computed(() => Number(cart.totalItems ?? 0));

const whatsappURL = computed(() => {
  const text = (cart.items?.length ?? 0) > 0 ? cart.whatsappMessage : '¡Hola! Mi carrito está vacío.';
  const num = (cart.whatsappNumber ?? '').replace(/\s+/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
});
</script>

<template>
  <aside class="summary">
    <p class="subtotal">Subtotal: <strong>{{ totalPriceString }}</strong></p>
    <p class="items">Cantidad total: <strong>{{ totalItems }}</strong></p>
    <a :href="whatsappURL" target="_blank" rel="noopener" class="checkout-btn">
      Finalizar pedido vía WhatsApp
    </a>
  </aside>
</template>

<style scoped>
.summary {
  background: var(--color-bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.subtotal, .items { margin-bottom: 0.8rem; }
.checkout-btn {
  display: block;
  text-align: center;
  background: var(--color-primary);
  color: var(--color-on-primary);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: var(--transition-smooth);
}
.checkout-btn:hover { background: var(--color-primary-hover); }
</style>