<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AdminNav from '../components/AdminNav.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { apiUrl, getAdminToken, setAdminToken, adminAuthHeaders } from '../lib/api'
import { etiquetaTaller } from '../data/inscripcionesMeta'
import { resolveAvatarUrl } from '../lib/avatar'

const router = useRouter()

const filas = ref([])
const error = ref('')
const cargando = ref(true)
const actualizandoId = ref(null)
const filtro = ref('pendientes')
const seleccionadaId = ref(null)

const modalAbierto = ref(false)
const modalEstado = ref('APROBADA')
const modalComentario = ref('')
const modalError = ref('')

const modalPagoAbierto = ref(false)
const modalPagoEstado = ref('APROBADO')
const modalPagoComentario = ref('')
const modalPagoError = ref('')

const etiquetaEstadoAdmin = {
  PENDIENTE: 'En revisión',
  APROBADA: 'Aceptada',
  DENEGADA: 'Rechazada',
}

function etiquetaPagoAdmin(estado) {
  const s = estado || 'NO_INICIADO'
  if (s === 'ENVIADO') return 'Pago enviado'
  if (s === 'APROBADO') return 'Pago aprobado'
  if (s === 'RECHAZADO') return 'Pago rechazado'
  return 'Pago pendiente'
}

function clasePagoAdmin(estado) {
  const s = estado || 'NO_INICIADO'
  if (s === 'APROBADO') return 'estado-aprobada'
  if (s === 'RECHAZADO') return 'estado-denegada'
  return 'estado-pendiente'
}

