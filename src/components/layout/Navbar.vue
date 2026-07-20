<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <div class="logo">
        <RouterLink to="/" class="logo-link" @click="closeMenu">
          <img :src="logo" alt="Fan del Papel" class="logo-img" />
        </RouterLink>
      </div>

      <div class="mobile-toolbar">
        <RouterLink
          to="/carrito"
          class="toolbar-btn cart-toolbar-btn"
          aria-label="Ver carrito"
          @click="closeMenu"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <Transition name="pop">
            <span v-if="cartStore.totalItems > 0" class="toolbar-badge">
              {{ cartStore.totalItems }}
            </span>
          </Transition>
        </RouterLink>

        <button
          class="menu-toggle"
          :class="{ 'is-active': isMenuOpen }"
          @click="toggleMenu"
          aria-label="Menú de navegación"
          :aria-expanded="isMenuOpen"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>

      <nav class="nav-menu" :class="{ 'is-open': isMenuOpen }">
        <RouterLink to="/" class="nav-link" @click="closeMenu">Inicio</RouterLink>
        <RouterLink to="/catalogo" class="nav-link" @click="closeMenu">Catálogo</RouterLink>

        <RouterLink to="/carrito" class="nav-link-cart desktop-cart" @click="closeMenu">
          <svg class="cart-svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
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
import { ref } from 'vue'
import { useCartStore } from '../../stores/cart'
import logo from '@/assets/images/logo.png'

const cartStore = useCartStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<style scoped>
.navbar-header {
  background-color: var(--color-background);
  border-bottom: 1px solid rgba(212, 163, 115, 0.2);
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

.mobile-toolbar {
  display: none;
}

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

.cart-svg {
  flex-shrink: 0;
}

.desktop-cart {
  display: flex;
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
  padding: 0;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: var(--transition);
}

@media (max-width: 768px) {
  .navbar-header {
    background-color: var(--color-primary);
    border-bottom: none;
  }

  .navbar-container {
    height: 56px;
    padding: 0 16px;
  }

  .logo-img {
    width: 44px;
    height: 44px;
  }

  .mobile-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 1001;
  }

  .toolbar-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: #ffffff;
    border-radius: 50%;
    transition: background 0.2s ease;
    position: relative;
  }

  .cart-toolbar-btn {
    text-decoration: none;
  }

  .toolbar-badge {
    position: absolute;
    top: -2px;
    right: -2px;
    background-color: #ffffff;
    color: var(--color-primary);
    font-size: 0.65rem;
    font-weight: 700;
    min-width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
  }

  .toolbar-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .menu-toggle {
    display: flex;
  }

  .hamburger-line {
    background-color: #ffffff;
  }

  .menu-toggle.is-active .hamburger-line:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
    background-color: #ffffff;
  }

  .menu-toggle.is-active .hamburger-line:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle.is-active .hamburger-line:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
    background-color: #ffffff;
  }

  .nav-menu {
    position: fixed;
    top: 56px;
    left: 0;
    right: 0;
    height: calc(100vh - 56px);
    background-color: var(--color-primary);
    flex-direction: column;
    justify-content: flex-start;
    gap: 0;
    padding: 24px 20px 40px;
    transform: translateY(-110%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 999;
    overflow-y: auto;
  }

  .nav-menu.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    font-size: 1.25rem;
    font-family: var(--font-title);
    font-weight: 600;
    color: #ffffff;
    width: 100%;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .nav-link::after {
    display: none;
  }

  .nav-link:hover,
  .router-link-active:not(.logo-link):not(.nav-link-cart) {
    color: #ffffff;
    opacity: 0.85;
  }

  .desktop-only {
    display: none;
  }

  .mobile-menu-cart,
  .desktop-cart {
    display: none;
  }

  .nav-link-cart {
    margin-top: 20px;
    width: 100%;
    max-width: none;
    justify-content: center;
    background: #ffffff;
    color: var(--color-primary);
    font-size: 1.1rem;
    padding: 14px 24px;
    border: none;
  }

  .nav-link-cart:hover {
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-primary);
    transform: none;
  }

  .cart-badge {
    border-color: #ffffff;
  }
}
</style>
