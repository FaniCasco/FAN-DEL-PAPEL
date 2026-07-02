<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="logo">
        <RouterLink to="/" class="logo-link">
          <img :src="logo" alt="Fan del Papel" class="logo-img" />
        </RouterLink>
      </div>

      <!-- Hamburger Button (Mobile) -->
      <button 
        class="menu-toggle" 
        :class="{ 'is-active': isMenuOpen }" 
        @click="toggleMenu"
        aria-label="Menu de navegación"
        :aria-expanded="isMenuOpen"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Navigation Links -->
      <nav class="nav-menu" :class="{ 'is-open': isMenuOpen }">
        <RouterLink to="/" class="nav-link" @click="closeMenu">Inicio</RouterLink>
        <RouterLink to="/catalogo" class="nav-link" @click="closeMenu">Catálogo</RouterLink>
        <RouterLink v-if="isAdmin" to="/admin-panel" class="nav-link" @click="closeMenu">Admin</RouterLink>
        
        <!-- Carrito con Badge (oculto en admin) -->
        <RouterLink v-if="!isAdmin" to="/carrito" class="nav-link-cart" @click="closeMenu">
          <span class="cart-icon">🛒</span>
          <span class="cart-text">Carrito</span>
          <Transition name="pop">
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
              {{ cartStore.totalItems }}
            </span>
          </Transition>
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import logo from '@/assets/images/logo.png'

const cartStore = useCartStore()
const isMenuOpen = ref(false)
const isAdmin = ref(false)

function updateAdminStatus() {
  isAdmin.value = typeof window !== 'undefined' && window.sessionStorage.getItem('isAdmin') === 'true'
}

onMounted(() => {
  updateAdminStatus()
  window.addEventListener('admin-status-changed', updateAdminStatus)
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
/* Estilos premium de Navbar */
.navbar-header {
  background-color: var(--color-background);
  border-bottom: 1px solid rgba(212, 163, 115, 0.2); /* Dorado muy sutil */
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  height: 120px;
}

/* Logo */
.logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.logo-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
}

.logo-text,
.logo-subtext {
  display: none;
}

/* Menú de Navegación Desktop */
.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  color: #f8799f;
  position: relative;
  padding: 6px 0;
}

/* Línea animada en Hover */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #f8799f;
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.router-link-active:not(.logo-link):not(.nav-link-cart) {
  color: var(--color-primary);
}

.router-link-active:not(.logo-link):not(.nav-link-cart)::after {
  transform: scaleX(1);
}

/* Botón Carrito */
.nav-link-cart {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-bg-terracotta);
  color: var(--color-primary);
  padding: 10px 18px;
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: 0.95rem;
  position: relative;
  border: 1px solid rgba(192, 92, 62, 0.1);
  box-shadow: var(--shadow-sm);
}

.nav-link-cart:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 4px 12px rgba(192, 92, 62, 0.15);
  transform: translateY(-2px);
}

.cart-icon {
  font-size: 1.1rem;
}

.cart-badge {
  background-color: #ff0000;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
  position: absolute;
  top: -6px;
  right: -6px;
  border: 2px solid var(--color-background);
  box-shadow: var(--shadow-sm);
}

/* Animación del Badge */
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse;
}
@keyframes pop-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

/* Mobile Toggle */
.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  z-index: 1001;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: var(--transition);
}

/* Responsive & Mobile Menu */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  /* Hamburger Animado */
  .menu-toggle.is-active .hamburger-line:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
    background-color: var(--color-primary);
  }

  .menu-toggle.is-active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle.is-active .hamburger-line:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
    background-color: var(--color-primary);
  }

  /* Menú desplegable Mobile */
  .nav-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 100vh;
    background-color: rgba(252, 251, 247, 0.97); /* Cream lino con alta opacidad */
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    flex-direction: column;
    justify-content: center;
    gap: 36px;
    padding: 40px;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 999;
  }

  .nav-menu.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    font-size: 1.6rem;
    font-family: var(--font-title);
    font-weight: 600;
  }

  .nav-link-cart {
    font-size: 1.2rem;
    padding: 12px 24px;
    width: 100%;
    max-width: 240px;
    justify-content: center;
  }
}
</style>