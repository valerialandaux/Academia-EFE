<script setup>
import { RouterLink } from 'vue-router'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="footer-brand">
        <RouterLink to="/" class="footer-logo logo-brand">
          <img src="/images/logo-mejor.png" alt="Logo Academia EFE" class="brand-logo-img" width="36" height="36" />
          <span>EFE</span>
        </RouterLink>
        <p>Formación en fotografía y narrativa visual para alumnos que quieren crear con intención.</p>
      </div>

      <section class="footer-block footer-contact">
        <h4>Contacto</h4>
        <a class="btn-footer-mail" href="mailto:hola@academiaefe.com">hola@academiaefe.com</a>
        <p class="footer-info-line">La Paz, Bolivia · Clases presenciales</p>
        <p class="footer-info-line">Atención: Lun–Vie 9:00–19:00</p>
      </section>

      <section class="footer-block footer-community">
        <h4>Comunidad</h4>
        <p class="footer-info-line">Síguenos pronto en redes. Mientras tanto, escríbenos por correo.</p>
        <div class="footer-socials footer-socials--soon" aria-label="Redes sociales próximamente">
          <span class="social-icon social-icon--soon" title="Instagram próximamente" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 1.8A4 4 0 0 0 3.8 7.8v8.4a4 4 0 0 0 4 4h8.4a4 4 0 0 0 4-4V7.8a4 4 0 0 0-4-4H7.8Zm8.86 1.34a1.22 1.22 0 1 1 0 2.44 1.22 1.22 0 0 1 0-2.44ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"
              />
            </svg>
          </span>
          <span class="social-icon social-icon--soon" title="Facebook próximamente" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M13.5 22v-8h2.7l.5-3h-3.2V9.2c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5V11H7v3h2.8v8h3.7Z"
              />
            </svg>
          </span>
          <span class="social-icon social-icon--soon" title="YouTube próximamente" aria-hidden="true">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22 12c0 2.2-.2 3.7-.5 4.6-.3.8-.8 1.3-1.6 1.6-.9.3-2.5.5-4.9.5H9c-2.4 0-4-.2-4.9-.5-.8-.3-1.3-.8-1.6-1.6C2.2 15.7 2 14.2 2 12s.2-3.7.5-4.6c.3-.8.8-1.3 1.6-1.6C5 5.5 6.6 5.3 9 5.3h6c2.4 0 4 .2 4.9.5.8.3 1.3.8 1.6 1.6.3.9.5 2.4.5 4.6Zm-11.5-3.2v6.4l5.6-3.2-5.6-3.2Z"
              />
            </svg>
          </span>
        </div>
      </section>
    </div>

    <div class="footer-bottom">
      <p class="footer-copy">© {{ year }} Academia EFE. Todos los derechos reservados.</p>
      <div class="footer-legal">
        <RouterLink to="/nosotros">Sobre la academia</RouterLink>
        <RouterLink to="/inscripcion">Ayuda de inscripción</RouterLink>
      </div>
    </div>
  </footer>
</template>
