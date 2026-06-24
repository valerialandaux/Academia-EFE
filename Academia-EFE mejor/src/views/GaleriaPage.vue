<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import GaleriaShowcase from '../components/GaleriaShowcase.vue'
import { siteImages } from '../data/siteImages'
import { useContent } from '../composables/useContent'

const filtroActivo = ref('todos')
const lightboxObra = ref(null)
const lightboxIndice = ref(0)
const gridKey = ref(0)

const { cursos, galeria, fetchCursos, fetchGaleria } = useContent()

const filtrosGaleria = computed(() => [
  { id: 'todos', label: 'Todos' },
  ...(cursos.value || []).map((c) => ({ id: c.slug, label: c.titulo })),
])

function etiquetaCursoGaleria(slug) {
  return (cursos.value || []).find((c) => c.slug === slug)?.titulo || slug
}

const obrasVisibles = computed(() => {
  const lista = galeria.value || []
  if (filtroActivo.value === 'todos') return lista
  return lista.filter((o) => o.curso === filtroActivo.value)
})

const obrasLightbox = computed(() => obrasVisibles.value)

watch(filtroActivo, () => {
  gridKey.value += 1
})

function abrirLightbox(obra) {
  const idx = obrasLightbox.value.findIndex((o) => o.id === obra.id)
  lightboxIndice.value = idx >= 0 ? idx : 0
  lightboxObra.value = obrasLightbox.value[lightboxIndice.value] ?? obra
  document.body.style.overflow = 'hidden'
}

function cerrarLightbox() {
  lightboxObra.value = null
  document.body.style.overflow = ''
}

function obraAnterior() {
  const n = obrasLightbox.value.length
  if (!n) return
  lightboxIndice.value = (lightboxIndice.value - 1 + n) % n
  lightboxObra.value = obrasLightbox.value[lightboxIndice.value]
}

function obraSiguiente() {
  const n = obrasLightbox.value.length
  if (!n) return
  lightboxIndice.value = (lightboxIndice.value + 1) % n
  lightboxObra.value = obrasLightbox.value[lightboxIndice.value]
}

function onKeydown(e) {
  if (!lightboxObra.value) return
  if (e.key === 'Escape') cerrarLightbox()
  if (e.key === 'ArrowLeft') obraAnterior()
  if (e.key === 'ArrowRight') obraSiguiente()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

onMounted(async () => {
  await fetchCursos()
  await fetchGaleria()
})
</script>

<template>
  <div class="pagina-galeria pagina-galeria--showcase">
    <AppNavbar />

    <header class="page-hero page-hero--compact galeria-hero-banner">
      <img
        class="page-hero-photo galeria-hero-banner-img"
        :src="siteImages.heroGaleria"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg page-hero-bg--alt" aria-hidden="true" />
      <div class="galeria-hero-orbs" aria-hidden="true">
        <span class="galeria-orb galeria-orb--1" />
        <span class="galeria-orb galeria-orb--2" />
        <span class="galeria-orb galeria-orb--3" />
      </div>
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker hero-kicker--pulse">Portfolio en movimiento</p>
        <h1>Galería de alumnos</h1>
        <p class="page-hero-lead">
          Carrusel en vivo, pasarela infinita y grid interactivo. Explora qué puedes lograr en cada
          taller.
        </p>
      </div>
    </header>

    <section class="seccion-galeria seccion-galeria--showcase">
      <GaleriaShowcase
        :key="filtroActivo"
        :obras="obrasVisibles"
        :etiqueta-curso="etiquetaCursoGaleria"
        @select="abrirLightbox"
      />

      <div class="galeria-intro anim-reveal">
        <p>
          <span class="galeria-intro-icon" aria-hidden="true">◆</span>
          Filtra por curso o explora el mosaico. Cada foto se amplía con la nota del proyecto.
        </p>
      </div>

      <div class="galeria-filtros anim-reveal" role="tablist" aria-label="Filtrar por curso">
        <button
          v-for="f in filtrosGaleria"
          :key="f.id"
          type="button"
          class="galeria-filtro-btn"
          :class="{ activo: filtroActivo === f.id }"
          role="tab"
          :aria-selected="filtroActivo === f.id"
          @click="filtroActivo = f.id"
        >
          {{ f.label }}
        </button>
      </div>

      <TransitionGroup
        v-if="obrasVisibles.length"
        :key="gridKey"
        name="galeria-grid"
        tag="div"
        class="galeria-grid"
      >
        <article
          v-for="(obra, i) in obrasVisibles"
          :key="obra.id"
          class="galeria-item"
          :class="{
            'galeria-item--alto': obra.ancho === 'alto',
            'galeria-item--ancho': obra.ancho === 'ancho',
          }"
          :style="{ '--galeria-i': i }"
        >
          <button type="button" class="galeria-item-btn" @click="abrirLightbox(obra)">
            <img :src="obra.src" :alt="obra.alt" loading="lazy" decoding="async" />
            <span class="galeria-item-overlay" aria-hidden="true" />
            <span class="galeria-item-shine" aria-hidden="true" />
            <span class="galeria-item-info">
              <span class="galeria-item-curso">{{ etiquetaCursoGaleria(obra.curso) }}</span>
              <span class="galeria-item-titulo">{{ obra.titulo }}</span>
              <span class="galeria-item-alumno">{{ obra.alumno }}</span>
            </span>
          </button>
        </article>
      </TransitionGroup>

      <p v-else class="galeria-vacio">No hay trabajos en este filtro.</p>

      <div class="galeria-cta anim-reveal galeria-cta--glow">
        <p>¿Quieres sumar tu trabajo a la galería?</p>
        <RouterLink :to="{ path: '/cursos' }" class="btn-cta-large btn-glow">Ver cursos</RouterLink>
        <RouterLink to="/inscripcion" class="btn-outline-light btn-mt-inline">Reservar plaza</RouterLink>
      </div>
    </section>

    <AppFooter />

    <Teleport to="body">
      <Transition name="galeria-lightbox-fade">
        <div
          v-if="lightboxObra"
          class="galeria-lightbox"
          role="dialog"
          aria-modal="true"
          :aria-label="lightboxObra.titulo"
          @click.self="cerrarLightbox"
        >
          <button type="button" class="galeria-lightbox-cerrar" aria-label="Cerrar" @click="cerrarLightbox">
            ×
          </button>
          <button
            v-if="obrasLightbox.length > 1"
            type="button"
            class="galeria-lightbox-nav galeria-lightbox-nav--prev"
            aria-label="Anterior"
            @click="obraAnterior"
          >
            ‹
          </button>
          <div class="galeria-lightbox-inner">
            <img :src="lightboxObra.src" :alt="lightboxObra.alt" />
            <div class="galeria-lightbox-meta">
              <p class="galeria-lightbox-kicker">{{ etiquetaCursoGaleria(lightboxObra.curso) }}</p>
              <h2>{{ lightboxObra.titulo }}</h2>
              <p class="galeria-lightbox-alumno">Alumno: {{ lightboxObra.alumno }}</p>
              <p class="galeria-lightbox-nota">{{ lightboxObra.nota }}</p>
              <RouterLink
                :to="`/cursos/${lightboxObra.curso}`"
                class="link-arrow galeria-lightbox-link"
                @click="cerrarLightbox"
              >
                Ver curso relacionado →
              </RouterLink>
            </div>
          </div>
          <button
            v-if="obrasLightbox.length > 1"
            type="button"
            class="galeria-lightbox-nav galeria-lightbox-nav--next"
            aria-label="Siguiente"
            @click="obraSiguiente"
          >
            ›
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
