/** Descuento estimado según inscripciones previas del alumno (excluye denegadas). */
export function descuentoPorInscripciones(previas) {
  const n = Number(previas) || 0
  if (n >= 2) {
    return { porcentaje: 15, etiqueta: '15% — alumno recurrente (3.º curso o más)' }
  }
  if (n === 1) {
    return { porcentaje: 10, etiqueta: '10% — segundo curso' }
  }
  return { porcentaje: 5, etiqueta: '5% — al iniciar sesión con tu cuenta de alumno' }
}
