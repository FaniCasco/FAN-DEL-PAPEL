<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'

const emit = defineEmits(['submitted'])

const cart = useCartStore()
const ordersStore = useOrdersStore()

const nombreApellido = ref('')
const telefono = ref('')
const formaPago = ref('efectivo')
const notas = ref('')
const error = ref('')
const isSubmitting = ref(false)

const totalPriceString = computed(() =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(Number(cart.totalPrice ?? 0))
)

async function submitOrder() {
  error.value = ''

  const nombre = String(nombreApellido.value).trim()
  const tel = String(telefono.value).trim()

  if (!nombre) {
    error.value = 'Ingresá tu nombre y apellido.'
    return
  }
  if (!tel) {
    error.value = 'Ingresá tu teléfono.'
    return
  }
  if (!formaPago.value) {
    error.value = 'Seleccioná una forma de pago.'
    return
  }
  if (!cart.items.length) {
    error.value = 'El pedido está vacío.'
    return
  }

  isSubmitting.value = true

  // a) Guardar la información del cliente en la tienda de carrito.
  cart.setCustomerInfo({ nombreApellido: nombre, telefono: tel, formaPago: formaPago.value })

  // b) Insertar el pedido en Supabase llamando a ordersStore.addOrder(...)
  const result = await ordersStore.addOrder({
    nombreApellido: nombre,
    telefono: tel,
    formaPago: formaPago.value,
    items: cart.items.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      subcategoria: item.subcategoria,
      precio: item.precio,
      quantity: item.quantity,
    })),
    total: cart.totalPrice,
    pagado: false,
    notas: notas.value.trim(),
  })

  if (!result.ok) {
    isSubmitting.value = false
    error.value = result.error?.message || 'No se pudo registrar el pedido. Intentá de nuevo.'
    return
  }

  // c) Cuando la inserción en Supabase sea exitosa, generar la URL de WhatsApp y abrirla automáticamente con window.open(whatsappUrl, '_blank').
  const whatsappUrl = cart.getWhatsappUrl()
  cart.lastWhatsappUrl = whatsappUrl

  try {
    window.open(whatsappUrl, '_blank')
  } catch (e) {
    console.error('Error al abrir la ventana emergente de WhatsApp:', e)
  }

  // d) Vaciar el carrito (cart.clearCart()).
  cart.clearCart()

  isSubmitting.value = false

  // e) Emitir el evento @submitted para pasar a la pantalla de resumen/agradecimiento.
  emit('submitted', result.order)
}
</script>

<template>
  <section class="checkout-form">
    <h3>Datos del pedido</h3>
    <p class="hint">Completá tus datos antes de confirmar el pedido.</p>

    <div class="fields">
      <label>
        Nombre y apellido
        <input v-model="nombreApellido" type="text" placeholder="Ej: María García" />
      </label>

      <label>
        Teléfono
        <input v-model="telefono" type="tel" placeholder="Ej: 3564 123456" />
      </label>

      <fieldset class="payment-fieldset">
        <legend>Forma de pago</legend>
        <label class="radio-option">
          <input v-model="formaPago" type="radio" value="efectivo" />
          Efectivo
        </label>
        <label class="radio-option">
          <input v-model="formaPago" type="radio" value="transferencia" />
          Transferencia
        </label>
      </fieldset>

      <label>
        Notas (opcional)
        <textarea v-model="notas" rows="2" placeholder="Aclaraciones sobre el pedido" />
      </label>
    </div>

    <p class="subtotal">Total: <strong>{{ totalPriceString }}</strong></p>

    <button type="button" class="submit-btn" :disabled="isSubmitting" @click="submitOrder">
      {{ isSubmitting ? 'Procesando...' : 'Confirmar pedido por WhatsApp' }}
    </button>

    <p v-if="error" class="form-error">{{ error }}</p>
  </section>
</template>

<style scoped>
.checkout-form {
  background: #ffffff;
  color: var(--color-text);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  display: grid;
  gap: 1rem;
}

.checkout-form h3 {
  margin: 0;
  font-family: var(--font-title);
  color: var(--color-primary);
}

.hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.fields {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.95rem;
}

input,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  box-sizing: border-box;
}

.payment-fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.payment-fieldset legend {
  font-weight: 600;
  padding: 0 0.25rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  cursor: pointer;
}

.radio-option input {
  width: auto;
}

.subtotal {
  margin: 0;
  font-size: 1.1rem;
}

.submit-btn {
  border: none;
  background: #25d366;
  color: #ffffff;
  padding: 0.9rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.form-error {
  margin: 0;
  color: #b33a3a;
  font-size: 0.95rem;
}
</style>
