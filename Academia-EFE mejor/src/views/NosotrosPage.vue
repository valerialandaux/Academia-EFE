<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import { useContent } from '../composables/useContent'

const { nosotros, fetchNosotros } = useContent()

const titulo = computed(() => nosotros.value?.titulo || 'Historia y equipo')
const lead = computed(
  () =>
    nosotros.value?.lead ||
    'Una escuela pensada para quien quiere aprender haciendo, con criterio y oficio.',
)

const bodyParrafos = computed(() => {
  const raw = String(nosotros.value?.body || '').trim()
  if (!raw) return null
  return raw
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
})

onMounted(fetchNosotros)
</script>

<template>
  <div class="pagina-nosotros">
    <AppNavbar />

    <header class="page-hero">
      <img
        class="page-hero-photo"
        :src="siteImages.heroNosotros"
        alt=""
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
      />
      <div class="page-hero-bg" aria-hidden="true" />
      <div class="page-hero-content anim-fade-up">
        <p class="hero-kicker">Nosotros</p>
        <h1>{{ titulo }}</h1>
        <p class="page-hero-lead">
          {{ lead }}
        </p>
      </div>
    </header>

    <section class="bloque-texto anim-reveal">
      <template v-if="bodyParrafos?.length">
        <h2>Texto</h2>
        <p v-for="(p, i) in bodyParrafos" :key="i">{{ p }}</p>
      </template>
      <template v-else>
        <h2>Misión</h2>
        <p>
          Formar fotógrafos y narradores visuales con base técnica sólida y criterio artístico. Creemos en
          el error controlado, la repetición con intención y el feedback honesto.
        </p>
        <p>
          Nuestro equipo docente trabaja en encargos reales: editorial, retrato, publicidad y cine
          independiente. Lo que enseñamos es lo que aplicamos cada semana.
        </p>
      </template>
    </section>

    <section class="bloque-valores">
      <h2 class="anim-reveal">Lo que nos define</h2>
      <ul class="lista-valores">
        <li class="anim-reveal" style="animation-delay: 0.05s">Grupos reducidos y seguimiento cercano</li>
        <li class="anim-reveal" style="animation-delay: 0.1s">Equipamiento de estudio disponible en talleres</li>
        <li class="anim-reveal" style="animation-delay: 0.15s">Biblioteca de referencias y materiales</li>
        <li class="anim-reveal" style="animation-delay: 0.2s">Salidas prácticas con briefing claro</li>
      </ul>
    </section>

    <section class="bloque-equipo">
      <h2 class="anim-reveal">Equipo</h2>
      <div class="grid-equipo">
        <figure
          v-for="(persona, i) in siteImages.equipo"
          :key="i"
          class="equipo-card anim-reveal"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div class="equipo-foto">
            <img :src="persona.src" :alt="persona.alt" width="600" height="750" loading="lazy" decoding="async" />
          </div>
          <figcaption>Docente invitado</figcaption>
        </figure>
      </div>
    </section>

    <section class="seccion-cta-final">
      <div class="cta-final-inner anim-reveal">
        <h2>Explora el catálogo</h2>
        <p>Encuentra el taller que encaja con tu nivel y tus objetivos.</p>
        <RouterLink to="/cursos" class="btn-cta-large btn-glow">Ver cursos</RouterLink>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
