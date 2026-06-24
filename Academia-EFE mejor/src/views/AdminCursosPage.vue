<script setup>
import { ref, computed, onMounted } from 'vue'
import AppNavbar from '../components/AppNavbar.vue'
import AdminNav from '../components/AdminNav.vue'
import { apiUrl, getAdminToken, setAdminToken, adminAuthHeaders } from '../lib/api'
import { useRouter } from 'vue-router'
import {
  validarSlugCurso,
  validarTituloCurso,
  validarCortoCurso,
  validarDetalleCurso,
  validarTextoRequerido,
  validarUrlRequerida,
  validarImagenAltCurso,
  validarDuracionCurso,
  validarPrecioCurso,
  validarNivelesCSV,
  validarTemasCSV,
  validarSedeCurso,
  validarHorarioCurso,
  validarMaterialesCurso,
  validarNotaPresencialCurso,
} from '../lib/validacion'

const router = useRouter()

const cursos = ref([])
const cargando = ref(true)
const error = ref('')
const guardando = ref(false)
const erroresForm = ref({})

const editId = ref(null)

const form = ref({
  slug: '',
  titulo: '',
  corto: '',
  descripcion: '',
  detalle: '',
  imagen: '',
  imagenAlt: '',
  duracion: '',
  sede: '',
  horario: '',
  materiales: '',
  notaPresencial: '',
  precio: '',
  niveles: 'basico',
  temas: 'paisaje',
  activo: true,
  orden: 0,
})

const tituloForm = computed(() => (editId.value ? 'Editar curso' : 'Nuevo curso'))

function resetForm() {
  editId.value = null
  erroresForm.value = {}
  form.value = {
    slug: '',
    titulo: '',
    corto: '',
    descripcion: '',
    detalle: '',
    imagen: '',
    imagenAlt: '',
    duracion: '',
    sede: '',
    horario: '',
    materiales: '',
    notaPresencial: '',
    precio: '',
    niveles: 'basico',
    temas: 'paisaje',
    activo: true,
    orden: 0,
  }
}

function toArrayCSV(s) {
  return String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

async function cargar() {
  error.value = ''
  cargando.value = true
  const token = getAdminToken()
  if (!token) {
    router.replace({ path: '/admin/login', query: { redirect: '/admin/cursos' } })
    return
  }
  try {
    const res = await fetch(apiUrl('/api/admin/cursos'), { headers: adminAuthHeaders() })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/cursos' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'Error al cargar'
      cursos.value = []
      return
    }
    cursos.value = Array.isArray(data) ? data : []
  } catch {
    error.value = 'Sin conexión al servidor.'
    cursos.value = []
  } finally {
    cargando.value = false
  }
}

