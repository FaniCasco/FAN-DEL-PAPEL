<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { RouterLink } from 'vue-router';

const cart = useCartStore();
</script>

<template>
  <aside class="summary">
    <div class="success-message">
      <div class="check-icon">✓</div>
      <h3>¡Pedido registrado con éxito!</h3>
      <p>
        Tu pedido ya fue guardado en el sistema y abrimos WhatsApp para enviar la confirmación.
      </p>
    </div>

    <div v-if="cart.lastWhatsappUrl" class="reopen-container">
      <p class="reopen-hint">¿No se abrió WhatsApp automáticamente?</p>
      <a
        :href="cart.lastWhatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="reopen-btn"
      >
        Abrir WhatsApp de nuevo
      </a>
    </div>

    <RouterLink to="/catalogo" class="catalog-btn">
      Volver al catálogo
    </RouterLink>
  </aside>
</template>

<style scoped>
.summary {
  background: #ffffff;
  color: var(--color-text);
  padding: 1.75rem 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
  text-align: center;
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.check-icon {
  width: 52px;
  height: 52px;
  background: #25d366;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: bold;
}

.success-message h3 {
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-title);
  font-size: 1.35rem;
}

.success-message p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.45;
}

.reopen-container {
  width: 100%;
  background: var(--color-bg-secondary, #f8f9fa);
  padding: 1rem;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--color-border, #e0e0e0);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  box-sizing: border-box;
}

.reopen-hint {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.reopen-btn {
  display: inline-block;
  background: #25d366;
  color: #ffffff;
  padding: 0.65rem 1.1rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: opacity 0.2s ease;
}

.reopen-btn:hover {
  opacity: 0.9;
}

.catalog-btn {
  display: block;
  width: 100%;
  text-align: center;
  background: var(--color-primary);
  color: #ffffff;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: 700;
  transition: opacity 0.2s ease;
  box-sizing: border-box;
}

.catalog-btn:hover {
  opacity: 0.9;
}
</style>
