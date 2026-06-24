<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AdminNav from '../components/AdminNav.vue'
import { apiUrl, getAdminToken, setAdminToken, adminAuthHeaders } from '../lib/api'
import {
  validarAnchoGaleria,
  validarSlugCursoGaleria,
  validarAltGaleria,
  validarTituloGaleria,
  validarAlumnoGaleria,
  validarNotaGaleria,
  validarUrlRequerida,
} from '../lib/validacion'

const router = useRouter()

const items = ref([])
const cargando = ref(true)
const error = ref('')
const mensajeOk = ref('')
const guardando = ref(false)
const erroresForm = ref({})

const editId = ref(null)
const form = ref({
  curso: '',
  src: '',
  alt: '',
  titulo: '',
  alumno: '',
  nota: '',
  ancho: '',
  activo: true,
  orden: 0,
})

const tituloForm = computed(() => (editId.value ? 'Editar item' : 'Nuevo item'))
const previewSrc = computed(() => {
  const src = form.value.src?.trim()
  if (!src || erroresForm.value.src) return ''
  try {
    new URL(src)
    return src
  } catch {
    return ''
  }
})

function resetForm() {
  editId.value = null
  erroresForm.value = {}
  form.value = {
    curso: '',
    src: '',
    alt: '',
    titulo: '',
    alumno: '',
    nota: '',
    ancho: '',
    activo: true,
    orden: 0,
  }
}

async function cargar() {
  error.value = ''
  cargando.value = true
  const token = getAdminToken()
  if (!token) {
    router.replace({ path: '/admin/login', query: { redirect: '/admin/galeria' } })
    return
  }
  try {
    const res = await fetch(apiUrl('/api/admin/galeria'), { headers: adminAuthHeaders() })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/galeria' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'Error al cargar'
      items.value = []
      return
    }
    items.value = Array.isArray(data) ? data : []
  } catch {
    error.value = 'Sin conexión al servidor.'
    items.value = []
  } finally {
    cargando.value = false
  }
}

