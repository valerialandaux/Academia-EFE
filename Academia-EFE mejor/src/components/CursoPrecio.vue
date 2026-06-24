<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { getStoredToken } from '../lib/api'
import { formatPrecio, precioConDescuento, ahorroDescuento } from '../lib/precios'

const props = defineProps({
  precio: { type: Number, required: true },
  /** sm | md | lg */
  size: { type: String, default: 'md' },
  /** Aviso de descuento al iniciar sesión (solo ficha del curso, etc.) */
  showGuestHint: { type: Boolean, default: false },
  /** Nota bajo el precio descontado */
  showSessionNote: { type: Boolean, default: false },
  porcentajeOverride: { type: Number, default: null },
})

const { isLoggedIn, descuento, fetchMe } = useAuth()

onMounted(() => {
  if (getStoredToken()) fetchMe()
})

const porcentaje = computed(() => {
  if (props.porcentajeOverride != null) return props.porcentajeOverride
  return descuento.value?.porcentaje ?? 0
})

const tieneDescuento = computed(
  () => porcentaje.value > 0 && (props.porcentajeOverride != null || isLoggedIn.value),
)
const mostrarNotaSesion = computed(() => tieneDescuento.value && props.showSessionNote)

const precioFinal = computed(() => precioConDescuento(props.precio, porcentaje.value))
const ahorro = computed(() => ahorroDescuento(props.precio, porcentaje.value))
</script>

<template>
  <div class="curso-precio" :class="`curso-precio--${size}`" role="group" aria-label="Precio del curso">
    <template v-if="tieneDescuento">
      <div class="curso-precio-row">
        <span class="curso-precio-base">{{ formatPrecio(precio) }}</span>
        <span class="curso-precio-final">{{ formatPrecio(precioFinal) }}</span>
        <span class="curso-precio-badge">−{{ porcentaje }}%</span>
      </div>
      <p class="curso-precio-ahorro">Ahorras {{ formatPrecio(ahorro) }}</p>
      <p v-if="mostrarNotaSesion" class="curso-precio-nota-sesion">
        Precio con descuento por haber iniciado sesión con tu cuenta de alumno.
      </p>
    </template>
    <template v-else>
      <p class="curso-precio-solo">
        <span class="curso-precio-final">{{ formatPrecio(precio) }}</span>
      </p>
      <p v-if="showGuestHint" class="curso-precio-hint">
        Los descuentos del <strong>5% al 15%</strong> solo aplican si
        <RouterLink to="/login">inicias sesión</RouterLink>
        con tu cuenta de alumno (o
        <RouterLink to="/registro">creas una gratis</RouterLink>
        ). Sin sesión verás el precio completo.
      </p>
    </template>
  </div>
</template>
