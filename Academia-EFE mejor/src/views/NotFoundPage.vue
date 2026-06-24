<script setup>
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
</script>

<template>
  <div class="pagina-404">
    <AppNavbar />

    <section class="detalle-404 anim-fade-up">
      <p class="hero-kicker">Error 404</p>
      <h1>Página no encontrada</h1>
      <p class="auth-lead">La ruta que buscas no existe o fue movida.</p>
      <div class="hero-actions" style="justify-content: center; margin-top: 24px">
        <RouterLink to="/" class="btn-cta-large btn-glow">Volver al inicio</RouterLink> /*botones */
        <RouterLink to="/cursos" class="btn-outline-light">Ver cursos</RouterLink>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