function editar(i) {
  editId.value = i.id
  mensajeOk.value = ''
  erroresForm.value = {}
  form.value = {
    curso: i.curso || '',
    src: i.src || '',
    alt: i.alt || '',
    titulo: i.titulo || '',
    alumno: i.alumno || '',
    nota: i.nota || '',
    ancho: i.ancho || '',
    activo: i.activo !== false,
    orden: i.orden ?? 0,
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function validarFormulario() {
  erroresForm.value = {
    curso: validarSlugCursoGaleria(form.value.curso),
    src: validarUrlRequerida(form.value.src),
    alt: validarAltGaleria(form.value.alt),
    titulo: validarTituloGaleria(form.value.titulo),
    alumno: validarAlumnoGaleria(form.value.alumno),
    nota: validarNotaGaleria(form.value.nota),
    ancho: validarAnchoGaleria(form.value.ancho),
  }
  return Object.values(erroresForm.value).every((m) => !m)
}

async function guardar() {
  mensajeOk.value = ''
  error.value = ''
  if (!validarFormulario()) return

  guardando.value = true
  try {
    const payload = {
      curso: form.value.curso.trim() || null,
      src: form.value.src.trim(),
      alt: form.value.alt.trim(),
      titulo: form.value.titulo.trim(),
      alumno: form.value.alumno.trim() || null,
      nota: form.value.nota.trim() || null,
      ancho: form.value.ancho.trim().toLowerCase() || null,
      activo: !!form.value.activo,
      orden: Number(form.value.orden) || 0,
    }

    const isEdit = !!editId.value
    const res = await fetch(apiUrl(isEdit ? `/api/admin/galeria/${editId.value}` : '/api/admin/galeria'), {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/galeria' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'No se pudo guardar'
      return
    }
    mensajeOk.value = isEdit ? 'Item actualizado correctamente.' : 'Item creado correctamente.'
    await cargar()
    resetForm()
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    guardando.value = false
  }
}

async function eliminar(i) {
  if (!confirm(`Eliminar item "${i.titulo}"?`)) return
  error.value = ''
  mensajeOk.value = ''
  try {
    const res = await fetch(apiUrl(`/api/admin/galeria/${i.id}`), {
      method: 'DELETE',
      headers: adminAuthHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || 'No se pudo eliminar'
      return
    }
    mensajeOk.value = 'Item eliminado.'
    await cargar()
    if (editId.value === i.id) resetForm()
  } catch {
    error.value = 'Sin conexión al servidor.'
  }
}

onMounted(cargar)
</script>

<template>
  <div class="pagina-admin-galeria">
    <AppNavbar />

    <section class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <h1 class="admin-title">Galería</h1>
          <p class="admin-sub">Agrega, edita y elimina fotos de alumnos. Los cambios se reflejan en la galería pública.</p>
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
      <p v-if="mensajeOk" class="form-msg form-msg-ok" role="status">{{ mensajeOk }}</p>

      <div class="admin-card">
        <h2 class="admin-card-title">{{ tituloForm }}</h2>
        <form class="admin-form" novalidate @submit.prevent="guardar">
          <div class="admin-form-grid">
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.curso }">
              Curso (slug)
              <input
                v-model="form.curso"
                class="admin-input"
                placeholder="basica, retrato o edicion"
                maxlength="40"
                @input="erroresForm.curso = ''"
              />
              <span class="admin-hint">Obligatorio: basica, retrato o edicion.</span>
              <span v-if="erroresForm.curso" class="campo-error">{{ erroresForm.curso }}</span>
            </label>
            <label class="admin-label">
              Orden
              <input v-model="form.orden" class="admin-input" type="number" step="1" />
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.src }">
              Imagen (URL)
              <input
                v-model="form.src"
                class="admin-input"
                placeholder="https://..."
                maxlength="500"
                @input="erroresForm.src = ''"
              />
              <span v-if="erroresForm.src" class="campo-error">{{ erroresForm.src }}</span>
              <img v-if="previewSrc" :src="previewSrc" alt="" class="admin-galeria-preview" loading="lazy" />
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.alt }">
              Alt
              <input
                v-model="form.alt"
                class="admin-input"
                placeholder="Descripción para accesibilidad"
                maxlength="200"
                @input="erroresForm.alt = ''"
              />
              <span v-if="erroresForm.alt" class="campo-error">{{ erroresForm.alt }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.titulo }">
              Título
              <input
                v-model="form.titulo"
                class="admin-input"
                maxlength="120"
                @input="erroresForm.titulo = ''"
              />
              <span v-if="erroresForm.titulo" class="campo-error">{{ erroresForm.titulo }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.alumno }">
              Alumno
              <input
                v-model="form.alumno"
                class="admin-input"
                placeholder="María G."
                maxlength="80"
                @input="erroresForm.alumno = ''"
              />
              <span v-if="erroresForm.alumno" class="campo-error">{{ erroresForm.alumno }}</span>
            </label>
            <label class="admin-label" :class="{ 'admin-label--error': erroresForm.ancho }">
              Layout (alto/ancho)
              <input
                v-model="form.ancho"
                class="admin-input"
                placeholder="alto o ancho"
                maxlength="10"
                @input="erroresForm.ancho = ''"
              />
              <span v-if="erroresForm.ancho" class="campo-error">{{ erroresForm.ancho }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.nota }">
              Nota
              <textarea
                v-model="form.nota"
                class="admin-textarea"
                rows="2"
                maxlength="300"
                @input="erroresForm.nota = ''"
              />
              <span v-if="erroresForm.nota" class="campo-error">{{ erroresForm.nota }}</span>
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

      <div v-if="cargando" class="admin-loading">Cargando galería…</div>

      <div v-else-if="items.length === 0" class="admin-empty-panel">
        <p>Aún no hay fotos en la galería. Crea el primer item arriba.</p>
      </div>

      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Vista</th>
              <th>Orden</th>
              <th>Curso</th>
              <th>Título</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in items" :key="i.id">
              <td>
                <img :src="i.src" :alt="i.alt" class="admin-thumb" loading="lazy" />
              </td>
              <td>{{ i.orden }}</td>
              <td><code>{{ i.curso || '—' }}</code></td>
              <td>{{ i.titulo }}</td>
              <td>{{ i.activo ? 'Sí' : 'No' }}</td>
              <td class="admin-actions-cell">
                <button type="button" class="admin-action-btn admin-action-accept" @click="editar(i)">Editar</button>
                <button type="button" class="admin-action-btn admin-action-deny" @click="eliminar(i)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
