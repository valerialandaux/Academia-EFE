import { ref } from 'vue'
import { apiUrl } from '../lib/api'
import { cursosCatalogo } from '../data/cursos'
import { obrasGaleria } from '../data/galeria'

const cursos = ref(cursosCatalogo)
const galeria = ref(obrasGaleria)
const nosotros = ref(null)
const cargando = ref(false)

export function useContent() {
  async function fetchCursos() {
    try {
      const res = await fetch(apiUrl('/api/public/cursos'))
      const data = await res.json().catch(() => [])
      if (res.ok && Array.isArray(data) && data.length) {
        cursos.value = data
      }
    } catch {
      // fallback a data/*
    }
    return cursos.value
  }

  async function fetchGaleria() {
    try {
      const res = await fetch(apiUrl('/api/public/galeria'))
      const data = await res.json().catch(() => [])
      // Mantener galería demo amplia hasta tener suficiente contenido en BD.
      if (res.ok && Array.isArray(data) && data.length >= 10) {
        galeria.value = data
      }
    } catch {
      // fallback a data/*
    }
    return galeria.value
  }

  async function fetchNosotros() {
    try {
      const res = await fetch(apiUrl('/api/public/nosotros'))
      const data = await res.json().catch(() => ({}))
      if (res.ok && data && typeof data === 'object') {
        nosotros.value = data
      }
    } catch {
      // fallback a hardcoded page
    }
    return nosotros.value
  }

  async function fetchAll() {
    cargando.value = true
    try {
      await Promise.all([fetchCursos(), fetchGaleria(), fetchNosotros()])
    } finally {
      cargando.value = false
    }
  }

  return {
    cursos,
    galeria,
    nosotros,
    cargando,
    fetchCursos,
    fetchGaleria,
    fetchNosotros,
    fetchAll,
  }
}

