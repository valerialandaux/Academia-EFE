<script setup>
import { computed, watch, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import CursoPrecio from '../components/CursoPrecio.vue'
import { formatPrecio } from '../lib/precios'
import { useContent } from '../composables/useContent'
import { apiUrl, authHeaders } from '../lib/api'
import { infoPresencialPorTaller } from '../data/inscripcionesMeta'

const route = useRoute()

const { cursos, fetchCursos } = useContent()
const inscripciones = ref([])

const curso = computed(() => {
  const slug = String(route.params.slug || '')
  return (cursos.value || []).find((c) => c.slug === slug) || null
})

watch(
  curso,
  (c) => {
    if (c) document.title = `${c.titulo} | Academia EFE`
  },
  { immediate: true },
)

function etiquetaNivel(n) {
  return n === 'basico' ? 'Básico' : 'Avanzado'
}

function etiquetaTema(t) {
  const map = { retrato: 'Retrato', edicion: 'Edición', paisaje: 'Paisaje' }
  return map[t] || t
}

const yaInscrito = computed(() => {
  const c = curso.value
  if (!c) return false
  return inscripciones.value.some(
    (r) =>
      r.taller === c.slug &&
      r.estado === 'APROBADA' &&
      ['ENVIADO', 'APROBADO'].includes(r.pagoEstado || 'NO_INICIADO'),
  )
})

const solicitudCurso = computed(() => {
  const c = curso.value
  if (!c) return null
  return (
    inscripciones.value.find(
      (r) =>
        r.taller === c.slug &&
        r.estado === 'APROBADA' &&
        ['ENVIADO', 'APROBADO'].includes(r.pagoEstado || 'NO_INICIADO'),
    ) || null
  )
})

const pagoConfirmado = computed(() => (solicitudCurso.value?.pagoEstado || 'NO_INICIADO') === 'APROBADO')
const pagoEnRevision = computed(() => (solicitudCurso.value?.pagoEstado || 'NO_INICIADO') === 'ENVIADO')
const infoPresencial = computed(() => {
  const c = curso.value
  if (!c || !pagoConfirmado.value) return null
  if (c.sede && c.horario) {
    return {
      sede: c.sede,
      horario: c.horario,
      llevar: c.materiales || 'Consulta con el equipo académico.',
      nota: c.notaPresencial || '',
    }
  }
  return infoPresencialPorTaller[c.slug] || null
})

async function fetchMisSolicitudes() {
  try {
    const res = await fetch(apiUrl('/api/inscripciones/mias'), { headers: authHeaders() })
    if (!res.ok) return
    const data = await res.json().catch(() => [])
    inscripciones.value = Array.isArray(data) ? data : []
  } catch {
    inscripciones.value = []
  }
}

onMounted(async () => {
  await fetchCursos()
  await fetchMisSolicitudes()
})
</script>

<template>
  <div class="pagina-detalle">
    <AppNavbar />

    <template v-if="curso">
      <div class="detalle-cover anim-fade-up">
        <img
          :src="curso.imagen"
          :alt="curso.imagenAlt"
          width="1600"
          height="900"
          loading="eager"
          decoding="async"
        />
      </div>

      <header class="detalle-hero anim-fade-up">
        <RouterLink to="/cursos" class="breadcrumb">← Volver al catálogo</RouterLink>
        <p class="hero-kicker">Taller</p>
        <h1>{{ curso.titulo }}</h1>
        <p class="detalle-lead">{{ curso.corto }}</p>
        <div class="detalle-tags">
          <span v-for="n in curso.niveles" :key="n" class="tag">{{ etiquetaNivel(n) }}</span>
          <span v-for="t in curso.temas" :key="t" class="tag tag-outline">{{ etiquetaTema(t) }}</span>
          <span class="tag tag-outline">{{ curso.duracion }}</span>
          <span v-if="curso.precio" class="tag tag-precio">{{ formatPrecio(curso.precio) }}</span>
        </div>
      </header>

      <section class="detalle-cuerpo">
        <div class="detalle-main anim-reveal">
          <h2>Descripción</h2>
          <p>{{ curso.detalle }}</p>
          <p>{{ curso.descripcion }}</p>
          <div v-if="yaInscrito" class="detalle-inscrito-box detalle-inscrito-box-wide">
            <h4>{{ pagoConfirmado ? 'Inscripción confirmada' : 'Pago en revisión' }}</h4>
            <p v-if="pagoEnRevision">
              Ya recibimos tu comprobante. El equipo académico lo está validando para confirmar tu acceso.
            </p>
            <template v-if="infoPresencial">
              <p><strong>Dónde ir:</strong> {{ infoPresencial.sede }}</p>
              <p><strong>Horario:</strong> {{ infoPresencial.horario }}</p>
              <p><strong>Qué llevar:</strong> {{ infoPresencial.llevar }}</p>
              <p class="detalle-inscrito-nota">{{ infoPresencial.nota }}</p>
            </template>
          </div>
        </div>
        <aside class="detalle-aside anim-reveal" style="animation-delay: 0.1s">
          <div class="aside-card">
            <h3>Inversión</h3>
            <CursoPrecio
              v-if="curso.precio"
              :precio="curso.precio"
              size="lg"
              class="aside-precio"
              :show-guest-hint="true"
              :show-session-note="true"
            />
            <h3 class="aside-subtitle">Próximos pasos</h3>
            <p>Reserva tu plaza y elige fecha de inicio en el formulario.</p>
            <span v-if="yaInscrito" class="btn-cta-large btn-glow btn-block btn-fantasma-disabled">
              Ya inscrito
            </span>
            <RouterLink v-else :to="{ path: '/inscripcion', query: { taller: curso.slug } }" class="btn-cta-large btn-glow btn-block">
              Inscribirme en este taller
            </RouterLink>
            <RouterLink to="/cursos" class="btn-outline-light btn-block btn-mt">Ver otros cursos</RouterLink>
          </div>
        </aside>
      </section>
    </template>

    <div v-else class="detalle-404 anim-fade-up">
      <h1>Curso no encontrado</h1>
      <RouterLink to="/cursos" class="btn-cta-large">Ir al catálogo</RouterLink>
    </div>

    <AppFooter />
  </div>
</template>
