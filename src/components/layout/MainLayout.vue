<template>
  <Navbar />

  <main class="container">
    <slot />
  </main>

  <Footer />
</template>

<script setup>
import Navbar from "./Navbar.vue"
import Footer from "./Footer.vue"
</script>

<style scoped>

.container{
    min-height:calc(100vh - 160px);
}

</style>