import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import ProductView from '../views/ProductView.vue'
import CartView from '../views/CartView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: CatalogView,
    },
    {
      path: '/producto/:id',
      name: 'producto',
      component: ProductView,
    },
    {
      path: '/carrito',
      name: 'carrito',
      component: CartView,
    },
  ],
})

export default router