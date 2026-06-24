/** Formatea un importe en bolivianos (Bs). */
export function formatPrecio(monto) {
  const n = Number(monto)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
}

/** Precio final tras aplicar un porcentaje de descuento. */
export function precioConDescuento(precioBase, porcentaje) {
  const base = Number(precioBase) || 0
  const pct = Math.max(0, Math.min(100, Number(porcentaje) || 0))
  return Math.round(base * (1 - pct / 100) * 100) / 100
}

export function ahorroDescuento(precioBase, porcentaje) {
  const base = Number(precioBase) || 0
  return Math.round((base - precioConDescuento(base, porcentaje)) * 100) / 100
}
