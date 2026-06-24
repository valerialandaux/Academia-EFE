export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const telefonoRegex = /^\+?[0-9\s-]{7,15}$/
export const slugRegex = /^[a-z0-9-]{2,40}$/

export function validarEmail(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'El correo es obligatorio.'
  if (!emailRegex.test(v)) return 'Ingresa un correo válido.'
  return ''
}

export function validarNombre(valor, min = 3) {
  const v = String(valor || '').trim()
  if (v.length < min) return `Ingresa al menos ${min} caracteres.`
  return ''
}

export function validarTelefono(valor, obligatorio = true) {
  const v = String(valor || '').trim()
  if (!v) return obligatorio ? 'El teléfono es obligatorio.' : ''
  if (!telefonoRegex.test(v)) {
    return 'Usa solo números, espacios, guiones y + (7 a 15 dígitos).'
  }
  return ''
}

export function validarPassword(valor, min = 6) {
  if (String(valor || '').length < min) {
    return `La contraseña debe tener al menos ${min} caracteres.`
  }
  return ''
}

export function validarExpiracionTarjeta(valor) {
  const v = String(valor || '').trim()
  if (!/^\d{2}\/\d{2}$/.test(v)) return 'Usa formato MM/AA (ej: 12/27).'
  const [mm, aa] = v.split('/').map(Number)
  if (mm < 1 || mm > 12) return 'El mes debe estar entre 01 y 12.'
  const ahora = new Date()
  const anioActual = ahora.getFullYear() % 100
  const mesActual = ahora.getMonth() + 1
  if (aa < anioActual || (aa === anioActual && mm < mesActual)) {
    return 'La tarjeta está vencida.'
  }
  return ''
}

export function validarSlug(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'El slug es obligatorio.'
  if (!slugRegex.test(v)) {
    return 'Usa minúsculas, números y guiones (2–40 caracteres).'
  }
  return ''
}

export function validarUrlOpcional(valor) {
  const v = String(valor || '').trim()
  if (!v) return ''
  try {
    const url = new URL(v)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'La URL debe empezar con http:// o https://'
    }
  } catch {
    return 'Ingresa una URL válida.'
  }
  return ''
}

export function validarUrlRequerida(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'La URL es obligatoria.'
  return validarUrlOpcional(v)
}

export function validarSlugOpcional(valor) {
  const v = String(valor || '').trim()
  if (!v) return ''
  return validarSlug(v)
}

export function validarAnchoGaleria(valor) {
  const v = String(valor || '').trim().toLowerCase()
  if (!v) return ''
  if (!['alto', 'ancho'].includes(v)) return 'Usa "alto" o "ancho".'
  return ''
}

export function validarTextoRequerido(valor, etiqueta = 'Este campo', min = 2) {
  const v = String(valor || '').trim()
  if (v.length < min) return `${etiqueta} debe tener al menos ${min} caracteres.`
  return ''
}

const PALABRAS_SLUG_CURSO = [
  'foto',
  'basica',
  'basico',
  'retrato',
  'edicion',
  'paisaje',
  'ilumin',
  'post',
  'produccion',
  'curso',
  'taller',
  'camara',
  'digital',
  'estudio',
  'lightroom',
  'photoshop',
]

const NIVELES_PERMITIDOS = ['basico', 'avanzado']
const TEMAS_PERMITIDOS = ['retrato', 'edicion', 'paisaje']
const SLUGS_GALERIA_CURSO = ['basica', 'retrato', 'edicion']

const diasSemana =
  /lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|lun|mar|mi[eé]|jue|vie|s[aá]b|dom/i

export function validarSlugCurso(valor) {
  const base = validarSlug(valor)
  if (base) return base
  const v = String(valor || '').trim().toLowerCase()
  const relacionado = PALABRAS_SLUG_CURSO.some((p) => v.includes(p))
  if (!relacionado) {
    return 'El slug debe relacionarse con fotografía (ej: basica, retrato, edicion-foto).'
  }
  return ''
}

export function validarDuracionCurso(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'La duración es obligatoria.'
  if (!/^([1-9]|10)\s+semanas?$/i.test(v)) {
    return 'Usa el formato "8 semanas" (número del 1 al 10 + la palabra semanas).'
  }
  return ''
}

export function validarTituloCurso(valor) {
  const v = String(valor || '').trim()
  if (v.length < 5) return 'El título debe tener al menos 5 caracteres.'
  const lower = v.toLowerCase()
  const temasFoto = [
    'foto',
    'fotograf',
    'cámara',
    'camara',
    'retrato',
    'edición',
    'edicion',
    'ilumin',
    'paisaje',
    'taller',
    'curso',
    'post',
    'digital',
    'lightroom',
    'photoshop',
  ]
  if (!temasFoto.some((t) => lower.includes(t))) {
    return 'El título debe mencionar el tema del taller (fotografía, retrato, edición, etc.).'
  }
  return ''
}

export function validarCortoCurso(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'El resumen corto es obligatorio.'
  if (v.length < 8 || v.length > 120) {
    return 'El resumen corto debe tener entre 8 y 120 caracteres.'
  }
  return ''
}

export function validarDetalleCurso(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'El detalle es obligatorio.'
  if (v.length < 20) return 'El detalle debe tener al menos 20 caracteres.'
  return ''
}

