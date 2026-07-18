<script setup lang="ts">

import { useCartStore } from '@/stores/cart';

const props = defineProps({ item: Object });
const item = props.item;
const cart = useCartStore();

function inc() {
  cart.updateQuantity(props.item.id, props.item.quantity + 1);
}
function dec() {
  if (props.item.quantity > 1) {
    cart.updateQuantity(props.item.id, props.item.quantity - 1);
  }
}
function remove() {
  cart.removeFromCart(props.item.id);
}
</script>

<template>
  <article class="cart-item">
    <img :src="item.imagenes[0]" alt="Img" class="thumb" />
    <div class="info">
      <h4 class="name">{{ item.nombre }}</h4>
      <p class="price">{{ `$${item.precio.toLocaleString('es-AR')}` }}</p>
      <div class="qty">
        <button @click="dec">‑</button>
        <span>{{ item.quantity }}</span>
        <button @click="inc">+</button>
      </div>
    </div>
    <button class="remove" @click="remove">✕</button>
  </article>
</template>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border-bottom: 1px solid black;
}
.thumb { width: 80px; height: 80px; object-fit: cover; border-radius: var(--radius-sm); }
.info { flex: 1; }
.name { margin: 0; font-size: 1rem; }
.price { color: var(--color-primary); margin: 0.2rem 0; }
.qty { display: flex; align-items: center; gap: 0.3rem; }
.qty button {  color: black; background: var(--color-bg-secondary); border: none; width: 24px; height: 24px; border-radius: var(--radius-sm); }
.remove { background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: var(--color-danger); }
</style>
