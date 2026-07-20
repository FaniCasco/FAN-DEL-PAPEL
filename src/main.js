import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import router from './router'
import { useProductsStore } from './stores/products'
import { useOrdersStore } from './stores/orders'
import './styles/global.css'

const bootstrap = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const productsStore = useProductsStore(pinia)
  const ordersStore = useOrdersStore(pinia)
  await Promise.all([productsStore.loadProducts(), ordersStore.loadOrders()])

  app.mount('#app')
}

bootstrap()
