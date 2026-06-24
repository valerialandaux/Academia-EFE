<script setup>
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

function active(path) {
  return route.path === path
}
</script>

<template>
  <nav class="admin-nav" aria-label="Panel administración">
    <RouterLink to="/admin/inscripciones" class="admin-nav-link" :class="{ activo: active('/admin/inscripciones') }"
      >Inscripciones</RouterLink
    >
    <RouterLink to="/admin/cursos" class="admin-nav-link" :class="{ activo: active('/admin/cursos') }"
      >Cursos</RouterLink
    >
    <RouterLink to="/admin/galeria" class="admin-nav-link" :class="{ activo: active('/admin/galeria') }"
      >Galería</RouterLink
    >
    <RouterLink to="/admin/nosotros" class="admin-nav-link" :class="{ activo: active('/admin/nosotros') }"
      >Nosotros</RouterLink
    >
  </nav>
</template>

