<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { siteImages } from '../data/siteImages'
import CursoPrecio from '../components/CursoPrecio.vue'
import GaleriaShowcase from '../components/GaleriaShowcase.vue'
import { useContent } from '../composables/useContent'

const router = useRouter()
const { cursos, galeria, fetchCursos, fetchGaleria } = useContent()
const destacados = computed(() => (cursos.value || []).slice(0, 3))
const galeriaHome = computed(() => (galeria.value || []).slice(0, 10))

function etiquetaCursoGaleria(slug) {
  return (cursos.value || []).find((c) => c.slug === slug)?.titulo || slug
}

onMounted(async () => {
  await fetchCursos()
  await fetchGaleria()
})
</script>

<template>
  <div class="pagina-inicio">
    <AppNavbar />

    <section class="hero hero-anim">
      <div class="hero-bg" aria-hidden="true">
        <img
          class="hero-bg-img"
          :src="siteImages.heroInicio"
          :alt="siteImages.heroInicioAlt"
          width="1920"
          height="1080"
          loading="eager"
          decoding="async"
        />
      </div>
      <div class="hero-content">
        <p class="hero-kicker anim-fade-up" style="animation-delay: 0.05s">Academia EFE</p>
        <h1 class="anim-fade-up" style="animation-delay: 0.12s">Captura tu visión</h1>
        <p class="hero-sub anim-fade-up" style="animation-delay: 0.2s">
          Cursos prácticos de fotografía para todos los niveles. Equipo docente en activo.
        </p>
        <div class="hero-actions anim-fade-up" style="animation-delay: 0.28s">
          <RouterLink to="/cursos" class="btn-cta-large btn-glow">Ver catálogo de cursos</RouterLink>
          <RouterLink to="/nosotros" class="btn-outline-light">Conócenos</RouterLink>
        </div>
      </div>
    </section>

    <section class="seccion-intro">
      <div class="intro-grid">
        <div class="intro-card anim-reveal">
          <div class="intro-card-thumb">
            <img
              :src="siteImages.intro[0].src"
              :alt="siteImages.intro[0].alt"
              width="800"
              height="520"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3>Práctica real</h3>
          <p>Salidas, estudio y revisión de portfolio con feedback directo.</p>
        </div>
        <div class="intro-card anim-reveal" style="animation-delay: 0.1s">
          <div class="intro-card-thumb">
            <img
              :src="siteImages.intro[1].src"
              :alt="siteImages.intro[1].alt"
              width="800"
              height="520"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3>Niveles claros</h3>
          <p>Rutas desde cero hasta flujos avanzados de color y retrato.</p>
        </div>
        <div class="intro-card anim-reveal" style="animation-delay: 0.2s">
          <div class="intro-card-thumb">
            <img
              :src="siteImages.intro[2].src"
              :alt="siteImages.intro[2].alt"
              width="800"
              height="520"
              loading="lazy"
              decoding="async"
            />
          </div>
          <h3>Comunidad</h3>
          <p>Grupos reducidos para acompañarte en cada proyecto.</p>
        </div>
      </div>
    </section>

    <section class="seccion-nosotros seccion-nosotros-home">
      <div class="nosotros-texto anim-reveal">
        <h2>Sobre la Academia EFE</h2>
        <p>
          Somos una institución especializada en formación en fotografía y cine. Potenciamos lo técnico
          y lo creativo, de principiantes a creadores avanzados.
        </p>
        <RouterLink to="/nosotros" class="link-arrow">Ver historia y equipo →</RouterLink>
      </div>
      <div class="nosotros-imagen anim-reveal" style="animation-delay: 0.12s">
        <figure class="media-frame media-frame-glow">
          <img
            :src="siteImages.nosotrosHome"
            :alt="siteImages.nosotrosHomeAlt"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>
    </section>

    <section class="seccion-galeria-home seccion-galeria-home--showcase">
      <div class="seccion-head">
        <h2 class="anim-reveal galeria-home-titulo">
          <span class="galeria-home-titulo-glow">Trabajos de alumnos</span>
        </h2>
        <RouterLink to="/galeria" class="link-arrow anim-reveal" style="animation-delay: 0.08s">
          Ver galería completa →
        </RouterLink>
      </div>
      <p class="galeria-home-lead anim-reveal">
        Carrusel automático y pasarela en movimiento — así se ven los resultados por taller.
      </p>
      <GaleriaShowcase
        :obras="galeriaHome"
        :etiqueta-curso="etiquetaCursoGaleria"
        @select="router.push('/galeria')"
      />
    </section>

    <section class="seccion-cursos-home">
      <div class="seccion-head">
        <h2 class="anim-reveal">Cursos destacados</h2>
        <RouterLink to="/cursos" class="link-arrow anim-reveal" style="animation-delay: 0.08s">
          Ver todos los cursos →
        </RouterLink>
      </div>

      <div class="grid-cursos grid-cursos-home">
        <article
          v-for="(curso, i) in destacados"
          :key="curso.slug"
          class="card-curso card-lift anim-reveal"
          :style="{ animationDelay: `${0.06 * i}s` }"
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
          <h3>{{ curso.titulo }}</h3>
          <CursoPrecio
            v-if="curso.precio"
            :precio="curso.precio"
            size="sm"
            :show-guest-hint="false"
            :show-session-note="false"
          />
          <p>{{ curso.descripcion }}</p>
          <div class="card-actions">
            <RouterLink :to="`/cursos/${curso.slug}`" class="btn-text">Detalle</RouterLink>
            <RouterLink
              :to="{ path: '/inscripcion', query: { taller: curso.slug } }"
              class="btn-fantasma btn-fantasma-inline"
            >
              Inscribirse
            </RouterLink>
          </div>
        </article>
      </div>
    </section>

    <section class="seccion-cta-final">
      <div class="cta-final-inner anim-reveal">
        <h2>¿Listo para el siguiente disparo?</h2>
        <p>Elige tu taller y asegura plaza en minutos.</p>
        <RouterLink to="/inscripcion" class="btn-cta-large btn-glow">Ir a inscripción</RouterLink>
      </div>
    </section>

    <AppFooter />
  </div>
</template>
