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
  const text = (cart.items?.length ?? 0) > 0 ? cart.whatsappMessage : '¡Hola! Mi pedido está vacío.';
  const num = (cart.whatsappNumber ?? '').replace(/\s+/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
});

function finishOrder() {
  cart.clearCart();
}
</script>

<template>
  <aside class="summary">
    <div class="success-message">
      <h3>¡Pedido registrado!</h3>
      <p>Tu pedido fue guardado correctamente. Podés enviarlo por WhatsApp para confirmarlo.</p>
    </div>

    <p class="subtotal">Subtotal: <strong>{{ totalPriceString }}</strong></p>
    <p class="items">Cantidad total: <strong>{{ totalItems }}</strong></p>

    <a :href="whatsappURL" target="_blank" rel="noopener" class="checkout-btn">
      Enviar pedido por WhatsApp
    </a>

    <button type="button" class="clear-btn" @click="finishOrder">
      Vaciar carrito y volver
    </button>
  </aside>
</template>

<style scoped>
.summary {
  background: #ffffff;
  color: var(--color-text);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: grid;
  gap: 0.85rem;
}

.success-message h3 {
  margin: 0 0 0.35rem;
  color: var(--color-primary);
  font-family: var(--font-title);
}

.success-message p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.subtotal,
.items {
  margin: 0;
}

.checkout-btn {
  display: block;
  text-align: center;
  background: #25d366;
  color: #ffffff;
  padding: 0.85rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: 700;
  transition: opacity 0.2s ease;
}

.checkout-btn:hover {
  opacity: 0.9;
}

.clear-btn {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
}
</style>
