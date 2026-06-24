<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  // Unificamos el acceso admin dentro de /login
  router.replace({
    path: '/login',
    query: { ...route.query, admin: '1' },
  })
})
</script>

<template>
  <div class="pagina-admin-login">
    <section class="seccion-formulario">
      <div class="contenedor-form anim-reveal admin-form-narrow">
        <p class="auth-lead">Redirigiendo al inicio de sesión…</p>
      </div>
    </section>
  </div>
</template>