function formatearFecha(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('es-BO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

const filasFiltradas = computed(() => {
  if (filtro.value === 'pendientes') {
    return filas.value.filter((r) => r.estado === 'PENDIENTE' || r.pagoEstado === 'ENVIADO')
  }
  if (filtro.value === 'resueltas') {
    return filas.value.filter((r) => r.estado !== 'PENDIENTE' && r.pagoEstado !== 'ENVIADO')
  }
  return filas.value
})

const seleccionada = computed(() =>
  filas.value.find((r) => r.id === seleccionadaId.value) ?? null,
)

const conteos = computed(() => ({
  todas: filas.value.length,
  pendientes: filas.value.filter((r) => r.estado === 'PENDIENTE' || r.pagoEstado === 'ENVIADO').length,
  resueltas: filas.value.filter((r) => r.estado !== 'PENDIENTE' && r.pagoEstado !== 'ENVIADO').length,
  pagosPorRevisar: filas.value.filter((r) => r.pagoEstado === 'ENVIADO').length,
}))

async function cargar() {
  error.value = ''
  cargando.value = true
  const token = getAdminToken()
  if (!token) {
    router.replace({ path: '/admin/login', query: { redirect: '/admin/inscripciones' } })
    return
  }
  try {
    const res = await fetch(apiUrl('/api/inscripciones'), {
      headers: adminAuthHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    if (res.status === 401 || res.status === 403) {
      setAdminToken(null)
      router.replace({ path: '/admin/login', query: { redirect: '/admin/inscripciones' } })
      return
    }
    if (!res.ok) {
      error.value = data.error || 'Error al cargar'
      filas.value = []
      return
    }
    filas.value = Array.isArray(data) ? data : []
    if (seleccionadaId.value && !filas.value.some((r) => r.id === seleccionadaId.value)) {
      seleccionadaId.value = filasFiltradas.value[0]?.id ?? null
    } else if (!seleccionadaId.value && filasFiltradas.value.length) {
      seleccionadaId.value = filasFiltradas.value[0].id
    }
  } catch {
    error.value = 'Sin conexión al servidor.'
    filas.value = []
  } finally {
    cargando.value = false
  }
}

function seleccionar(row) {
  seleccionadaId.value = row.id
}

function abrirModal(estado) {
  if (!seleccionada.value || seleccionada.value.estado !== 'PENDIENTE') return
  modalEstado.value = estado
  modalComentario.value = ''
  modalError.value = ''
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  modalComentario.value = ''
  modalError.value = ''
}

async function confirmarResolucion() {
  const row = seleccionada.value
  if (!row) return
  const comentario = modalComentario.value.trim()
  if (comentario.length < 10) {
    modalError.value = 'La explicación debe tener al menos 10 caracteres.'
    return
  }
  actualizandoId.value = row.id
  modalError.value = ''
  error.value = ''
  try {
    const res = await fetch(apiUrl(`/api/inscripciones/${row.id}/estado`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminAuthHeaders(),
      },
      body: JSON.stringify({ estado: modalEstado.value, comentario }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalError.value = data.error || 'No se pudo actualizar'
      return
    }
    const actualizada = data.inscripcion
    if (actualizada) {
      filas.value = filas.value.map((r) => (r.id === actualizada.id ? actualizada : r))
      seleccionadaId.value = actualizada.id
    }
    cerrarModal()
  } catch {
    modalError.value = 'Sin conexión al servidor.'
  } finally {
    actualizandoId.value = null
  }
}

function abrirModalPago(estado) {
  if (!seleccionada.value || seleccionada.value.pagoEstado !== 'ENVIADO') return
  modalPagoEstado.value = estado
  modalPagoComentario.value = ''
  modalPagoError.value = ''
  modalPagoAbierto.value = true
}

function cerrarModalPago() {
  modalPagoAbierto.value = false
  modalPagoComentario.value = ''
  modalPagoError.value = ''
}

async function confirmarResolucionPago() {
  const row = seleccionada.value
  if (!row) return
  const comentario = modalPagoComentario.value.trim()
  if (modalPagoEstado.value === 'RECHAZADO' && comentario.length < 6) {
    modalPagoError.value = 'Escribe un motivo de al menos 6 caracteres.'
    return
  }

  actualizandoId.value = row.id
  modalPagoError.value = ''
  error.value = ''
  try {
    const res = await fetch(apiUrl(`/api/inscripciones/${row.id}/pago-estado`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...adminAuthHeaders(),
      },
      body: JSON.stringify({
        pagoEstado: modalPagoEstado.value,
        comentario: comentario || undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      modalPagoError.value = data.error || 'No se pudo actualizar el pago'
      return
    }
    const actualizada = data.inscripcion
    if (actualizada) {
      filas.value = filas.value.map((r) => (r.id === actualizada.id ? actualizada : r))
      seleccionadaId.value = actualizada.id
    }
    cerrarModalPago()
  } catch {
    modalPagoError.value = 'Sin conexión al servidor.'
  } finally {
    actualizandoId.value = null
  }
}

function cerrarSesion() {
  setAdminToken(null)
  router.push('/admin/login')
}

onMounted(cargar)
</script>

<template>
  <div class="pagina-admin-lista">
    <AppNavbar />

    <section class="admin-panel">
      <div class="admin-panel-head">
        <div>
          <h1 class="admin-title">Solicitudes de inscripción</h1>
          <p class="admin-sub">
            Revisa los datos del alumno y responde con una explicación al aceptar o rechazar.
          </p>
        </div>
        <div class="admin-panel-actions">
          <button type="button" class="admin-top-btn admin-top-btn-refresh" :disabled="cargando" @click="cargar">
            Actualizar
          </button>
          <button type="button" class="admin-top-btn admin-top-btn-logout" @click="cerrarSesion">Salir</button>
        </div>
      </div>

      <AdminNav />

      <div class="admin-filtros" role="tablist" aria-label="Filtrar solicitudes">
        <button
          type="button"
          class="admin-filtro-btn"
          :class="{ activo: filtro === 'pendientes' }"
          @click="filtro = 'pendientes'"
        >
          Pendientes ({{ conteos.pendientes }})
        </button>
        <button
          type="button"
          class="admin-filtro-btn"
          :class="{ activo: filtro === 'resueltas' }"
          @click="filtro = 'resueltas'"
        >
          Resueltas ({{ conteos.resueltas }})
        </button>
        <button
          type="button"
          class="admin-filtro-btn"
          :class="{ activo: filtro === 'todas' }"
          @click="filtro = 'todas'"
        >
          Todas ({{ conteos.todas }})
        </button>
      </div>

      <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>

      <div v-if="cargando" class="admin-loading">Cargando solicitudes…</div>

      <div v-else-if="filas.length === 0" class="admin-empty-panel">
        <p>Aún no hay inscripciones registradas.</p>
        <RouterLink to="/inscripcion" class="link-arrow">Ir al formulario público →</RouterLink>
      </div>

      <div v-else class="admin-layout">
        <aside class="admin-lista" aria-label="Listado de solicitudes">
          <p v-if="filasFiltradas.length === 0" class="admin-lista-vacio">
            No hay solicitudes en este filtro.
          </p>
          <button
            v-for="r in filasFiltradas"
            :key="r.id"
            type="button"
            class="admin-lista-item"
            :class="{ activo: seleccionadaId === r.id }"
            @click="seleccionar(r)"
          >
            <span class="admin-lista-item-top">
              <strong>{{ r.nombre }}</strong>
              <span class="estado-chip" :class="`estado-${(r.estado || 'PENDIENTE').toLowerCase()}`">
                {{ etiquetaEstadoAdmin[r.estado] || r.estado }}
              </span>
            </span>
            <span class="admin-lista-item-meta">
              {{ etiquetaTaller[r.taller] || r.taller }} · {{ formatearFecha(r.createdAt) }} · {{ etiquetaPagoAdmin(r.pagoEstado) }}
            </span>
            <span v-if="r.pagoEstado === 'ENVIADO'" class="admin-lista-item-meta" style="color: var(--cian)">
              ⚡ Actualización: pago enviado por el alumno
            </span>
          </button>
        </aside>

        <div v-if="seleccionada" class="admin-detalle">
          <header class="admin-detalle-head">
            <div>
              <p class="hero-kicker">Solicitud #{{ seleccionada.id }}</p>
              <h2 class="admin-detalle-nombre">{{ seleccionada.nombre }}</h2>
              <span class="estado-chip" :class="`estado-${(seleccionada.estado || 'PENDIENTE').toLowerCase()}`">
                {{ etiquetaEstadoAdmin[seleccionada.estado] || seleccionada.estado }}
              </span>
            </div>
          </header>

          <div class="admin-detalle-grid">
            <div class="admin-dato">
              <span class="admin-dato-label">Correo</span>
              <a :href="`mailto:${seleccionada.correo}`" class="admin-dato-valor">{{ seleccionada.correo }}</a>
            </div>
            <div class="admin-dato">
              <span class="admin-dato-label">Teléfono</span>
              <a :href="`tel:${seleccionada.telefono}`" class="admin-dato-valor">{{ seleccionada.telefono }}</a>
            </div>
            <div class="admin-dato">
              <span class="admin-dato-label">Taller</span>
              <span class="admin-dato-valor">{{ etiquetaTaller[seleccionada.taller] || seleccionada.taller }}</span>
            </div>
            <div class="admin-dato">
              <span class="admin-dato-label">Enviada</span>
              <span class="admin-dato-valor">{{ formatearFecha(seleccionada.createdAt) }}</span>
            </div>
            <div class="admin-dato">
              <span class="admin-dato-label">Pago</span>
              <span class="estado-chip" :class="clasePagoAdmin(seleccionada.pagoEstado)">
                {{ etiquetaPagoAdmin(seleccionada.pagoEstado) }}
              </span>
            </div>
          </div>

          <div v-if="seleccionada.pagoEstado && seleccionada.pagoEstado !== 'NO_INICIADO'" class="admin-respuesta-previa">
            <h3>Datos de pago del alumno</h3>
            <p><strong>Método:</strong> {{ seleccionada.pagoMetodo || '—' }}</p>
            <p v-if="seleccionada.pagoReferencia"><strong>Referencia:</strong> {{ seleccionada.pagoReferencia }}</p>
            <p v-if="seleccionada.pagoTitular"><strong>Titular:</strong> {{ seleccionada.pagoTitular }}</p>
            <p v-if="seleccionada.pagoLast4"><strong>Tarjeta:</strong> **** {{ seleccionada.pagoLast4 }}</p>
            <p v-if="seleccionada.pagoQrData"><strong>QR Ref:</strong> {{ seleccionada.pagoQrData }}</p>
            <p v-if="seleccionada.pagoEnviadoAt" class="admin-cuenta-meta">
              Enviado: {{ formatearFecha(seleccionada.pagoEnviadoAt) }}
            </p>
            <p v-if="seleccionada.pagoComentarioAdmin" class="admin-cuenta-meta">
              Comentario admin: {{ seleccionada.pagoComentarioAdmin }}
            </p>
            <div v-if="seleccionada.pagoEstado === 'ENVIADO'" class="admin-detalle-acciones">
              <button
                type="button"
                class="admin-action-btn admin-action-accept"
                :disabled="actualizandoId === seleccionada.id"
                @click="abrirModalPago('APROBADO')"
              >
                Aprobar pago
              </button>
              <button
                type="button"
                class="admin-action-btn admin-action-deny"
                :disabled="actualizandoId === seleccionada.id"
                @click="abrirModalPago('RECHAZADO')"
              >
                Rechazar pago
              </button>
            </div>
          </div>

          <div v-if="seleccionada.user" class="admin-cuenta-vinculada">
            <h3>Cuenta de alumno vinculada</h3>
            <div class="admin-cuenta-row">
              <img
                v-if="seleccionada.user.avatarUrl"
                :src="resolveAvatarUrl(seleccionada.user.avatarUrl)"
                alt=""
                class="admin-cuenta-avatar-img"
                width="48"
                height="48"
              />
              <UserAvatar
                v-else
                size="md"
                :nombre="seleccionada.user.nombre"
                :email="seleccionada.user.email"
              />
              <div>
                <p class="admin-dato-valor">{{ seleccionada.user.nombre || '—' }}</p>
                <p class="admin-cuenta-meta">{{ seleccionada.user.email }}</p>
                <p v-if="seleccionada.user.telefono" class="admin-cuenta-meta">
                  Tel. cuenta: {{ seleccionada.user.telefono }}
                </p>
                <p class="admin-cuenta-meta">
                  Registro: {{ formatearFecha(seleccionada.user.createdAt) }}
                </p>
              </div>
            </div>
          </div>
          <p v-else class="admin-sin-cuenta">Enviada sin sesión iniciada (solo datos del formulario).</p>

          <div v-if="seleccionada.comentarioAdmin" class="admin-respuesta-previa">
            <h3>Respuesta enviada al alumno</h3>
            <p>{{ seleccionada.comentarioAdmin }}</p>
            <p v-if="seleccionada.respondidoAt" class="admin-cuenta-meta">
              {{ formatearFecha(seleccionada.respondidoAt) }}
            </p>
          </div>

          <div v-if="seleccionada.estado === 'PENDIENTE'" class="admin-detalle-acciones">
            <button
              type="button"
              class="admin-action-btn admin-action-accept"
              :disabled="actualizandoId === seleccionada.id"
              @click="abrirModal('APROBADA')"
            >
              Aceptar solicitud
            </button>
            <button
              type="button"
              class="admin-action-btn admin-action-deny"
              :disabled="actualizandoId === seleccionada.id"
              @click="abrirModal('DENEGADA')"
            >
              Rechazar solicitud
            </button>
          </div>
        </div>

        <div v-else class="admin-detalle admin-detalle-vacio">
          <p>Selecciona una solicitud de la lista.</p>
        </div>
      </div>

      <p class="admin-foot">
        <RouterLink to="/inscripcion" class="link-arrow">Ir al formulario público →</RouterLink>
      </p>
    </section>

    <Teleport to="body">
      <div v-if="modalPagoAbierto" class="admin-modal-overlay" role="presentation" @click.self="cerrarModalPago">
        <div class="admin-modal" role="dialog" aria-modal="true">
          <h2>{{ modalPagoEstado === 'APROBADO' ? 'Aprobar pago' : 'Rechazar pago' }}</h2>
          <p class="admin-modal-lead">
            {{
              modalPagoEstado === 'APROBADO'
                ? 'Confirma que el comprobante del alumno es válido.'
                : 'Indica el motivo del rechazo. El alumno lo verá en su solicitud.'
            }}
          </p>
          <div v-if="modalPagoEstado === 'RECHAZADO'" class="grupo-input">
            <label for="admin-pago-comentario">Motivo del rechazo</label>
            <textarea
              id="admin-pago-comentario"
              v-model="modalPagoComentario"
              rows="4"
              placeholder="Ej: La referencia no coincide con el monto enviado."
              required
            />
          </div>
          <p v-if="modalPagoError" class="form-msg form-msg-error" role="alert">{{ modalPagoError }}</p>
          <div class="admin-modal-actions">
            <button type="button" class="btn-fantasma btn-fantasma-inline" @click="cerrarModalPago">Cancelar</button>
            <button
              type="button"
              class="btn-enviar"
              :class="modalPagoEstado === 'RECHAZADO' ? 'btn-enviar-deny' : ''"
              :disabled="actualizandoId != null"
              @click="confirmarResolucionPago"
            >
              {{ actualizandoId != null ? 'Guardando…' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="modalAbierto" class="admin-modal-overlay" role="presentation" @click.self="cerrarModal">
        <div
          class="admin-modal"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalEstado === 'APROBADA' ? 'modal-aceptar' : 'modal-rechazar'"
        >
          <h2 :id="modalEstado === 'APROBADA' ? 'modal-aceptar' : 'modal-rechazar'">
            {{ modalEstado === 'APROBADA' ? 'Aceptar solicitud' : 'Rechazar solicitud' }}
          </h2>
          <p class="admin-modal-lead">
            Esta explicación la verá el alumno en <strong>Mis solicitudes</strong>. Sé claro sobre los
            siguientes pasos o el motivo del rechazo.
          </p>
          <p v-if="seleccionada" class="admin-modal-alumno">
            {{ seleccionada.nombre }} — {{ etiquetaTaller[seleccionada.taller] || seleccionada.taller }}
          </p>
          <div class="grupo-input">
            <label for="admin-comentario">Mensaje para el alumno</label>
            <textarea
              id="admin-comentario"
              v-model="modalComentario"
              rows="5"
              placeholder="Ej: Tu plaza está confirmada. Te enviaremos el calendario por correo esta semana."
              required
            />
          </div>
          <p v-if="modalError" class="form-msg form-msg-error" role="alert">{{ modalError }}</p>
          <div class="admin-modal-actions">
            <button type="button" class="btn-fantasma btn-fantasma-inline" @click="cerrarModal">Cancelar</button>
            <button
              type="button"
              class="btn-enviar"
              :class="modalEstado === 'DENEGADA' ? 'btn-enviar-deny' : ''"
              :disabled="actualizandoId != null"
              @click="confirmarResolucion"
            >
              {{ actualizandoId != null ? 'Guardando…' : modalEstado === 'APROBADA' ? 'Confirmar aceptación' : 'Confirmar rechazo' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