export function validarImagenAltCurso(valor, imagenUrl) {
  const img = String(imagenUrl || '').trim()
  const v = String(valor || '').trim()
  if (img && v.length < 10) {
    return 'El texto alternativo debe describir la imagen (mín. 10 caracteres).'
  }
  if (!img && !v) return ''
  if (v && v.length < 10) return 'El texto alternativo debe tener al menos 10 caracteres.'
  return ''
}

export function validarPrecioCurso(valor) {
  if (valor === '' || valor === null || valor === undefined) {
    return 'El precio es obligatorio.'
  }
  const n = Number(valor)
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 100 || n > 50000) {
    return 'El precio debe ser un entero entre 100 y 50.000 Bs.'
  }
  return ''
}

export function validarNivelesCSV(valor) {
  const items = String(valor || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
  if (!items.length) return 'Indica al menos un nivel (basico o avanzado).'
  const invalidos = items.filter((n) => !NIVELES_PERMITIDOS.includes(n))
  if (invalidos.length) {
    return `Niveles no válidos: ${invalidos.join(', ')}. Solo: basico, avanzado.`
  }
  return ''
}

export function validarTemasCSV(valor) {
  const items = String(valor || '')
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
  if (!items.length) return 'Indica al menos un tema (retrato, edicion o paisaje).'
  const invalidos = items.filter((t) => !TEMAS_PERMITIDOS.includes(t))
  if (invalidos.length) {
    return `Temas no válidos: ${invalidos.join(', ')}. Solo: retrato, edicion, paisaje.`
  }
  return ''
}

export function validarSedeCurso(valor) {
  const v = String(valor || '').trim()
  if (v.length < 10) return 'La sede debe tener al menos 10 caracteres.'
  const lower = v.toLowerCase()
  if (!/(sede|aula|estudio|laboratorio|academia|planta|efe)/i.test(lower)) {
    return 'Menciona sede, aula, estudio o laboratorio de la academia.'
  }
  return ''
}

export function validarHorarioCurso(valor) {
  const v = String(valor || '').trim()
  if (v.length < 10) return 'El horario debe tener al menos 10 caracteres.'
  if (!diasSemana.test(v)) {
    return 'Incluye los días (ej: Lunes y miércoles).'
  }
  if (!/\d{1,2}:\d{2}/.test(v)) {
    return 'Incluye la hora en formato HH:MM (ej: 19:00 a 21:00).'
  }
  return ''
}

export function validarMaterialesCurso(valor) {
  const v = String(valor || '').trim()
  if (v.length < 10) return 'Indica qué debe llevar el alumno (mín. 10 caracteres).'
  return ''
}

export function validarNotaPresencialCurso(valor) {
  const v = String(valor || '').trim()
  if (v.length < 10) return 'La nota presencial debe tener al menos 10 caracteres.'
  return ''
}

export function validarSlugCursoGaleria(valor) {
  const v = String(valor || '').trim().toLowerCase()
  if (!v) return 'El curso es obligatorio (basica, retrato o edicion).'
  if (!SLUGS_GALERIA_CURSO.includes(v)) {
    return 'Usa un slug de curso válido: basica, retrato o edicion.'
  }
  return ''
}

export function validarTituloGaleria(valor) {
  const v = String(valor || '').trim()
  if (v.length < 3) return 'El título debe tener al menos 3 caracteres.'
  if (v.length > 80) return 'El título no puede superar 80 caracteres.'
  if (!/[a-záéíóúñ]/i.test(v)) return 'El título debe ser descriptivo (letras).'
  return ''
}

export function validarAltGaleria(valor) {
  const v = String(valor || '').trim()
  if (v.length < 10) return 'Describe la foto para accesibilidad (mín. 10 caracteres).'
  if (v.length > 200) return 'El texto alternativo no puede superar 200 caracteres.'
  return ''
}

export function validarAlumnoGaleria(valor) {
  const v = String(valor || '').trim()
  if (!v) return ''
  if (v.length < 3) return 'El nombre del alumno debe tener al menos 3 caracteres.'
  if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ.\s'-]+$/.test(v)) {
    return 'Usa solo letras, espacios y punto (ej: María G.).'
  }
  return ''
}

export function validarNotaGaleria(valor) {
  const v = String(valor || '').trim()
  if (!v) return ''
  if (v.length < 8) return 'La nota debe tener al menos 8 caracteres si la usas.'
  return ''
}

export function validarTituloNosotros(valor) {
  const v = String(valor || '').trim()
  if (v.length < 5) return 'El título debe tener al menos 5 caracteres.'
  if (v.length > 100) return 'El título no puede superar 100 caracteres.'
  return ''
}

export function validarLeadNosotros(valor) {
  const v = String(valor || '').trim()
  if (v.length < 20) return 'El texto corto debe tener al menos 20 caracteres.'
  if (v.length > 300) return 'El texto corto no puede superar 300 caracteres.'
  return ''
}

export function validarBodyNosotros(valor) {
  const v = String(valor || '').trim()
  if (v.length < 50) return 'El cuerpo debe tener al menos 50 caracteres.'
  if (v.length > 8000) return 'El cuerpo es demasiado largo.'
  return ''
}
