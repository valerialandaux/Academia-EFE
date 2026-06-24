/** Catálogo compartido: filtros y rutas */
export const cursosCatalogo = [
  {
    slug: 'basica',
    titulo: 'Fotografía Básica',
    corto: 'Domina tu cámara en manual',
    descripcion: 'Aprende a dominar tu cámara en modo manual: exposición, diafragma, ISO y composición desde cero.',
    imagen:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=82',
    imagenAlt: 'Paisaje montañoso al amanecer, ejemplo de fotografía de viaje',
    duracion: '8 semanas',
    precio: 2400,
    niveles: ['basico'],
    temas: ['paisaje'],
    detalle:
      'Ideal para quien empieza sin miedo a los modos M, A y S. Incluye salidas prácticas y revisión de imágenes en grupo.',
  },
  {
    slug: 'retrato',
    titulo: 'Retrato e Iluminación',
    corto: 'Luz natural y estudio',
    descripcion: 'Técnicas de estudio y luz natural para retratos expresivos y profesionales.',
    imagen:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=82',
    imagenAlt: 'Retrato artístico con luz suave',
    duracion: '10 semanas',
    precio: 3200,
    niveles: ['basico', 'avanzado'],
    temas: ['retrato'],
    detalle:
      'Trabajarás con softboxes, reflectores y hora dorada. Montajes sencillos en casa y protocolo en estudio.',
  },
  {
    slug: 'edicion',
    titulo: 'Postproducción',
    corto: 'Lightroom y Photoshop',
    descripcion: 'Revelado digital con Lightroom y Photoshop: color, máscaras y flujo de trabajo.',
    imagen:
      'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1000&q=82',
    imagenAlt: 'Ordenador mostrando software de edición de fotografía',
    duracion: '6 semanas',
    precio: 1800,
    niveles: ['avanzado'],
    temas: ['edicion'],
    detalle:
      'De la importación al export para web e impresión. Perfiles de color básicos y atajos para ganar tiempo.',
  },
]

export function cursoPorSlug(slug) {
  return cursosCatalogo.find((c) => c.slug === slug)
}
