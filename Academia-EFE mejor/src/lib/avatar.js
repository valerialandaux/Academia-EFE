/** URL absoluta para avatares servidos por el API (/uploads/...). */
export function resolveAvatarUrl(avatarUrl, cacheBust = 0) {
  if (!avatarUrl) return null
  if (avatarUrl.startsWith('http')) return cacheBust ? `${avatarUrl}?t=${cacheBust}` : avatarUrl
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const url = `${base}${avatarUrl}`
  return cacheBust ? `${url}?t=${cacheBust}` : url
}

export function inicialesDe(nombre, email) {
  const n = nombre?.trim() || email || '?'
  const partes = n.split(/\s+/).filter(Boolean)
  if (partes.length >= 2) {
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
  }
  return n.slice(0, 2).toUpperCase()
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.readAsDataURL(file)
  })
}
