<template>
  <section class="admin-login-shell">
    <form class="login-card" @submit.prevent="handleLogin">
      <h2>Ingreso Admin</h2>
      <label>
        Usuario
        <input v-model="username" autocomplete="username" />
      </label>
      <label>
        Contraseña
        <input type="password" v-model="password" autocomplete="current-password" />
      </label>
      <div class="actions">
        <button type="submit" class="btn">Ingresar</button>
        <button type="button" class="btn" @click="cancel">Cancelar</button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')

const router = useRouter()
const route = useRoute()

function handleLogin() {
  // Credenciales simples en cliente — NO es seguro para producción
  if (username.value === 'fani' && password.value === '1234') {
    sessionStorage.setItem('isAdmin', 'true')
    window.dispatchEvent(new Event('admin-status-changed'))
    const redirect = route.query.redirect || '/admin-panel'
    router.push(redirect)
  } else {
    error.value = 'Usuario o contraseña incorrectos'
  }
}

function cancel() {
  router.push('/')
}
</script>

<style scoped>
.admin-login-shell {
  display:flex;
  align-items:center;
  justify-content:center;
  min-height: 100vh;
  background: var(--color-background);
}
.login-card {
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  width: 360px;
  display:flex;
  flex-direction:column;
  gap:1rem;
}
.login-card h2 { margin:0 0 0.5rem 0 }
.login-card label { display:flex; flex-direction:column; gap:0.4rem; font-weight:600 }
.login-card input { padding:0.6rem; border-radius:8px; border:1px solid #ddd }
.actions { display:flex; gap:0.5rem }
.error { color: #b00020; font-weight:700 }
</style>