function editar(c) {
  editId.value = c.id
  erroresForm.value = {}
  form.value = {
    slug: c.slug || '',
    titulo: c.titulo || '',
    corto: c.corto || '',
    descripcion: c.descripcion || '',
    detalle: c.detalle || '',
    imagen: c.imagen || '',
    imagenAlt: c.imagenAlt || '',
    duracion: c.duracion || '',
    sede: c.sede || '',
    horario: c.horario || '',
    materiales: c.materiales || '',
    notaPresencial: c.notaPresencial || '',
    precio: c.precio ?? '',
    niveles: Array.isArray(c.niveles) ? c.niveles.join(', ') : 'basico',
    temas: Array.isArray(c.temas) ? c.temas.join(', ') : '',
    activo: c.activo !== false,
    orden: c.orden ?? 0,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function validarFormularioCurso() {
  erroresForm.value = {
    slug: validarSlugCurso(form.value.slug),
    titulo: validarTituloCurso(form.value.titulo),
    corto: validarCortoCurso(form.value.corto),
    descripcion: validarTextoRequerido(form.value.descripcion, 'La descripción', 10),
    detalle: validarDetalleCurso(form.value.detalle),
    imagen: validarUrlRequerida(form.value.imagen),
    imagenAlt: validarImagenAltCurso(form.value.imagenAlt, form.value.imagen),
    duracion: validarDuracionCurso(form.value.duracion),
    sede: validarSedeCurso(form.value.sede),
    horario: validarHorarioCurso(form.value.horario),
    materiales: validarMaterialesCurso(form.value.materiales),
    notaPresencial: validarNotaPresencialCurso(form.value.notaPresencial),
    precio: validarPrecioCurso(form.value.precio),
    niveles: validarNivelesCSV(form.value.niveles),
    temas: validarTemasCSV(form.value.temas),
  }
  return Object.values(erroresForm.value).every((m) => !m)
}

async function guardar() {
  guardando.value = true
  error.value = ''
  if (!validarFormularioCurso()) {
    guardando.value = false
    error.value = 'Revisa los campos marcados antes de guardar.'
    return
  }
  try {
    const payload = {
      slug: form.value.slug.trim().toLowerCase(),
      titulo: form.value.titulo.trim(),
      corto: form.value.corto.trim(),
      descripcion: form.value.descripcion.trim(),
      detalle: form.value.detalle.trim(),
      imagen: form.value.imagen.trim(),
      imagenAlt: form.value.imagenAlt.trim(),
      duracion: form.value.duracion.trim(),
      sede: form.value.sede.trim(),
      horario: form.value.horario.trim(),
      materiales: form.value.materiales.trim(),
      notaPresencial: form.value.notaPresencial.trim(),
      precio: Number(form.value.precio),
      niveles: toArrayCSV(form.value.niveles),
      temas: toArrayCSV(form.value.temas),
      activo: !!form.value.activo,
      orden: Number(form.value.orden) || 0,
    }

    const isEdit = !!editId.value
    const res = await fetch(apiUrl(isEdit ? `/api/admin/cursos/${editId.value}` : '/api/admin/cursos'), {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/cursos' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'No se pudo guardar'
      return
    }
    await cargar()
    resetForm()
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    guardando.value = false
  }
}

async function eliminar(c) {
  if (!confirm(`Eliminar curso "${c.titulo}"?`)) return
  error.value = ''
  try {
    const res = await fetch(apiUrl(`/api/admin/cursos/${c.id}`), {
      method: 'DELETE',
      headers: adminAuthHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || 'No se pudo eliminar'
      return
    }
    await cargar()
    if (editId.value === c.id) resetForm()
  } catch {
    error.value = 'Sin conexión al servidor.'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="pagina-admin-cursos">
    <AppNavbar />

    <section class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <h1 class="admin-title">Panel admin</h1>
          <p class="admin-sub">Gestiona cursos: crear, editar, activar/desactivar y ordenar.</p>
        </div>
        <div class="admin-panel-actions">
          <button type="button" class="admin-top-btn admin-top-btn-refresh" :disabled="cargando" @click="cargar">
            Actualizar
          </button>
          <button type="button" class="admin-top-btn admin-top-btn-logout" @click="resetForm">Nuevo</button>
        </div>
      </div>

      <AdminNav />

      <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

      <div class="admin-card">
        <h2 class="admin-card-title">{{ tituloForm }}</h2>
        <form class="admin-form" novalidate @submit.prevent="guardar">
          <div class="admin-form-grid">
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.slug }">
              Slug
              <input
                v-model="form.slug"
                class="admin-input"
                placeholder="basica"
                maxlength="40"
                @input="erroresForm.slug = ''"
              />
              <span class="admin-hint">Minúsculas, relacionado con el taller (ej: retrato, edicion-foto).</span>
              <span v-if="erroresForm.slug" class="campo-error">{{ erroresForm.slug }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.titulo }">
              Título
              <input
                v-model="form.titulo"
                class="admin-input"
                placeholder="Fotografía Básica"
                maxlength="120"
                @input="erroresForm.titulo = ''"
              />
              <span v-if="erroresForm.titulo" class="campo-error">{{ erroresForm.titulo }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.corto }">
              Resumen corto
              <input
                v-model="form.corto"
                class="admin-input"
                placeholder="Domina tu cámara en manual"
                maxlength="120"
                @input="erroresForm.corto = ''"
              />
              <span v-if="erroresForm.corto" class="campo-error">{{ erroresForm.corto }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.descripcion }">
              Descripción
              <textarea
                v-model="form.descripcion"
                class="admin-textarea"
                rows="3"
                @input="erroresForm.descripcion = ''"
              />
              <span v-if="erroresForm.descripcion" class="campo-error">{{ erroresForm.descripcion }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.detalle }">
              Detalle
              <textarea
                v-model="form.detalle"
                class="admin-textarea"
                rows="3"
                @input="erroresForm.detalle = ''"
              />
              <span v-if="erroresForm.detalle" class="campo-error">{{ erroresForm.detalle }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.duracion }">
              Duración
              <input
                v-model="form.duracion"
                class="admin-input"
                placeholder="8 semanas"
                maxlength="20"
                @input="erroresForm.duracion = ''"
              />
              <span class="admin-hint">Número del 1 al 10 + la palabra semanas (ej: 8 semanas).</span>
              <span v-if="erroresForm.duracion" class="campo-error">{{ erroresForm.duracion }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.precio }">
              Precio (Bs)
              <input
                v-model="form.precio"
                class="admin-input"
                type="number"
                min="100"
                max="50000"
                step="1"
                placeholder="2400"
                @input="erroresForm.precio = ''"
              />
              <span v-if="erroresForm.precio" class="campo-error">{{ erroresForm.precio }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.imagen }">
              Imagen (URL)
              <input
                v-model="form.imagen"
                class="admin-input"
                placeholder="https://..."
                maxlength="500"
                @input="erroresForm.imagen = ''"
              />
              <span v-if="erroresForm.imagen" class="campo-error">{{ erroresForm.imagen }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.imagenAlt }">
              Imagen Alt
              <input
                v-model="form.imagenAlt"
                class="admin-input"
                placeholder="Descripción de la foto de portada"
                maxlength="200"
                @input="erroresForm.imagenAlt = ''"
              />
              <span v-if="erroresForm.imagenAlt" class="campo-error">{{ erroresForm.imagenAlt }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.niveles }">
              Niveles (CSV)
              <input
                v-model="form.niveles"
                class="admin-input"
                placeholder="basico, avanzado"
                @input="erroresForm.niveles = ''"
              />
              <span class="admin-hint">Solo: basico, avanzado.</span>
              <span v-if="erroresForm.niveles" class="campo-error">{{ erroresForm.niveles }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.temas }">
              Temas (CSV)
              <input
                v-model="form.temas"
                class="admin-input"
                placeholder="paisaje, retrato, edicion"
                @input="erroresForm.temas = ''"
              />
              <span class="admin-hint">Solo: retrato, edicion, paisaje.</span>
              <span v-if="erroresForm.temas" class="campo-error">{{ erroresForm.temas }}</span>
            </label>

            <p class="admin-span-2 admin-section-label">Información presencial (visible tras confirmar pago)</p>

            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.sede }">
              Sede
              <input
                v-model="form.sede"
                class="admin-input"
                placeholder="Sede Central Academia EFE (Aula 2)"
                maxlength="200"
                @input="erroresForm.sede = ''"
              />
              <span v-if="erroresForm.sede" class="campo-error">{{ erroresForm.sede }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.horario }">
              Horario
              <input
                v-model="form.horario"
                class="admin-input"
                placeholder="Lunes y miércoles · 19:00 a 21:00"
                maxlength="120"
                @input="erroresForm.horario = ''"
              />
              <span class="admin-hint">Incluye días y hora (ej: Martes y jueves · 19:00 a 21:00).</span>
              <span v-if="erroresForm.horario" class="campo-error">{{ erroresForm.horario }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.materiales }">
              Qué llevar
              <input
                v-model="form.materiales"
                class="admin-input"
                placeholder="Cámara, libreta y cargador"
                maxlength="300"
                @input="erroresForm.materiales = ''"
              />
              <span v-if="erroresForm.materiales" class="campo-error">{{ erroresForm.materiales }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.notaPresencial }">
              Nota para el alumno
              <textarea
                v-model="form.notaPresencial"
                class="admin-textarea"
                rows="2"
                placeholder="Llega 15 minutos antes para registro."
                maxlength="300"
                @input="erroresForm.notaPresencial = ''"
              />
              <span v-if="erroresForm.notaPresencial" class="campo-error">{{ erroresForm.notaPresencial }}</span>
            </label>

            <label class="admin-label">
              Orden
              <input v-model="form.orden" class="admin-input" type="number" step="1" />
            </label>
            <label class="admin-label admin-check">
              <input v-model="form.activo" type="checkbox" />
              Activo
            </label>
          </div>
          <div class="admin-form-actions">
            <button type="submit" class="admin-top-btn admin-top-btn-refresh" :disabled="guardando">
              {{ guardando ? 'Guardando…' : 'Guardar' }}
            </button>
            <button type="button" class="admin-top-btn admin-top-btn-logout" @click="resetForm">Cancelar</button>
          </div>
        </form>
      </div>

      <div v-if="cargando" class="admin-loading">Cargando cursos…</div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Slug</th>
              <th>Título</th>
              <th>Alumnos</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in cursos" :key="c.id">
              <td>{{ c.orden }}</td>
              <td><code>{{ c.slug }}</code></td>
              <td>{{ c.titulo }}</td>
              <td>
                <strong>{{ c.alumnosCount || 0 }}</strong>
              </td>
              <td>{{ c.activo ? 'Sí' : 'No' }}</td>
              <td class="admin-actions-cell">
                <RouterLink
                  v-if="(c.alumnosCount || 0) > 0"
                  class="admin-action-btn admin-action-view"
                  :to="`/admin/cursos/${c.id}/alumnos`"
                >
                  Ver alumnos
                </RouterLink>
                <button type="button" class="admin-action-btn admin-action-accept" @click="editar(c)">Editar</button>
                <button type="button" class="admin-action-btn admin-action-deny" @click="eliminar(c)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
