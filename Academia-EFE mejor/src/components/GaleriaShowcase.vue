<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  obras: { type: Array, required: true },
  etiquetaCurso: { type: Function, required: true },
})

const emit = defineEmits(['select'])

const slideActivo = ref(0)
let intervalo = null

const listaCarrusel = computed(() => (props.obras.length ? props.obras : []))

const pistaMarquee1 = computed(() => [...listaCarrusel.value, ...listaCarrusel.value])
const pistaMarquee2 = computed(() => {
  const rev = [...listaCarrusel.value].reverse()
  return [...rev, ...rev]
})

function irASlide(i) {
  const n = listaCarrusel.value.length
  if (!n) return
  slideActivo.value = ((i % n) + n) % n
  reiniciarAutoplay()
}

function reiniciarAutoplay() {
  clearInterval(intervalo)
  if (listaCarrusel.value.length < 2) return
  intervalo = setInterval(() => {
    slideActivo.value = (slideActivo.value + 1) % listaCarrusel.value.length
  }, 4200)
}

function onClickObra(obra) {
  emit('select', obra)
}

onMounted(reiniciarAutoplay)
onUnmounted(() => clearInterval(intervalo))

watch(
  () => props.obras.length,
  () => {
    slideActivo.value = 0
    reiniciarAutoplay()
  },
)
</script>

<template>
  <div v-if="listaCarrusel.length" class="galeria-showcase">
    <div class="galeria-showcase-glow" aria-hidden="true" />

    <!-- Carrusel principal -->
    <div class="galeria-hero-carousel anim-reveal">
      <div
        v-for="(obra, i) in listaCarrusel"
        :key="`hero-${obra.id}`"
        class="galeria-hero-slide"
        :class="{ activo: slideActivo === i }"
      >
        <img :src="obra.src" :alt="obra.alt" loading="eager" decoding="async" />
        <div class="galeria-hero-slide-shade" aria-hidden="true" />
      </div>

      <div class="galeria-hero-caption">
        <Transition name="galeria-caption" mode="out-in">
          <div :key="listaCarrusel[slideActivo]?.id" class="galeria-hero-caption-inner">
            <span class="galeria-hero-caption-kicker">{{
              etiquetaCurso(listaCarrusel[slideActivo]?.curso)
            }}</span>
            <h2 class="galeria-hero-caption-titulo">{{ listaCarrusel[slideActivo]?.titulo }}</h2>
            <p class="galeria-hero-caption-alumno">{{ listaCarrusel[slideActivo]?.alumno }}</p>
            <button
              type="button"
              class="galeria-hero-caption-btn"
              @click="onClickObra(listaCarrusel[slideActivo])"
            >
              Ver en grande
            </button>
          </div>
        </Transition>
      </div>

      <div class="galeria-hero-dots" role="tablist" aria-label="Diapositivas">
        <button
          v-for="(obra, i) in listaCarrusel"
          :key="`dot-${obra.id}`"
          type="button"
          class="galeria-hero-dot"
          :class="{ activo: slideActivo === i }"
          :aria-label="`Ir a ${obra.titulo}`"
          :aria-selected="slideActivo === i"
          @click="irASlide(i)"
        />
      </div>

      <button
        v-if="listaCarrusel.length > 1"
        type="button"
        class="galeria-hero-nav galeria-hero-nav--prev"
        aria-label="Anterior"
        @click="irASlide(slideActivo - 1)"
      >
        ‹
      </button>
      <button
        v-if="listaCarrusel.length > 1"
        type="button"
        class="galeria-hero-nav galeria-hero-nav--next"
        aria-label="Siguiente"
        @click="irASlide(slideActivo + 1)"
      >
        ›
      </button>
    </div>

    <!-- Marquesinas -->
    <div class="galeria-marquee-wrap anim-reveal" style="animation-delay: 0.1s">
      <div class="galeria-marquee">
        <div class="galeria-marquee-track galeria-marquee-track--izq">
          <button
            v-for="(obra, i) in pistaMarquee1"
            :key="`m1-${obra.id}-${i}`"
            type="button"
            class="galeria-marquee-card"
            @click="onClickObra(obra)"
          >
            <img :src="obra.src" :alt="obra.alt" loading="lazy" decoding="async" />
            <span class="galeria-marquee-card-cap">{{ obra.titulo }}</span>
          </button>
        </div>
      </div>
      <div class="galeria-marquee">
        <div class="galeria-marquee-track galeria-marquee-track--der">
          <button
            v-for="(obra, i) in pistaMarquee2"
            :key="`m2-${obra.id}-${i}`"
            type="button"
            class="galeria-marquee-card"
            @click="onClickObra(obra)"
          >
            <img :src="obra.src" :alt="obra.alt" loading="lazy" decoding="async" />
            <span class="galeria-marquee-card-cap">{{ obra.alumno }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
