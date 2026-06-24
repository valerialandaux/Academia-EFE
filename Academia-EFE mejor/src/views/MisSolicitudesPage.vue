<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { apiUrl, authHeaders } from '../lib/api'
import { useAuth } from '../composables/useAuth'
import {
  etiquetaTaller,
  etiquetaEstado,
  claseEstado,
  mensajeAlumno,
  tituloRespuestaAlumno,
} from '../data/inscripcionesMeta'

const { fetchMe } = useAuth()

const filas = ref([])
const error = ref('')
const cargando = ref(true)

function formatearFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

async function cargar() {
  error.value = ''
  cargando.value = true
  try {
    const res = await fetch(apiUrl('/api/inscripciones/mias'), {
      headers: authHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401) {
      error.value = 'Sesión expirada. Vuelve a iniciar sesión.'
      filas.value = []
      return
    }
    if (!res.ok) {
      error.value = data.error || 'No se pudieron cargar tus solicitudes'
      filas.value = []
      return
    }
    filas.value = Array.isArray(data) ? data : []
  } catch {
    error.value = 'Sin conexión al servidor. ¿Está ejecutándose el API?'
    filas.value = []
  } finally {
    cargando.value = false
  }
}

function puedePagar(row) {
  return row.estado === 'APROBADA' && (!row.pagoEstado || row.pagoEstado === 'NO_INICIADO' || row.pagoEstado === 'RECHAZADO')
}

function etiquetaPago(row) {
  const estado = row.pagoEstado || 'NO_INICIADO'
  if (estado === 'ENVIADO') return 'Pago enviado (en revisión)'
  if (estado === 'APROBADO') return 'Pago confirmado'
  if (estado === 'RECHAZADO') return 'Pago rechazado'
  return 'Pago pendiente'
}

onMounted(async () => {
  await fetchMe()
  await cargar()
})
</script>

<template>
  <div class="pagina-solicitudes">
    <AppNavbar />

    <section class="solicitudes-panel">
      <div class="solicitudes-head">
        <div>
          <p class="hero-kicker">Mi actividad</p>
          <h1 class="solicitudes-title">Mis solicitudes</h1>
          <p class="solicitudes-sub">
            Aquí ves el estado de cada inscripción a un taller: en revisión, aceptada o rechazada.
          </p>
        </div>
        <button
          type="button"
          class="admin-top-btn admin-top-btn-refresh"
          :disabled="cargando"
          @click="cargar"
        >
          {{ cargando ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>

      <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

      <div v-if="cargando" class="admin-loading">Cargando tus solicitudes…</div>

      <div v-else-if="filas.length === 0" class="solicitudes-vacio">
        <p>Aún no has enviado ninguna solicitud de inscripción.</p>
        <RouterLink to="/inscripcion" class="btn-cta-large btn-glow">Inscribirse a un curso</RouterLink>
      </div>

      <ul v-else class="solicitudes-lista" role="list">
        <li v-for="row in filas" :key="row.id" class="solicitud-card">
          <div class="solicitud-card-top">
            <h2 class="solicitud-taller">{{ etiquetaTaller[row.taller] || row.taller }}</h2>
            <span class="estado-chip" :class="claseEstado(row.estado)">
              {{ etiquetaEstado[row.estado] || row.estado }}
            </span>
          </div>
          <p class="solicitud-fecha">Enviada el {{ formatearFecha(row.createdAt) }}</p>
          <p v-if="row.respondidoAt" class="solicitud-fecha solicitud-fecha-respuesta">
            Respondida el {{ formatearFecha(row.respondidoAt) }}
          </p>
          <p v-if="tituloRespuestaAlumno(row.estado)" class="solicitud-respuesta-titulo">
            {{ tituloRespuestaAlumno(row.estado) }}
          </p>
          <p class="solicitud-detalle" :class="{ 'solicitud-detalle-resuelta': row.comentarioAdmin }">
            {{ mensajeAlumno(row) }}
          </p>
          <p class="solicitud-fecha solicitud-fecha-respuesta">
            {{ etiquetaPago(row) }}
          </p>
          <RouterLink
            v-if="puedePagar(row)"
            class="admin-top-btn admin-top-btn-refresh solicitud-pago-btn"
            :to="`/mis-solicitudes/${row.id}/pago`"
          >
            Proceder con el pago
          </RouterLink>
          <p class="solicitud-meta">
            <span>{{ row.nombre }}</span>
            <span aria-hidden="true"> · </span>
            <span>{{ row.correo }}</span>
          </p>
        </li>
      </ul>

      <p v-if="filas.length > 0" class="solicitudes-foot">
        <RouterLink to="/inscripcion" class="link-arrow">Enviar otra solicitud →</RouterLink>
      </p>
    </section>

    <AppFooter />
  </div>
</template>
