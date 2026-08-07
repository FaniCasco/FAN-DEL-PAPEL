import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '+54 9 3564582222'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const customerInfo = ref(null)
  const lastWhatsappUrl = ref('')

  const storedCart = localStorage.getItem('fan_del_papel_cart')
  if (storedCart) {
    try {
      items.value = JSON.parse(storedCart)
    } catch (error) {
      console.error('Error al inicializar el carrito desde localStorage:', error)
      items.value = []
    }
  }

  watch(
    items,
    (newItems) => {
      localStorage.setItem('fan_del_papel_cart', JSON.stringify(newItems))
    },
    { deep: true }
  )

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
      minimumFractionDigits: 0,
    }).format(value)
  }

  const whatsappMessage = computed(() => {
    if (items.value.length === 0) {
      return '¡Hola! Mi pedido está vacío.'
    }

    let message = '¡Hola Fani! Te encargo lo siguiente:\n\n'

    if (customerInfo.value) {
      message += `*Datos del cliente:*\n`
      message += `Nombre: ${customerInfo.value.nombreApellido}\n`
      message += `Teléfono: ${customerInfo.value.telefono}\n`
      message += `Forma de pago: ${customerInfo.value.formaPago === 'transferencia' ? 'Transferencia' : 'Efectivo'}\n\n`
    }

    items.value.forEach((item) => {
      const priceFormatted = formatCurrency(item.precio)
      const subtotalFormatted = formatCurrency(item.precio * item.quantity)
      const category = String(item.categoria || '').trim()
      const subcategory = String(item.subcategoria || '').trim()
      const categoryLabel = category ? `${category.toUpperCase()}: ` : ''
      const subcategoryLabel = subcategory ? ` (${subcategory})` : ''

      message += `• *${categoryLabel}${item.nombre}${subcategoryLabel}* x${item.quantity}\n`
      message += `  Precio unitario: ${priceFormatted} | Subtotal: ${subtotalFormatted}\n\n`
    })

    const totalFormatted = formatCurrency(totalPrice.value)
    message += `*Total del pedido: ${totalFormatted}*\n\n`
    message += 'Muchas gracias. ¡Quedo a la espera de la confirmación!'
    return message
  })

  function getWhatsappUrl() {
    const text = whatsappMessage.value
    const num = (WHATSAPP_NUMBER || '').replace(/\s+/g, '')
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
  }

  function addToCart(product, quantity = 1) {
    if (quantity <= 0) {
      console.warn(`Intento de agregar ${product.nombre} con cantidad ${quantity} no válida.`)
      return
    }

    lastWhatsappUrl.value = ''

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
    customerInfo.value = null
  }

  function setCustomerInfo(info) {
    customerInfo.value = info
  }

  return {
    items,
    customerInfo,
    lastWhatsappUrl,
    whatsappNumber: WHATSAPP_NUMBER,
    totalItems,
    totalPrice,
    whatsappMessage,
    getWhatsappUrl,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCustomerInfo,
  }
})
