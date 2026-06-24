<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import { formatPrecio, precioConDescuento } from '../lib/precios'
import { apiUrl, authHeaders } from '../lib/api'
import { useAuth } from '../composables/useAuth'
import CursoPrecio from '../components/CursoPrecio.vue'
import { useContent } from '../composables/useContent'
import { validarEmail, validarNombre, validarTelefono } from '../lib/validacion'

const route = useRoute()
const { user, fetchMe, rellenarFormulario, descuento, inscripcionesActivas } = useAuth()  /*autentificacion */
const { cursos, fetchCursos } = useContent()

const nombre = ref('')
const correo = ref('')
const telefono = ref('')
const taller = ref('')

const enviando = ref(false)
const mensajeOk = ref('')
const mensajeError = ref('')
const errores = ref({ nombre: '', correo: '', telefono: '', taller: '' })

const descuentoTexto = computed(() => {
  if (!descuento.value?.porcentaje) return null
  return `${descuento.value.porcentaje}% — ${descuento.value.etiqueta}`
})

const cursoSeleccionado = computed(() =>
  taller.value ? (cursos.value || []).find((c) => c.slug === taller.value) : null,
)

function etiquetaTallerOpcion(curso) {
  if (!curso?.precio) return curso.titulo
  const pct = descuento.value?.porcentaje ?? 0
  if (pct) {
    return `${curso.titulo} — ${formatPrecio(precioConDescuento(curso.precio, pct))}`
  }
  return `${curso.titulo} — ${formatPrecio(curso.precio)}`
}

onMounted(async () => {
  await fetchMe()
  await fetchCursos()
  const q = route.query.taller
  if (typeof q === 'string' && (cursos.value || []).some((c) => c.slug === q)) {
    taller.value = q
  }
  rellenarFormulario({ nombre, correo, telefono })
})

function validarFormulario() {
  errores.value = {
    nombre: validarNombre(nombre.value),
    correo: validarEmail(correo.value),
    telefono: validarTelefono(telefono.value),
    taller: taller.value ? '' : 'Selecciona un taller.',
  }
  return Object.values(errores.value).every((m) => !m)
}

async function onSubmit(e) {
  e.preventDefault()
  if (enviando.value) return
  mensajeOk.value = ''
  mensajeError.value = ''
  if (!validarFormulario()) return
  enviando.value = true

  try {
    const res = await fetch(apiUrl('/api/inscripciones'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
      body: JSON.stringify({
        nombre: nombre.value,
        correo: correo.value,
        telefono: telefono.value,
        taller: taller.value,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      mensajeError.value = data.error || 'No se pudo enviar. Revisa los datos o el servidor.'
      return
    }
    mensajeOk.value =
      (data.mensaje || '¡Listo! Hemos recibido tu solicitud.') +
      ' Puedes ver el estado en Mis solicitudes.'
    taller.value = ''
    await fetchMe()
  } catch {
    mensajeError.value =
      'No hay conexión con el servidor. Ejecuta el API (carpeta server) o usa npm run dev:full desde la raíz.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="pagina-inscripcion">
    <AppNavbar />

    <header class="page-hero page-hero--compact">
      <img
        class="page-hero-photo"
        :src="siteImages.heroInscripcion"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg" aria-hidden="true" />
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker">Inscripción</p>
        <h1>Reserva tu plaza</h1>
        <p class="page-hero-lead">
          Hola{{ user?.nombre ? `, ${user.nombre.split(' ')[0]}` : '' }}. Completa el taller y envía tu
          solicitud.
        </p>
      </div>
    </header>

    <section class="seccion-formulario">
      <div class="contenedor-form anim-reveal">
        <RouterLink to="/cursos" class="breadcrumb form-breadcrumb">← Volver a cursos</RouterLink>
        <h2>Taller de fotografía</h2>

        <div v-if="descuentoTexto" class="descuento-banner" role="status">
          <strong>Descuento por iniciar sesión:</strong> {{ descuentoTexto }} (aplicado porque accediste con
          tu cuenta de alumno).
          <span v-if="inscripcionesActivas > 0" class="descuento-banner-meta">
            {{ inscripcionesActivas }} inscripción(es) activa(s) en tu historial.
          </span>
        </div>

        <div v-if="cursoSeleccionado?.precio" class="inscripcion-precio-block">
          <p class="inscripcion-precio-label">Importe estimado — {{ cursoSeleccionado.titulo }}</p>
          <CursoPrecio :precio="cursoSeleccionado.precio" size="lg" :show-guest-hint="false" />
          <p class="inscripcion-precio-nota">
            Importes en bolivianos (Bs). Precio orientativo; el total final se confirma al aprobar tu plaza.
          </p>
        </div>

        <p v-if="mensajeOk" class="form-msg form-msg-ok" role="status">
          {{ mensajeOk }}
          <RouterLink to="/mis-solicitudes" class="form-msg-link">Ver mis solicitudes →</RouterLink>
        </p>
        <p v-if="mensajeError" class="form-msg form-msg-error" role="alert">{{ mensajeError }}</p>

        <form novalidate @submit="onSubmit">
          <div class="grupo-input" :class="{ 'grupo-input--error': errores.nombre }">
            <label for="nombre">Nombre completo</label>
            <input
              id="nombre"
              v-model="nombre"
              type="text"
              placeholder="Ej: Sergio Márquez"
              maxlength="120"
              @input="errores.nombre = ''"
            />
            <p v-if="errores.nombre" class="campo-error" role="alert">{{ errores.nombre }}</p>
          </div>

          <div class="grupo-input" :class="{ 'grupo-input--error': errores.correo }">
            <label for="correo">Correo electrónico</label>
            <input
              id="correo"
              v-model="correo"
              type="email"
              placeholder="correo@ejemplo.com"
              readonly
              class="input-readonly"
              title="El correo viene de tu cuenta"
            />
            <p v-if="errores.correo" class="campo-error" role="alert">{{ errores.correo }}</p>
          </div>

          <div class="grupo-input" :class="{ 'grupo-input--error': errores.telefono }">
            <label for="telefono">Teléfono</label>
            <input
              id="telefono"
              v-model="telefono"
              type="tel"
              placeholder="+591 70000000"
              inputmode="tel"
              maxlength="20"
              @input="errores.telefono = ''"
            />
            <p v-if="errores.telefono" class="campo-error" role="alert">{{ errores.telefono }}</p>
          </div>

          <div class="grupo-input" :class="{ 'grupo-input--error': errores.taller }">
            <label for="taller">Taller</label>
            <select id="taller" v-model="taller" @change="errores.taller = ''">
              <option value="">Elige una opción…</option>
              <option v-for="c in cursos" :key="c.slug" :value="c.slug">
                {{ etiquetaTallerOpcion(c) }}
              </option>
            </select>
            <p v-if="errores.taller" class="campo-error" role="alert">{{ errores.taller }}</p>
          </div>

          <button type="submit" class="btn-enviar" :disabled="enviando">
            {{ enviando ? 'Procesando…' : 'Enviar solicitud' }}
          </button>
        </form>

        <p class="auth-hint">
          Los descuentos solo se calculan con sesión iniciada y se confirman al aprobar tu plaza. ¿Datos
          incorrectos? Actualízalos arriba antes de
          enviar; se guardan en tu perfil.
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
