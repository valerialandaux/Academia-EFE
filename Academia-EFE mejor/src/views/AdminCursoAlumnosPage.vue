<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AdminNav from '../components/AdminNav.vue'
import { apiUrl, getAdminToken, setAdminToken, adminAuthHeaders } from '../lib/api'

const route = useRoute()
const router = useRouter()

const curso = ref(null)
const cargando = ref(true)
const error = ref('')

const alumnos = computed(() => (Array.isArray(curso.value?.alumnos) ? curso.value.alumnos : []))

function etiquetaPago(estado) {
  const s = estado || 'NO_INICIADO'
  if (s === 'APROBADO') return 'Pago aprobado'
  if (s === 'ENVIADO') return 'Pago enviado'
  if (s === 'RECHAZADO') return 'Pago rechazado'
  return 'Pago pendiente'
}

function clasePago(estado) {
  const s = estado || 'NO_INICIADO'
  if (s === 'APROBADO') return 'estado-aprobada'
  if (s === 'RECHAZADO') return 'estado-denegada'
  return 'estado-pendiente'
}

async function cargarCurso() {  /*cargado de errores */
  error.value = ''
  cargando.value = true

  const token = getAdminToken()
  if (!token) {
    router.replace({ path: '/admin/login', query: { redirect: route.fullPath } })
    return
  }

  try {
    const res = await fetch(apiUrl('/api/admin/cursos'), { headers: adminAuthHeaders() })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: route.fullPath } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'Error al cargar'
      curso.value = null
      return
    }

    const id = Number(route.params.id)
    const rows = Array.isArray(data) ? data : []
    const encontrado = rows.find((c) => c.id === id)

    if (!encontrado) {
      error.value = 'Curso no encontrado.'
      curso.value = null
      return
    }
    curso.value = encontrado
  } catch {
    error.value = 'Sin conexión al servidor.'
    curso.value = null
  } finally {
    cargando.value = false
  }
}

onMounted(cargarCurso)
</script>

<template>
  <div class="pagina-admin-cursos">
    <AppNavbar />

    <section class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <h1 class="admin-title">Alumnos inscritos</h1>
          <p class="admin-sub">
            <template v-if="curso">
              {{ curso.titulo }} · {{ curso.alumnosCount || 0 }} inscritos
            </template>
            <template v-else>Revisa la lista de alumnos inscritos por curso.</template>
          </p>
        </div>
        <div class="admin-panel-actions">
          <button type="button" class="admin-top-btn admin-top-btn-refresh" :disabled="cargando" @click="cargarCurso">
            Actualizar
          </button>
          <RouterLink to="/admin/cursos" class="admin-top-btn admin-top-btn-logout">Volver a cursos</RouterLink>
        </div>
      </div>

      <AdminNav />

      <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

      <div v-if="cargando" class="admin-loading">Cargando alumnos…</div>

      <div v-else-if="!curso" class="admin-empty-panel">
        <p>No se pudo abrir este curso.</p>
        <RouterLink to="/admin/cursos" class="link-arrow">Volver a cursos →</RouterLink>
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Estado de pago</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="alumnos.length === 0">
              <td colspan="4" class="admin-empty">Aún no hay alumnos aprobados en este curso.</td>
            </tr>
            <tr v-for="(a, idx) in alumnos" :key="`${curso.id}-${idx}`">
              <td>{{ idx + 1 }}</td>
              <td>{{ a.nombre || 'Alumno' }}</td>
              <td>
                <a v-if="a.correo" :href="`mailto:${a.correo}`">{{ a.correo }}</a>
                <span v-else>—</span>
              </td>
              <td>
                <span class="estado-chip" :class="clasePago(a.pagoEstado)">{{ etiquetaPago(a.pagoEstado) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
