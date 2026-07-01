<template>

<header>

    <div class="logo">

        <RouterLink to="/">

            <img src="../../assets/images/logo.png" alt="Fan del Papel">

        </RouterLink>

    </div>

    <nav>

        <RouterLink to="/">Inicio</RouterLink>

        <RouterLink to="/catalogo">Catálogo</RouterLink>

        <RouterLink to="/carrito" class="cart">

            🛒

        </RouterLink>

    </nav>

</header>

</template>

<style scoped>

header{

    height:90px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 80px;

    background:white;

    border-bottom:4px solid var(--color-primary);

    box-shadow:var(--shadow);

}

.logo img{

    height:70px;

}

nav{

    display:flex;

    align-items:center;

    gap:40px;

}

a{

    font-weight:600;

    transition:.3s;

}

a:hover{

    color:var(--color-primary);

}

.router-link-active{

    color:var(--color-primary);

}

.cart{

    width:45px;

    height:45px;

    display:flex;

    justify-content:center;

    align-items:center;

    border-radius:50%;

    background:var(--color-secondary);

    font-size:22px;

}

</style>