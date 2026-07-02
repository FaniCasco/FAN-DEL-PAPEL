<template>
  <section class="hero">

    <div class="hero-content">

      <div class="hero-brand">
        <span class="tag">
          💌 Cartas y papelería personalizada
        </span>
        <h1>
          Escribí mensajes
          <br>
          con diseños únicos para animar a otros
        </h1>
      </div>

      <RouterLink
        to="/catalogo"
        class="btn"
      >
        Ver catálogo
      </RouterLink>

    </div>

    <div class="hero-image">
      <img :src="logo" alt="Fan del Papel" class="hero-side-logo" />
    </div>

  </section>
</template>

<script setup>
import logo from '@/assets/images/logo.png'
</script>

<style scoped>

.hero{

    display:flex;

    justify-content:space-between;

    align-items:center;

    min-height:75vh;

    padding:80px;

}

.hero-content{

    width:50%;

}

.tag{

    display:inline-block;

    background:white;

    padding:10px 20px;

    border-radius:30px;

    margin-bottom:25px;

    font-weight:600;

}

h1{

    font-size:64px;

    line-height:1.1;

    margin: 0;

}

.hero-brand {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
}

.hero-side-logo {
    width: 320px;
    height: 320px;
    object-fit: contain;
}

p{

    font-size:20px;

    color:var(--color-gray);

    margin-bottom:40px;

    max-width:550px;

}

.btn{

    display:inline-block;

    background:var(--color-primary);

    color:white;

    padding:18px 40px;

    border-radius:50px;

    font-weight:bold;

    transition:.3s;

}

.btn:hover{

    transform:translateY(-3px);

}

.hero-image{

    width:40%;

    display:flex;

    justify-content:center;

    align-items:center;

}

.hero-image img{

    width:auto;

    max-width:100%;

    height:auto;

}

</style>