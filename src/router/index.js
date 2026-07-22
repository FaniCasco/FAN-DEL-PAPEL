import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import CatalogView from '../views/CatalogView.vue';
import ProductView from '../views/ProductView.vue';
import CartView from '../views/CartView.vue';
import AdminView from '../views/AdminView.vue';
import AdminLogin from '../views/AdminLogin.vue';

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/catalogo', name: 'Catalog', component: CatalogView, meta: { showCategorySidebar: true } },
  { path: '/producto/:id', name: 'ProductDetail', component: ProductView, props: true, meta: { showCategorySidebar: true } },
  { path: '/sobre-mi', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/carrito', name: 'Cart', component: CartView, meta: { showCategorySidebar: false } },
  { path: '/admin', redirect: '/admin-login' },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
  { path: '/admin-panel', name: 'AdminPanel', component: AdminView, meta: { requiresAdmin: true } },
  // ... otras rutas existentes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Cliente: guardia simple para /admin-panel usando sessionStorage
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAdmin) {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    if (isAdmin) return (next());
    return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
  }
  next();
});

export default router;
