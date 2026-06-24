<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import { apiUrl, authHeaders } from '../lib/api'
import { useAuth } from '../composables/useAuth'
import { etiquetaTaller } from '../data/inscripcionesMeta'
import { validarExpiracionTarjeta } from '../lib/validacion'

const route = useRoute()
const router = useRouter()
const { fetchMe } = useAuth()

const fila = ref(null)
const error = ref('')
const cargando = ref(true)
const enviando = ref(false)
const ok = ref('')
const errores = ref({ titular: '', numero: '', expiracion: '', cvv: '', qrData: '' })

const metodo = ref('QR')
const titular = ref('')
const numero = ref('')
const expiracion = ref('')
const cvv = ref('')
const qrData = ref('')

const demoTarjeta = {
  titular: 'ALUMNO DEMO',
  numero: '4111 1111 1111 1111',
  expiracion: '12/27',
  cvv: '123',
}

const id = computed(() => Number(route.params.id))

const puedePagar = computed(() => {
  if (!fila.value) return false
  return (
    fila.value.estado === 'APROBADA' &&
    (!fila.value.pagoEstado || fila.value.pagoEstado === 'NO_INICIADO' || fila.value.pagoEstado === 'RECHAZADO')
  )
})

async function cargar() {
  error.value = ''
  cargando.value = true
  try {
    const res = await fetch(apiUrl('/api/inscripciones/mias'), { headers: authHeaders() })
    const data = await res.json().catch(() => [])
    if (!res.ok) {
      error.value = 'No se pudo cargar la solicitud.'
      return
    }
    const row = (Array.isArray(data) ? data : []).find((r) => r.id === id.value) || null
    fila.value = row
    if (!row) {
      error.value = 'Solicitud no encontrada.'
    } else if (!puedePagar.value) {
      error.value = 'Esta solicitud no está disponible para pago ahora.'
    }
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    cargando.value = false
  }
}

function validarPago() {
  errores.value = { titular: '', numero: '', expiracion: '', cvv: '', qrData: '' }
  if (metodo.value === 'TARJETA') {
    if (titular.value.trim().length < 4) {
      errores.value.titular = 'Nombre del titular: mínimo 4 caracteres.'
    }
    const numeroLimpio = numero.value.replace(/\D/g, '')
    if (numeroLimpio.length < 12 || numeroLimpio.length > 19) {
      errores.value.numero = 'Número de tarjeta inválido (12 a 19 dígitos).'
    }
    errores.value.expiracion = validarExpiracionTarjeta(expiracion.value)
    if (!/^\d{3,4}$/.test(cvv.value.trim())) {
      errores.value.cvv = 'CVV inválido (3 o 4 dígitos).'
    }
  } else {
    const ref = (qrData.value || '').trim()
    if (ref && ref.length < 6) {
      errores.value.qrData = 'La referencia QR debe tener al menos 6 caracteres.'
    }
  }
  return Object.values(errores.value).every((m) => !m)
}

