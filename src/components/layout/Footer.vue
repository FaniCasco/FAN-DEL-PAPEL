<template>
  <footer class="footer">
    <div class="footer-container">
      
      <!-- Brand Section -->
      <div class="footer-brand">
        <h3 class="brand-title">Fan del Papel</h3>
        <p class="brand-description">
          Cartas, sobres y papelería personalizada hechos a mano con amor y dedicación. Cada detalle cuenta una historia.
        </p>
        <div class="handcrafted-badge">
          <span>🌿 100% Hecho a Mano</span>
        </div>
      </div>

      <!-- Links Section -->
      <div class="footer-links">
        <h4 class="section-title">Explorá</h4>
        <ul class="links-list">
          <li><RouterLink to="/" class="footer-link">Inicio</RouterLink></li>
          <li><RouterLink to="/about" class="footer-link">Acerca de mí</RouterLink></li>
          <li><RouterLink to="/catalogo" class="footer-link">Catálogo</RouterLink></li>
          <li><RouterLink to="/carrito" class="footer-link">Pedidos</RouterLink></li>
        </ul>
      </div>

      <!-- Contact Section -->
      <div class="footer-contact">
        <h4 class="section-title">Contacto</h4>
        <ul class="contact-list">
          <li>
            <a href="https://wa.me/5493564582222" target="_blank" rel="noopener noreferrer" class="contact-link">
              <span class="icon">💬</span> WhatsApp
            </a>
          </li>
          
          <li>
            <a href="mailto:fanymar@live.com" class="contact-link">
              <span class="icon">✉️</span> fanymar@live.com
            </a>
          </li>
        </ul>
      </div>

    </div>

    <!-- Bottom Copyright -->
    <div class="footer-bottom">
      <div class="bottom-container">
        <p class="copyright">
          &copy; {{ new Date().getFullYear() }} Fan del Papel. Todos los derechos reservados.
        </p>
        <p class="craft-tagline">
          Diseñado con alma y papel &bull; Argentina
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #f8799f; /* Un tono ligeramente más cálido y oscuro que el lino principal para dar base */
  border-top: 1px solid rgba(254, 253, 251, 0.25); /* Dorado muy sutil */
  padding: 60px 0 0 0;
  margin-top: auto; /* Para empujar el footer al fondo si el contenido es corto */
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 40px 24px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 60px;
}

/* Marca */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.brand-title {
  font-family: var(--font-title);
  font-size: 2rem;
  color: white; /* Terracota */
  font-weight: 700;
}

.brand-description {
  color: white;
  max-width: 360px;
  font-size: 0.95rem;
  line-height: 1.6;
}

.handcrafted-badge {
  align-self: flex-start;
  background-color: var(--color-bg-sage);
  color: green; /* Verde salvia */
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(110, 139, 126, 0.15);
}

/* Título de Sección */
.section-title {
  font-family: var(--font-title);
  font-size: 1.25rem;
  color: white;
  margin-bottom: 20px;
  position: relative;
  font-weight: 600;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 30px;
  height: 2px;
  background-color: var(--color-accent); /* Dorado */
  border-radius: var(--radius-full);
}

/* Listas */
.links-list,
.contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link,
.contact-link {
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.footer-link:hover,
.contact-link:hover {
  background: white;
  color: var(--color-primary);
  transform: translateX(4px);
  padding: 5px;
   border-radius: var(--radius-full);
}

.contact-link .icon {
  font-size: 1rem;
}

/* Pie inferior */
.footer-bottom {
  border-top: 1px solid rgba(46, 39, 36, 0.05);
  background-color: rgba(46, 39, 36, 0.02);
  padding: 24px 0;
}

.bottom-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.copyright,
.craft-tagline {
  font-size: 0.85rem;
  color: white;
  margin: 0;
}

.craft-tagline {
  font-style: italic;
  font-family: var(--font-title);
}

/* Responsive Footer */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-bottom: 30px;
  }

  .section-title::after {
    left: 0;
  }

  .bottom-container {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>