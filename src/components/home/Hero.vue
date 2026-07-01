<template>
  <section class="hero">

    <div class="hero-content">

      <span class="tag">
        💌 Cartas y papelería personalizada
      </span>

      <h1>
        Regalá emociones
        <br>
        hechas en papel
      </h1>

      <p>
        Cartas, sobres y diseños personalizados para sorprender a alguien especial.
      </p>

      <RouterLink
        to="/catalogo"
        class="btn"
      >
        Ver catálogo
      </RouterLink>

    </div>

    <div class="hero-image">

      <img
        src="../../assets/images/logo.png"
        alt="Fan del Papel"
      >

    </div>

  </section>
</template>

<script setup>
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

    margin-bottom:25px;

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

}

.hero-image img{

    width:90%;

}

</style>