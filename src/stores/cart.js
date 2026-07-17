import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const WHATSAPP_NUMBER = '+54 9 3564582222'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  // Cargar estado inicial desde localStorage al crear el store
  const storedCart = localStorage.getItem('fan_del_papel_cart')
  if (storedCart) {
    try {
      items.value = JSON.parse(storedCart)
    } catch (e) {
      console.error('Error al inicializar el carrito desde localStorage:', e)
      items.value = []
    }
  }

  // Guardar los cambios reactivamente mediante un watcher
  watch(
    items,
    (newItems) => {
      localStorage.setItem('fan_del_papel_cart', JSON.stringify(newItems))
    },
    { deep: true }
  )

  // Getters (computed)
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => total + item.precio * item.quantity, 0)
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value)
  }

  const whatsappMessage = computed(() => {
    if (items.value.length === 0) {
      return '¡Hola! Mi carrito está vacío.'
    }

    let message = '¡Hola! Quisiera realizar el siguiente pedido en Fan del Papel:\n\n'

    items.value.forEach((item) => {
      const priceFormatted = formatCurrency(item.precio)
      const subtotalFormatted = formatCurrency(item.precio * item.quantity)
      message += `• *${item.nombre}* x${item.quantity}\n`
      message += `  Precio unitario: ${priceFormatted} | Subtotal: ${subtotalFormatted}\n\n`
    })

    const totalFormatted = formatCurrency(totalPrice.value)
    message += `*Total del pedido: ${totalFormatted}*\n\n`
    message += 'Muchas gracias. ¡Quedo a la espera de la confirmación!'
    return message
  })

  // Acciones (functions)
  function addToCart(product, quantity = 1) {
    // No permitir añadir cantidades no positivas
    if (quantity <= 0) {
      console.warn(`Intento de agregar ${product.nombre} con cantidad ${quantity} no válida.`)
      return
    }
    const existing = items.value.find((item) => item.id === product.id)
    const currentQty = existing ? existing.quantity : 0
    const newQty = currentQty + quantity

    if (existing) {
      existing.quantity = newQty
    } else {
      items.value.push({ ...product, quantity })
    }
  }

  function removeFromCart(productId) {
    items.value = items.value.filter((item) => item.id !== productId)
  }

  function updateQuantity(productId, quantity) {
    const existing = items.value.find((item) => item.id === productId)
    if (existing) {
      existing.quantity = Math.max(1, quantity)
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    whatsappNumber: WHATSAPP_NUMBER,
    totalItems,
    totalPrice,
    whatsappMessage,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})
