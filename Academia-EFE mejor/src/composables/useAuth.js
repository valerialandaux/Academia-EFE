import { ref, computed } from 'vue'
import {
  apiUrl,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  authHeaders,
} from '../lib/api'
import { fileToDataUrl } from '../lib/avatar.js'

function readStoredUser() {
  const u = getStoredUser()
  const token = getStoredToken()
  if (!token) return null
  if (u?.role === 'USER') return u
  return null
}

const user = ref(readStoredUser())
const perfil = ref(null)
const cargando = ref(false)
/** Cambia al subir/borrar foto para refrescar la URL en el navegador */
const avatarVersion = ref(0)

function syncUserFromApi(data) {
  user.value = {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    telefono: data.telefono,
    avatarUrl: data.avatarUrl ?? null,
    role: data.role,
  }
  setStoredUser(user.value)
  perfil.value = data
}

export function useAuth() {
  const isLoggedIn = computed(
    () => !!getStoredToken() && user.value?.role === 'USER',
  )

  const descuento = computed(() => perfil.value?.descuento ?? null)
  const inscripcionesActivas = computed(() => perfil.value?.inscripcionesActivas ?? 0)

  async function fetchMe() {
    const token = getStoredToken()
    if (!token) {
      user.value = null
      perfil.value = null
      return null
    }
    cargando.value = true
    try {
      const res = await fetch(apiUrl('/api/me'), { headers: authHeaders() })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 401) logout()
        return null
      }
      if (data.role !== 'USER') {
        logout()
        return null
      }
      syncUserFromApi(data)
      return data
    } catch {
      return null
    } finally {
      cargando.value = false
    }
  }

  function applySession({ token, user: u }) {
    setStoredToken(token)
    user.value = u
    setStoredUser(u)
  }

  async function login(email, password) {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo iniciar sesión')
    }
    if (data.user?.role !== 'USER') {
      throw new Error('Usa el acceso de administración para cuentas de staff')
    }
    applySession(data)
    await fetchMe()
    return data
  }

  async function register({ nombre, email, password, telefono }) {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password, telefono }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo crear la cuenta')
    }
    applySession(data)
    await fetchMe()
    return data
  }

  async function updatePerfil({ nombre, telefono }) {
    const res = await fetch(apiUrl('/api/me'), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ nombre, telefono }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo actualizar el perfil')
    }
    syncUserFromApi(data)
    return data
  }

  async function uploadAvatar(file) {
    if (!file) throw new Error('Selecciona una imagen')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    const tipo = file.type || ''
    const okTipo =
      allowed.includes(tipo) ||
      (tipo === 'image/jpg' && file.name?.toLowerCase().endsWith('.jpg'))
    if (!okTipo) {
      throw new Error('Solo JPG, PNG o WebP')
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede superar 2 MB')
    }
    const image = await fileToDataUrl(file)
    let res
    try {
      res = await fetch(apiUrl('/api/me/avatar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ image }),
      })
    } catch {
      throw new Error(
        'No hay conexión con el servidor. Ejecuta npm run dev:full o npm run server en la carpeta server.',
      )
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || `No se pudo guardar la foto (${res.status})`)
    }
    avatarVersion.value = Date.now()
    syncUserFromApi(data)
    return data
  }

  async function removeAvatar() {
    const res = await fetch(apiUrl('/api/me/avatar'), {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'No se pudo quitar la foto')
    }
    avatarVersion.value = Date.now()
    syncUserFromApi(data)
    return data
  }

  function logout() {
    setStoredToken(null)
    setStoredUser(null)
    user.value = null
    perfil.value = null
    avatarVersion.value = 0
  }

  /** fields: { nombre, correo, telefono } refs de Vue */
  function rellenarFormulario(fields) {
    if (!user.value) return
    if (user.value.nombre && fields.nombre) fields.nombre.value = user.value.nombre
    if (user.value.email && fields.correo) fields.correo.value = user.value.email
    if (user.value.telefono && fields.telefono) fields.telefono.value = user.value.telefono
  }

  return {
    user,
    perfil,
    cargando,
    isLoggedIn,
    descuento,
    inscripcionesActivas,
    fetchMe,
    login,
    register,
    logout,
    updatePerfil,
    uploadAvatar,
    removeAvatar,
    avatarVersion,
    rellenarFormulario,
  }
}
