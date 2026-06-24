<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AdminNav from '../components/AdminNav.vue'
import { apiUrl, getAdminToken, setAdminToken, adminAuthHeaders } from '../lib/api'
import { validarTituloNosotros, validarLeadNosotros, validarBodyNosotros } from '../lib/validacion'

const router = useRouter()

const cargando = ref(true)
const guardando = ref(false)
const error = ref('')
const ok = ref('')
const erroresForm = ref({})

const form = ref({
  titulo: '',
  lead: '',
  body: '',
  activo: true,
})

async function cargar() {
  error.value = ''
  ok.value = ''
  cargando.value = true
  const token = getAdminToken()
  if (!token) {
    router.replace({ path: '/admin/login', query: { redirect: '/admin/nosotros' } })
    return
  }
  try {
    const res = await fetch(apiUrl('/api/admin/nosotros'), { headers: adminAuthHeaders() })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/nosotros' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'Error al cargar'
      return
    }
    form.value = {
      titulo: data.titulo || '',
      lead: data.lead || '',
      body: data.body || '',
      activo: data.activo !== false,
    }
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    cargando.value = false
  }
}

function validarFormulario() {
  erroresForm.value = {
    titulo: validarTituloNosotros(form.value.titulo),
    lead: validarLeadNosotros(form.value.lead),
    body: validarBodyNosotros(form.value.body),
  }
  return Object.values(erroresForm.value).every((m) => !m)
}

async function guardar() {
  error.value = ''
  ok.value = ''
  if (!validarFormulario()) {
    error.value = 'Revisa los campos marcados antes de guardar.'
    return
  }
  guardando.value = true
  try {
    const res = await fetch(apiUrl('/api/admin/nosotros'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...adminAuthHeaders() },
      body: JSON.stringify({
        titulo: form.value.titulo.trim(),
        lead: form.value.lead.trim(),
        body: form.value.body.trim(),
        activo: !!form.value.activo,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || 'No se pudo guardar'
      return
    }
    ok.value = 'Guardado.'
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    guardando.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div class="pagina-admin-nosotros">
    <AppNavbar />

    <section class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <h1 class="admin-title">Nosotros</h1>
          <p class="admin-sub">Edita el contenido de la página “Nosotros”.</p>
        </div>
        <div class="admin-panel-actions">
          <button type="button" class="admin-top-btn admin-top-btn-refresh" :disabled="cargando" @click="cargar">
            Recargar
          </button>
        </div>
      </div>

      <AdminNav />

      <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>
      <p v-if="ok" class="form-msg form-msg-ok" role="status">{{ ok }}</p>

      <div v-if="cargando" class="admin-loading">Cargando…</div>

      <div v-else class="admin-card">
        <h2 class="admin-card-title">Contenido</h2>
        <form class="admin-form" novalidate @submit.prevent="guardar">
          <div class="admin-form-grid">
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.titulo }">
              Título
              <input
                v-model="form.titulo"
                class="admin-input"
                placeholder="Historia y equipo"
                maxlength="100"
                @input="erroresForm.titulo = ''"
              />
              <span class="admin-hint">Mínimo 5 caracteres.</span>
              <span v-if="erroresForm.titulo" class="campo-error">{{ erroresForm.titulo }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.lead }">
              Lead (texto corto)
              <input
                v-model="form.lead"
                class="admin-input"
                placeholder="Una escuela pensada para quien quiere aprender haciendo..."
                maxlength="300"
                @input="erroresForm.lead = ''"
              />
              <span class="admin-hint">Entre 20 y 300 caracteres.</span>
              <span v-if="erroresForm.lead" class="campo-error">{{ erroresForm.lead }}</span>
            </label>
            <label class="admin-label admin-span-2" :class="{ 'admin-label--error': erroresForm.body }">
              Cuerpo (texto largo)
              <textarea
                v-model="form.body"
                class="admin-textarea"
                rows="10"
                maxlength="8000"
                @input="erroresForm.body = ''"
              />
              <span class="admin-hint">Mínimo 50 caracteres con la historia de la academia.</span>
              <span v-if="erroresForm.body" class="campo-error">{{ erroresForm.body }}</span>
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
          </div>
        </form>
      </div>
    </section>
  </div>
</template>
