<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import CursoPrecio from '../components/CursoPrecio.vue'
import { useContent } from '../composables/useContent'
import { apiUrl, authHeaders } from '../lib/api'

const { cursos, fetchCursos } = useContent()
const inscripciones = ref([])

const filtrosNivel = ref([])
const filtrosTema = ref([])

const cursosFiltrados = computed(() => {
  const lista = cursos.value || []
  if (!filtrosNivel.value.length && !filtrosTema.value.length) return lista
  return lista.filter((c) => {
    const okN =
      !filtrosNivel.value.length || filtrosNivel.value.some((n) => c.niveles.includes(n))
    const okT = !filtrosTema.value.length || filtrosTema.value.some((t) => c.temas.includes(t))
    return okN && okT
  })
})

function etiquetaNivel(n) {
  return n === 'basico' ? 'Básico' : 'Avanzado'
}

function etiquetaTema(t) {
  const map = { retrato: 'Retrato', edicion: 'Edición', paisaje: 'Paisaje' }
  return map[t] || t
}

function cursoInscrito(curso) {
  return inscripciones.value.some(
    (r) =>
      r.taller === curso.slug &&
      r.estado === 'APROBADA' &&
      ['ENVIADO', 'APROBADO'].includes(r.pagoEstado || 'NO_INICIADO'),
  )
}

function cursoInscritoConfirmado(curso) {
  return inscripciones.value.some(
    (r) => r.taller === curso.slug && r.estado === 'APROBADA' && (r.pagoEstado || 'NO_INICIADO') === 'APROBADO',
  )
}

function cursoPagoEnRevision(curso) {
  return inscripciones.value.some(
    (r) => r.taller === curso.slug && r.estado === 'APROBADA' && (r.pagoEstado || 'NO_INICIADO') === 'ENVIADO',
  )
}

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
  <div class="pagina-cursos">
    <AppNavbar />

    <header class="page-hero page-hero--compact">
      <img
        class="page-hero-photo"
        :src="siteImages.heroCursos"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg page-hero-bg--alt" aria-hidden="true" />
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker">Catálogo</p>
        <h1>Nuestros cursos</h1>
        <p class="page-hero-lead">Filtra por nivel y tema. Cada ficha lleva al detalle y a inscripción.</p>
      </div>
    </header>

    <section class="seccion-cursos seccion-cursos-full">
      <div class="contenedor-catalogo">
        <aside class="panel-filtros anim-reveal">
          <h3>Filtrar por</h3>
          <div class="filtro-grupo">
            <h4>Nivel</h4>
            <label
              ><input v-model="filtrosNivel" type="checkbox" value="basico" /> {{ etiquetaNivel('basico') }}</label
            >
            <label
              ><input v-model="filtrosNivel" type="checkbox" value="avanzado" />
              {{ etiquetaNivel('avanzado') }}</label
            >
          </div>
          <div class="filtro-grupo">
            <h4>Tema</h4>
            <label><input v-model="filtrosTema" type="checkbox" value="retrato" /> Retrato</label>
            <label><input v-model="filtrosTema" type="checkbox" value="edicion" /> Edición</label>
            <label><input v-model="filtrosTema" type="checkbox" value="paisaje" /> Paisaje</label>
          </div>
          <p v-if="!cursosFiltrados.length" class="filtro-vacio">Ningún curso coincide. Prueba otros filtros.</p>
        </aside>

        <div class="grid-cursos">
          <div class="grid-cursos-inner">
            <article
              v-for="(curso, i) in cursosFiltrados"
              :key="curso.slug"
              class="card-curso card-lift anim-reveal"
              :class="{
                'card-curso-inscrito': cursoInscritoConfirmado(curso),
                'card-curso-en-revision': cursoPagoEnRevision(curso),
              }"
              :style="{ animationDelay: `${0.06 + i * 0.05}s` }"
            >
              <RouterLink :to="`/cursos/${curso.slug}`" class="card-media-link">
                <div class="card-media">
                  <img
                    :src="curso.imagen"
                    :alt="curso.imagenAlt"
                    width="1000"
                    height="667"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </RouterLink>
              <div class="card-tags">
                <span v-for="n in curso.niveles" :key="n" class="tag">{{ etiquetaNivel(n) }}</span>
                <span v-for="t in curso.temas" :key="t" class="tag tag-outline">{{ etiquetaTema(t) }}</span>
                <span v-if="cursoInscritoConfirmado(curso)" class="tag tag-inscrito">Inscripción confirmada</span>
                <span v-else-if="cursoPagoEnRevision(curso)" class="tag tag-inscrito">Pago en revisión</span>
              </div>
              <h3>{{ curso.titulo }}</h3>
              <CursoPrecio
                v-if="curso.precio"
                :precio="curso.precio"
                size="sm"
                :show-guest-hint="false"
                :show-session-note="false"
              />
              <p>{{ curso.descripcion }}</p>
              <p class="card-meta">{{ curso.duracion }}</p>
              <div class="card-actions">
                <RouterLink :to="`/cursos/${curso.slug}`" class="btn-text">Ver ficha</RouterLink>
                <span v-if="cursoInscrito(curso)" class="btn-fantasma btn-fantasma-inline btn-fantasma-disabled">
                  Ya inscrito
                </span>
                <RouterLink v-else :to="{ path: '/inscripcion', query: { taller: curso.slug } }" class="btn-fantasma btn-fantasma-inline">
                  Inscribirse
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
