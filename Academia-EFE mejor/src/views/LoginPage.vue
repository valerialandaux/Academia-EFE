<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import { useAuth } from '../composables/useAuth'
import { apiUrl, setAdminToken } from '../lib/api'
import { validarEmail, validarPassword } from '../lib/validacion'

const route = useRoute()
const router = useRouter()
const { login, isLoggedIn } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const errores = ref({ email: '', password: '' })
const cargando = ref(false)
const esDev = import.meta.env.DEV

onMounted(() => {
  if (isLoggedIn.value) {
    const dest = typeof route.query.redirect === 'string' ? route.query.redirect : '/inscripcion'
    router.replace(dest)
  }
})

function validarFormulario() {
  errores.value = {
    email: validarEmail(email.value),
    password: validarPassword(password.value),
  }
  return !errores.value.email && !errores.value.password
}

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  if (!validarFormulario()) return
  cargando.value = true
  try {
    await login(email.value, password.value)
    const dest = typeof route.query.redirect === 'string' ? route.query.redirect : '/inscripcion'
    router.push(dest)
  } catch (err) {
    if (String(err?.message || '').toLowerCase().includes('administración')) {
      try {
        const res = await fetch(apiUrl('/api/auth/login'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.value.trim(),
            password: password.value,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'No se pudo iniciar sesión')
        if (data.user?.role !== 'ADMIN') throw new Error('Esta cuenta no es de administrador')
        setAdminToken(data.token)
        const dest = typeof route.query.redirect === 'string' ? route.query.redirect : '/admin/inscripciones'
        router.push(dest)
      } catch (e2) {
        error.value = e2.message || 'No se pudo iniciar sesión'
      }
    } else {
      error.value = err.message || 'No se pudo iniciar sesión'
    }
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="pagina-login">
    <AppNavbar />

    <header class="page-hero page-hero--compact">
      <img
        class="page-hero-photo"
        :src="siteImages.heroCursos"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg page-hero-bg--alt" aria-hidden="true" />
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker">Acceso</p>
        <h1>Iniciar sesión</h1>
        <p class="page-hero-lead">Alumno o administrador — una sola entrada para tu cuenta.</p>
      </div>
    </header>

    <section class="seccion-formulario">
      <div class="contenedor-form anim-reveal">
        <RouterLink to="/" class="breadcrumb form-breadcrumb">← Volver al inicio</RouterLink>
        <h2>Tu cuenta</h2>
        <p class="auth-lead">
          Inicia sesión para ver precios en bolivianos con descuento (5%–15%) según los cursos que ya
          hayas hecho.
        </p>

        <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

        <form novalidate @submit="onSubmit">
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.email }">
            <label for="login-email">Correo</label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              autocomplete="username"
              maxlength="120"
              placeholder="correo@ejemplo.com"
              @input="errores.email = ''"
            />
            <p v-if="errores.email" class="campo-error" role="alert">{{ errores.email }}</p>
          </div>
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.password }">
            <label for="login-pass">Contraseña</label>
            <input
              id="login-pass"
              v-model="password"
              type="password"
              autocomplete="current-password"
              maxlength="120"
              placeholder="Mínimo 6 caracteres"
              @input="errores.password = ''"
            />
            <p v-if="errores.password" class="campo-error" role="alert">{{ errores.password }}</p>
          </div>
          <button type="submit" class="btn-enviar" :disabled="cargando">
            {{ cargando ? 'Entrando…' : 'Entrar' }}
          </button>
        </form>

        <p class="auth-switch">
          ¿No tienes cuenta?
          <RouterLink
            :to="{ path: '/registro', query: route.query.redirect ? { redirect: route.query.redirect } : {} }"
          >
            Crear cuenta gratis
          </RouterLink>
        </p>

        <p v-if="esDev" class="admin-demo">
          Demo (solo desarrollo): <code>demo@academiaefe.com</code> / <code>demo123</code>
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