async function enviarPago() {
  if (!fila.value || !puedePagar.value) return
  error.value = ''
  ok.value = ''
  if (!validarPago()) return
  enviando.value = true
  try {
    const payload =
      metodo.value === 'TARJETA'
        ? {
            metodo: 'TARJETA',
            titular: titular.value,
            numero: numero.value,
            expiracion: expiracion.value,
            cvv: cvv.value,
          }
        : { metodo: 'QR', qrData: qrData.value || 'QR-DEMO-0001' }

    const res = await fetch(apiUrl(`/api/inscripciones/${fila.value.id}/pago`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      error.value = data.error || 'No se pudo registrar el pago'
      return
    }
    ok.value = 'Pago enviado correctamente. Queda en revisión de administración.'
    setTimeout(() => router.push('/mis-solicitudes'), 900)
  } catch {
    error.value = 'Sin conexión al servidor.'
  } finally {
    enviando.value = false
  }
}

function usarTarjetaDemo() {
  metodo.value = 'TARJETA'
  titular.value = demoTarjeta.titular
  numero.value = demoTarjeta.numero
  expiracion.value = demoTarjeta.expiracion
  cvv.value = demoTarjeta.cvv
  errores.value = { titular: '', numero: '', expiracion: '', cvv: '', qrData: '' }
}

onMounted(async () => {
  await fetchMe()
  await cargar()
})
</script>

<template>
  <div class="pagina-pago-solicitud">
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
        <p class="hero-kicker">Pago</p>
        <h1>Confirmar inscripción</h1>
        <p v-if="fila" class="page-hero-lead">
          Taller: {{ etiquetaTaller[fila.taller] || fila.taller }}
        </p>
      </div>
    </header>

    <section class="seccion-formulario">
      <div class="contenedor-form anim-reveal contenedor-form-wide">
        <RouterLink to="/mis-solicitudes" class="breadcrumb form-breadcrumb">← Mis solicitudes</RouterLink>
        <h2>Datos de pago</h2>
        <p class="auth-lead">Completa el método de pago. Los datos son de demostración; el equipo revisará tu comprobante.</p>

        <p v-if="error" class="form-msg form-msg-error" role="alert">{{ error }}</p>
        <p v-if="ok" class="form-msg form-msg-ok" role="status">{{ ok }}</p>
        <div v-if="cargando" class="admin-loading">Cargando…</div>

        <form v-else-if="fila && puedePagar" novalidate @submit.prevent="enviarPago">
          <div class="grupo-input">
            <label for="metodo-pago">Método de pago</label>
            <select id="metodo-pago" v-model="metodo">
              <option value="QR">QR</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>

          <div v-if="metodo === 'QR'" class="pago-qr-block">
            <p class="auth-lead" style="margin-bottom: 12px">Escanea el QR de ejemplo y registra tu referencia:</p>
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ACADEMIA-EFE-DEMO"
              alt="QR de ejemplo"
              width="220"
              height="220"
              class="pago-qr-img"
            />
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.qrData }">
              <label for="qr-ref">Referencia de pago (opcional)</label>
              <input
                id="qr-ref"
                v-model="qrData"
                maxlength="180"
                placeholder="Ej: QR-BCP-2026-0001"
                @input="errores.qrData = ''"
              />
              <p v-if="errores.qrData" class="campo-error" role="alert">{{ errores.qrData }}</p>
            </div>
          </div>

          <template v-else>
            <p class="auth-lead" style="margin-bottom: 12px">
              Tarjeta demo: <code>{{ demoTarjeta.numero }}</code> · {{ demoTarjeta.expiracion }} · CVV {{ demoTarjeta.cvv }}
            </p>
            <button type="button" class="btn-fantasma btn-fantasma-inline" style="margin-bottom: 16px" @click="usarTarjetaDemo">
              Usar tarjeta de prueba
            </button>
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.titular }">
              <label for="titular">Nombre del titular</label>
              <input id="titular" v-model="titular" maxlength="120" @input="errores.titular = ''" />
              <p v-if="errores.titular" class="campo-error" role="alert">{{ errores.titular }}</p>
            </div>
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.numero }">
              <label for="numero-tarjeta">Número de tarjeta</label>
              <input
                id="numero-tarjeta"
                v-model="numero"
                inputmode="numeric"
                maxlength="24"
                placeholder="4111 1111 1111 1111"
                @input="errores.numero = ''"
              />
              <p v-if="errores.numero" class="campo-error" role="alert">{{ errores.numero }}</p>
            </div>
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.expiracion }">
              <label for="expiracion">Expiración (MM/AA)</label>
              <input
                id="expiracion"
                v-model="expiracion"
                inputmode="numeric"
                placeholder="12/27"
                maxlength="5"
                @input="errores.expiracion = ''"
              />
              <p v-if="errores.expiracion" class="campo-error" role="alert">{{ errores.expiracion }}</p>
            </div>
            <div class="grupo-input" :class="{ 'grupo-input--error': errores.cvv }">
              <label for="cvv">CVV</label>
              <input
                id="cvv"
                v-model="cvv"
                inputmode="numeric"
                maxlength="4"
                placeholder="123"
                @input="errores.cvv = ''"
              />
              <p v-if="errores.cvv" class="campo-error" role="alert">{{ errores.cvv }}</p>
            </div>
          </template>

          <button type="submit" class="btn-enviar" :disabled="enviando">
            {{ enviando ? 'Enviando…' : 'Enviar pago' }}
          </button>
        </form>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
