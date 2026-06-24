import { cursosCatalogo } from './cursos'

/** Filtros alineados con los talleres del catálogo */
export const filtrosGaleria = [
  { id: 'todos', label: 'Todos' },
  ...cursosCatalogo.map((c) => ({
    id: c.slug,
    label: c.titulo,
    slug: c.slug,
  })),
]

/**
 * Trabajos de demostración (sustituir por fotos reales de alumnos en /public/images/galeria/).
 * curso: basica | retrato | edicion
 */
export const obrasGaleria = [
  {
    id: 1,
    curso: 'basica',
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=82',
    alt: 'Paisaje montañoso con niebla al amanecer',
    titulo: 'Horizonte en valle',
    alumno: 'María G.',
    nota: 'Exposición manual y regla de los tercios',
    ancho: 'alto',
  },
  {
    id: 2,
    curso: 'basica',
    src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=82',
    alt: 'Campo verde con luz lateral',
    titulo: 'Luz de tarde',
    alumno: 'Carlos R.',
    nota: 'Taller de paisaje — salida práctica',
  },
  {
    id: 3,
    curso: 'basica',
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=82',
    alt: 'Bosque con rayos de sol',
    titulo: 'Claroscuro natural',
    alumno: 'Ana V.',
    nota: 'ISO y diafragma en exteriores',
    ancho: 'ancho',
  },
  {
    id: 4,
    curso: 'basica',
    src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=82',
    alt: 'Montañas nevadas bajo cielo estrellado',
    titulo: 'Noche en altura',
    alumno: 'Diego M.',
    nota: 'Práctica de larga exposición',
  },
  {
    id: 5,
    curso: 'retrato',
    src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=82',
    alt: 'Retrato de mujer con luz suave lateral',
    titulo: 'Mirada en estudio',
    alumno: 'Lucía P.',
    nota: 'Softbox principal + relleno',
    ancho: 'alto',
  },
  {
    id: 6,
    curso: 'retrato',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=82',
    alt: 'Retrato masculino con fondo neutro',
    titulo: 'Perfil documental',
    alumno: 'Jorge T.',
    nota: 'Esquema de tres puntos',
  },
  {
    id: 7,
    curso: 'retrato',
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82',
    alt: 'Retrato con luz natural de ventana',
    titulo: 'Luz de ventana',
    alumno: 'Sofía L.',
    nota: 'Retrato con luz natural',
    ancho: 'ancho',
  },
  {
    id: 8,
    curso: 'retrato',
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1200&q=82',
    alt: 'Primer plano con bokeh cálido',
    titulo: 'Bokeh y separación',
    alumno: 'Elena K.',
    nota: 'Profundidad de campo en retrato',
  },
  {
    id: 9,
    curso: 'retrato',
    src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=82',
    alt: 'Retrato sonriente en exteriores',
    titulo: 'Hora dorada',
    alumno: 'Paula N.',
    nota: 'Sesión en exteriores al atardecer',
  },
  {
    id: 10,
    curso: 'edicion',
    src: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=82',
    alt: 'Pantalla con revelado de fotografía',
    titulo: 'Antes / después',
    alumno: 'Miguel A.',
    nota: 'Flujo Lightroom — curva y split toning',
    ancho: 'alto',
  },
  {
    id: 11,
    curso: 'edicion',
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=82',
    alt: 'Composición abstracta con colores intensos',
    titulo: 'Paleta editorial',
    alumno: 'Valeria S.',
    nota: 'Gradación de color en Photoshop',
    ancho: 'ancho',
  },
  {
    id: 12,
    curso: 'edicion',
    src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=82',
    alt: 'Detalle urbano en blanco y negro',
    titulo: 'Blanco y negro',
    alumno: 'Andrés F.',
    nota: 'Conversión y contraste selectivo',
  },
  {
    id: 13,
    curso: 'edicion',
    src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=82',
    alt: 'Fotógrafo revisando imágenes en cámara',
    titulo: 'Selección y export',
    alumno: 'Camila D.',
    nota: 'Perfiles de color para impresión',
  },
  {
    id: 14,
    curso: 'basica',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=82',
    alt: 'Camino entre árboles con luz filtrada',
    titulo: 'Sendero interior',
    alumno: 'Roberto H.',
    nota: 'Composición en profundidad',
    ancho: 'ancho',
  },
  {
    id: 15,
    curso: 'edicion',
    src: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=82',
    alt: 'Retrato con tonos cálidos editados',
    titulo: 'Tono cálido final',
    alumno: 'Laura B.',
    nota: 'Máscaras de luminosidad',
  },
]

export function etiquetaCursoGaleria(slug) {
  return filtrosGaleria.find((f) => f.id === slug)?.label || slug
}
