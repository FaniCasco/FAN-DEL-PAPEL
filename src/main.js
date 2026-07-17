import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import router from './router'
import { useProductsStore } from './stores/products'
import './styles/global.css'

const bootstrap = async () => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  const productsStore = useProductsStore(pinia)
  await productsStore.loadProducts()

  app.mount('#app')
}

bootstrap()
