<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import { useAuth } from '../composables/useAuth'
import {
  validarEmail,
  validarNombre,
  validarPassword,
  validarTelefono,
} from '../lib/validacion'

const route = useRoute()
const router = useRouter()
const { register, isLoggedIn } = useAuth()

const nombre = ref('')
const email = ref('')
const telefono = ref('')
const password = ref('')
const password2 = ref('')
const error = ref('')
const errores = ref({ nombre: '', email: '', telefono: '', password: '', password2: '' })
const cargando = ref(false)

onMounted(() => {
  if (isLoggedIn.value) {
    router.replace('/inscripcion')
  }
})

function validarFormulario() {
  errores.value = {
    nombre: validarNombre(nombre.value),
    email: validarEmail(email.value),
    telefono: validarTelefono(telefono.value, false),
    password: validarPassword(password.value),
    password2:
      password.value !== password2.value ? 'Las contraseñas no coinciden.' : '',
  }
  return Object.values(errores.value).every((m) => !m)
}

async function onSubmit(e) {
  e.preventDefault()
  error.value = ''
  if (!validarFormulario()) return
  cargando.value = true
  try {
    await register({
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value,
      password: password.value,
    })
    const dest = typeof route.query.redirect === 'string' ? route.query.redirect : '/inscripcion'
    router.push(dest)
  } catch (err) {
    error.value = err.message || 'No se pudo crear la cuenta'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="pagina-registro">
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
        <p class="hero-kicker">Registro</p>
        <h1>Crear cuenta</h1>
        <p class="page-hero-lead">Un solo registro para inscribirte y ver tus descuentos en Bs.</p>
      </div>
    </header>

    <section class="seccion-formulario">
      <div class="contenedor-form anim-reveal">
        <RouterLink to="/login" class="breadcrumb form-breadcrumb">← Ya tengo cuenta</RouterLink>
        <h2>Cuenta de alumno</h2>
        <p class="auth-lead">
          Regístrate una vez. Al iniciar sesión verás precios en Bs con descuento: 5% en
          el primer curso, 10% en el segundo y 15% desde el tercero.
        </p>

        <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

        <form novalidate @submit="onSubmit">
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.nombre }">
            <label for="reg-nombre">Nombre completo</label>
            <input
              id="reg-nombre"
              v-model="nombre"
              type="text"
              maxlength="120"
              placeholder="Ej: Ana Pérez"
              @input="errores.nombre = ''"
            />
            <p v-if="errores.nombre" class="campo-error" role="alert">{{ errores.nombre }}</p>
          </div>
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.email }">
            <label for="reg-email">Correo</label>
            <input
              id="reg-email"
              v-model="email"
              type="email"
              autocomplete="username"
              maxlength="120"
              placeholder="correo@ejemplo.com"
              @input="errores.email = ''"
            />
            <p v-if="errores.email" class="campo-error" role="alert">{{ errores.email }}</p>
          </div>
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.telefono }">
            <label for="reg-tel">Teléfono (opcional)</label>
            <input
              id="reg-tel"
              v-model="telefono"
              type="tel"
              placeholder="+591 70000000"
              inputmode="tel"
              maxlength="20"
              @input="errores.telefono = ''"
            />
            <p v-if="errores.telefono" class="campo-error" role="alert">{{ errores.telefono }}</p>
          </div>
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.password }">
            <label for="reg-pass">Contraseña</label>
            <input
              id="reg-pass"
              v-model="password"
              type="password"
              autocomplete="new-password"
              maxlength="120"
              placeholder="Mínimo 6 caracteres"
              @input="errores.password = ''"
            />
            <p v-if="errores.password" class="campo-error" role="alert">{{ errores.password }}</p>
          </div>
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.password2 }">
            <label for="reg-pass2">Repetir contraseña</label>
            <input
              id="reg-pass2"
              v-model="password2"
              type="password"
              autocomplete="new-password"
              maxlength="120"
              @input="errores.password2 = ''"
            />
            <p v-if="errores.password2" class="campo-error" role="alert">{{ errores.password2 }}</p>
          </div>
          <button type="submit" class="btn-enviar" :disabled="cargando">
            {{ cargando ? 'Creando cuenta…' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="auth-switch">
          ¿Ya tienes cuenta?
          <RouterLink to="/login">Iniciar sesión</RouterLink>
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
