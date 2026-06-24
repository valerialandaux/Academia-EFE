import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, requireAdmin } from './middleware/auth.js'
import { optionalAuth } from './middleware/optionalAuth.js'
import { descuentoPorInscripciones } from './lib/descuentos.js'
import {
  AVATARS_DIR,
  avatarPublicPath,
  deleteUserAvatars,
  ensureAvatarsDir,
  extForMime,
} from './lib/avatarFiles.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

dotenv.config()

const prisma = new PrismaClient()
const app = express()
const PORT = Number(process.env.PORT) || 3001
const TALLERES = ['basica', 'retrato', 'edicion']
const ESTADOS = ['PENDIENTE', 'APROBADA', 'DENEGADA']

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
)
app.use(express.json({ limit: '3mb' }))
ensureAvatarsDir()
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no configurado')
  return jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: '7d' })
}

function userPayload(user) {
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    telefono: user.telefono,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
  }
}

async function perfilAlumno(userId) {
  const inscripcionesActivas = await contarInscripcionesActivas(userId)
  return {
    inscripcionesActivas,
    descuento: descuentoPorInscripciones(inscripcionesActivas),
  }
}

async function contarInscripcionesActivas(userId) {
  return prisma.inscripcion.count({
    where: {
      userId,
      estado: { in: ['PENDIENTE', 'APROBADA'] },
    },
  })
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'academia-efe-api' })
})

function parseJsonArray(raw) {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

const SLUG_REGEX = /^[a-z0-9-]{2,40}$/
const SLUG_CURSO_PALABRAS = [
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
const DIAS_SEMANA =
  /lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|lun|mar|mi[eé]|jue|vie|s[aá]b|dom/i

function validarUrlHttp(valor) {
  const v = String(valor || '').trim()
  if (!v) return 'La URL de imagen es obligatoria.'
  try {
    const url = new URL(v)
    if (!['http:', 'https:'].includes(url.protocol)) return 'La URL debe empezar con http:// o https://'
  } catch {
    return 'Ingresa una URL de imagen válida.'
  }
  return ''
}

function validarSlugCursoServer(slug) {
  const v = String(slug || '').trim()
  if (!v) return 'El slug es obligatorio.'
  if (!SLUG_REGEX.test(v)) return 'Slug inválido (minúsculas, números y guiones, 2–40 caracteres).'
  if (!SLUG_CURSO_PALABRAS.some((p) => v.includes(p))) {
    return 'El slug debe relacionarse con fotografía (ej: basica, retrato, edicion-foto).'
  }
  return ''
}

function validarCursoCampos(body, { parcial = false } = {}) {
  const slug = typeof body.slug === 'string' ? body.slug.trim() : parcial ? undefined : ''
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : parcial ? undefined : ''
  const corto = typeof body.corto === 'string' ? body.corto.trim() : parcial ? undefined : ''
  const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : parcial ? undefined : ''
  const detalle = typeof body.detalle === 'string' ? body.detalle.trim() : parcial ? undefined : ''
  const imagen = typeof body.imagen === 'string' ? body.imagen.trim() : parcial ? undefined : ''
  const imagenAlt = typeof body.imagenAlt === 'string' ? body.imagenAlt.trim() : parcial ? undefined : ''
  const duracion = typeof body.duracion === 'string' ? body.duracion.trim() : parcial ? undefined : ''
  const sede = typeof body.sede === 'string' ? body.sede.trim() : parcial ? undefined : ''
  const horario = typeof body.horario === 'string' ? body.horario.trim() : parcial ? undefined : ''
  const materiales = typeof body.materiales === 'string' ? body.materiales.trim() : parcial ? undefined : ''
  const notaPresencial =
    typeof body.notaPresencial === 'string' ? body.notaPresencial.trim() : parcial ? undefined : ''
  const niveles = Array.isArray(body.niveles) ? body.niveles.map((n) => String(n).trim().toLowerCase()).filter(Boolean) : parcial ? null : []
  const temas = Array.isArray(body.temas) ? body.temas.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : parcial ? null : []
  const precio = body.precio

  if (slug !== undefined) {
    const err = validarSlugCursoServer(slug)
    if (err) return err
  }
  if (titulo !== undefined) {
    if (titulo.length < 5) return 'El título debe tener al menos 5 caracteres.'
    const lower = titulo.toLowerCase()
    const temasFoto = ['foto', 'fotograf', 'camara', 'retrato', 'edicion', 'ilumin', 'paisaje', 'taller', 'curso', 'post', 'digital', 'lightroom', 'photoshop']
    if (!temasFoto.some((t) => lower.includes(t))) {
      return 'El título debe mencionar el tema del taller.'
    }
  }
  if (corto !== undefined) {
    if (corto.length < 8 || corto.length > 120) return 'El resumen corto debe tener entre 8 y 120 caracteres.'
  }
  if (descripcion !== undefined && descripcion.length < 10) return 'La descripción debe tener al menos 10 caracteres.'
  if (detalle !== undefined && detalle.length < 20) return 'El detalle debe tener al menos 20 caracteres.'
  if (imagen !== undefined) {
    const err = validarUrlHttp(imagen)
    if (err) return err
  }
  if (imagenAlt !== undefined && imagenAlt.length < 10) {
    return 'El texto alternativo de la imagen debe tener al menos 10 caracteres.'
  }
  if (duracion !== undefined) {
    if (!/^([1-9]|10)\s+semanas?$/i.test(duracion)) {
      return 'Duración inválida. Usa formato "8 semanas" (1–10 + semanas).'
    }
  }
  if (sede !== undefined) {
    if (sede.length < 10) return 'La sede debe tener al menos 10 caracteres.'
    if (!/(sede|aula|estudio|laboratorio|academia|planta|efe)/i.test(sede)) {
      return 'La sede debe mencionar sede, aula, estudio o laboratorio.'
    }
  }
  if (horario !== undefined) {
    if (horario.length < 10) return 'El horario debe tener al menos 10 caracteres.'
    if (!DIAS_SEMANA.test(horario)) return 'El horario debe incluir los días de clase.'
    if (!/\d{1,2}:\d{2}/.test(horario)) return 'El horario debe incluir hora en formato HH:MM.'
  }
  if (materiales !== undefined && materiales.length < 10) {
    return 'Indica qué debe llevar el alumno (mín. 10 caracteres).'
  }
  if (notaPresencial !== undefined && notaPresencial.length < 10) {
    return 'La nota presencial debe tener al menos 10 caracteres.'
  }
  if (niveles !== null) {
    if (!niveles.length) return 'Indica al menos un nivel (basico o avanzado).'
    const invalidos = niveles.filter((n) => !NIVELES_PERMITIDOS.includes(n))
    if (invalidos.length) return `Niveles no válidos: ${invalidos.join(', ')}.`
  }
  if (temas !== null) {
    if (!temas.length) return 'Indica al menos un tema (retrato, edicion o paisaje).'
    const invalidos = temas.filter((t) => !TEMAS_PERMITIDOS.includes(t))
    if (invalidos.length) return `Temas no válidos: ${invalidos.join(', ')}.`
  }
  if (precio !== undefined && precio !== null) {
    const n = Number(precio)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 100 || n > 50000) {
      return 'El precio debe ser un entero entre 100 y 50.000 Bs.'
    }
  } else if (!parcial && (precio === null || precio === undefined || precio === '')) {
    return 'El precio es obligatorio.'
  }
  return ''
}

function validarGaleriaCampos(body, { parcial = false } = {}) {
  const src = typeof body.src === 'string' ? body.src.trim() : parcial ? undefined : ''
  const alt = typeof body.alt === 'string' ? body.alt.trim() : parcial ? undefined : ''
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : parcial ? undefined : ''
  const curso = typeof body.curso === 'string' ? body.curso.trim().toLowerCase() : parcial ? undefined : ''
  const alumno = typeof body.alumno === 'string' ? body.alumno.trim() : ''
  const nota = typeof body.nota === 'string' ? body.nota.trim() : ''
  const ancho = typeof body.ancho === 'string' ? body.ancho.trim().toLowerCase() : ''

  if (src !== undefined) {
    const err = validarUrlHttp(src)
    if (err) return err.replace('imagen', 'foto')
  }
  if (alt !== undefined) {
    if (alt.length < 10) return 'El texto alternativo debe tener al menos 10 caracteres.'
    if (alt.length > 200) return 'El texto alternativo es demasiado largo.'
  }
  if (titulo !== undefined) {
    if (titulo.length < 3) return 'El título debe tener al menos 3 caracteres.'
    if (titulo.length > 80) return 'El título no puede superar 80 caracteres.'
  }
  if (curso !== undefined) {
    if (!curso) return 'El curso es obligatorio (basica, retrato o edicion).'
    if (!TALLERES.includes(curso)) return 'Curso inválido. Usa: basica, retrato o edicion.'
  }
  if (alumno && alumno.length < 3) return 'El nombre del alumno debe tener al menos 3 caracteres.'
  if (nota && nota.length < 8) return 'La nota debe tener al menos 8 caracteres.'
  if (ancho && !['alto', 'ancho'].includes(ancho)) return 'Layout inválido. Usa "alto" o "ancho".'
  return ''
}

function validarNosotrosCampos(body) {
  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
  const lead = typeof body.lead === 'string' ? body.lead.trim() : ''
  const bodyText = typeof body.body === 'string' ? body.body.trim() : ''
  if (titulo.length < 5) return 'El título debe tener al menos 5 caracteres.'
  if (titulo.length > 100) return 'El título no puede superar 100 caracteres.'
  if (lead.length < 20) return 'El texto corto debe tener al menos 20 caracteres.'
  if (lead.length > 300) return 'El texto corto no puede superar 300 caracteres.'
  if (bodyText.length < 50) return 'El cuerpo debe tener al menos 50 caracteres.'
  if (bodyText.length > 8000) return 'El cuerpo es demasiado largo.'
  return ''
}

function cursoPayload(row) {
  return {
    id: row.id,
    slug: row.slug,
    titulo: row.titulo,
    corto: row.corto ?? null,
    descripcion: row.descripcion,
    detalle: row.detalle ?? null,
    imagen: row.imagen ?? null,
    imagenAlt: row.imagenAlt ?? null,
    duracion: row.duracion ?? null,
    sede: row.sede ?? null,
    horario: row.horario ?? null,
    materiales: row.materiales ?? null,
    notaPresencial: row.notaPresencial ?? null,
    precio: row.precio ?? null,
    niveles: parseJsonArray(row.niveles),
    temas: parseJsonArray(row.temas),
    activo: row.activo,
    orden: row.orden,
  }
}

function galeriaPayload(row) {
  return {
    id: row.id,
    curso: row.cursoSlug ?? null,
    src: row.src,
    alt: row.alt,
    titulo: row.titulo,
    alumno: row.alumno ?? null,
    nota: row.nota ?? null,
    ancho: row.ancho ?? null,
    activo: row.activo,
    orden: row.orden,
  }
}

/** Contenido público: cursos (activos) */
app.get('/api/public/cursos', async (_req, res) => {
  try {
    const rows = await prisma.curso.findMany({
      where: { activo: true },
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
    })
    res.json(rows.map(cursoPayload))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudieron listar los cursos' })
  }
})

/** Contenido público: galería (activa) */
app.get('/api/public/galeria', async (_req, res) => {
  try {
    const rows = await prisma.galeriaItem.findMany({
      where: { activo: true },
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
    })
    res.json(rows.map(galeriaPayload))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo cargar la galería' })
  }
})

/** Contenido público: página nosotros */
app.get('/api/public/nosotros', async (_req, res) => {
  try {
    const row = await prisma.paginaContenido.findUnique({
      where: { key: 'nosotros' },
    })
    res.json({
      key: 'nosotros',
      titulo: row?.titulo ?? 'Historia y equipo',
      lead: row?.lead ?? 'Una escuela pensada para quien quiere aprender haciendo, con criterio y oficio.',
      body: row?.body ?? '',
      activo: row?.activo ?? true,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo cargar el contenido' })
  }
})

/** Registro de alumno */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre, telefono } = req.body || {}
    if (!email?.trim() || !password || !nombre?.trim()) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' })
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    }
    const emailNorm = email.trim().toLowerCase()
    const exists = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (exists) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })
    }
    const user = await prisma.user.create({
      data: {
        email: emailNorm,
        password: await bcrypt.hash(password, 10),
        nombre: nombre.trim(),
        telefono: telefono?.trim() || null,
        role: 'USER',
      },
    })
    const token = signToken(user)
    res.status(201).json({
      token,
      user: userPayload(user),
    })
  } catch (e) {
    console.error(e)
    if (e.message === 'JWT_SECRET no configurado') {
      return res.status(500).json({ error: e.message })
    }
    res.status(500).json({ error: 'No se pudo crear la cuenta' })
  }
})

/** Login: devuelve JWT (role ADMIN o USER) */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' })
    }
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }
    const token = signToken(user)
    res.json({
      token,
      user: userPayload(user),
    })
  } catch (e) {
    console.error(e)
    if (e.message === 'JWT_SECRET no configurado') {
      return res.status(500).json({ error: e.message })
    }
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

/** Perfil del usuario autenticado + resumen de descuentos */
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        telefono: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    })
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    const extra = await perfilAlumno(user.id)
    res.json({ ...user, ...extra })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Error al obtener perfil' })
  }
})

/** Actualizar nombre y teléfono del perfil */
app.patch('/api/me', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'USER') {
      return res.status(403).json({ error: 'Solo alumnos pueden editar este perfil aquí' })
    }
    const { nombre, telefono } = req.body || {}
    if (nombre !== undefined) {
      const n = typeof nombre === 'string' ? nombre.trim() : ''
      if (n.length < 3) {
        return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' })
      }
    }
    if (telefono !== undefined && telefono?.trim()) {
      if (!/^\+?[0-9\s-]{7,15}$/.test(telefono.trim())) {
        return res.status(400).json({ error: 'Teléfono inválido' })
      }
    }
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(nombre !== undefined ? { nombre: nombre?.trim() || null } : {}),
        ...(telefono !== undefined ? { telefono: telefono?.trim() || null } : {}),
      },
    })
    const extra = await perfilAlumno(user.id)
    res.json({ ...userPayload(user), ...extra })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo actualizar el perfil' })
  }
})

/** Subir foto de perfil (base64 data URL) */
app.post('/api/me/avatar', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'USER') {
      return res.status(403).json({ error: 'Solo alumnos pueden cambiar la foto de perfil' })
    }
    const { image } = req.body || {}
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Falta la imagen' })
    }
    const match = image.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/i)
    if (!match) {
      return res.status(400).json({ error: 'Formato inválido. Usa JPG, PNG o WebP.' })
    }
    const mime = match[1].toLowerCase()
    const ext = extForMime(mime)
    if (!ext) {
      return res.status(400).json({ error: 'Formato no permitido' })
    }
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'La imagen no puede superar 2 MB' })
    }
    deleteUserAvatars(req.user.id)
    const filename = `user-${req.user.id}${ext}`
    fs.writeFileSync(path.join(AVATARS_DIR, filename), buffer)
    const avatarUrl = avatarPublicPath(req.user.id, ext)
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    })
    const extra = await perfilAlumno(user.id)
    res.json({ ok: true, avatarUrl, ...userPayload(user), ...extra })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo guardar la foto' })
  }
})

/** Quitar foto de perfil */
app.delete('/api/me/avatar', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'USER') {
      return res.status(403).json({ error: 'Solo alumnos' })
    }
    deleteUserAvatars(req.user.id)
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: null },
    })
    const extra = await perfilAlumno(user.id)
    res.json({ ok: true, ...userPayload(user), ...extra })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo eliminar la foto' })
  }
})

/** Inscripciones del alumno autenticado */
app.get('/api/inscripciones/mias', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'USER') {
      return res.status(403).json({ error: 'Solo para cuentas de alumno' })
    }
    const alumno = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true },
    })
    const rows = await prisma.inscripcion.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          ...(alumno?.email
            ? [{ correo: alumno.email.toLowerCase(), userId: null }]
            : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudieron listar tus inscripciones' })
  }
})

/** Alumno envía datos de pago de una inscripción APROBADA */
app.post('/api/inscripciones/:id/pago', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'USER') {
      return res.status(403).json({ error: 'Solo para cuentas de alumno' })
    }
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido' })
    }

    const row = await prisma.inscripcion.findFirst({
      where: { id, userId: req.user.id },
    })
    if (!row) return res.status(404).json({ error: 'Inscripción no encontrada' })
    if (row.estado !== 'APROBADA') {
      return res.status(400).json({ error: 'Solo puedes pagar inscripciones aprobadas' })
    }

    const metodo = String(req.body?.metodo || '').toUpperCase()
    if (!['TARJETA', 'QR'].includes(metodo)) {
      return res.status(400).json({ error: 'Método inválido. Usa TARJETA o QR' })
    }

    let data = {
      pagoEstado: 'ENVIADO',
      pagoMetodo: metodo,
      pagoEnviadoAt: new Date(),
      pagoComentarioAdmin: null,
      pagoRevisadoAt: null,
    }

    if (metodo === 'TARJETA') {
      const titular = String(req.body?.titular || '').trim()
      const numero = String(req.body?.numero || '').replace(/\D/g, '')
      const expiracion = String(req.body?.expiracion || '').trim()
      const cvv = String(req.body?.cvv || '').replace(/\D/g, '')
      if (titular.length < 4) return res.status(400).json({ error: 'Nombre del titular inválido' })
      if (numero.length < 12 || numero.length > 19) return res.status(400).json({ error: 'Número de tarjeta inválido' })
      if (!/^\d{2}\/\d{2}$/.test(expiracion)) return res.status(400).json({ error: 'Expiración inválida (MM/AA)' })
      const [mm, aa] = expiracion.split('/').map(Number)
      if (mm < 1 || mm > 12) return res.status(400).json({ error: 'Mes de expiración inválido' })
      const ahora = new Date()
      const anioActual = ahora.getFullYear() % 100
      const mesActual = ahora.getMonth() + 1
      if (aa < anioActual || (aa === anioActual && mm < mesActual)) {
        return res.status(400).json({ error: 'La tarjeta está vencida' })
      }
      if (cvv.length < 3 || cvv.length > 4) return res.status(400).json({ error: 'CVV inválido' })
      const last4 = numero.slice(-4)
      data = {
        ...data,
        pagoTitular: titular,
        pagoLast4: last4,
        pagoQrData: null,
        pagoReferencia: `T-${id}-${Date.now()}`,
      }
    } else {
      const qrData = String(req.body?.qrData || '').trim()
      if (qrData.length < 6) return res.status(400).json({ error: 'Referencia QR inválida' })
      data = {
        ...data,
        pagoTitular: null,
        pagoLast4: null,
        pagoQrData: qrData.slice(0, 180),
        pagoReferencia: `Q-${id}-${Date.now()}`,
      }
    }

    const updated = await prisma.inscripcion.update({
      where: { id },
      data,
    })
    res.json({ ok: true, inscripcion: updated })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo registrar el pago' })
  }
})

/** Inscripción (recomendado con sesión de alumno) */
app.post('/api/inscripciones', optionalAuth, async (req, res) => {
  try {
    const { nombre, correo, telefono, taller } = req.body || {}
    if (!nombre?.trim() || !correo?.trim() || !telefono?.trim() || !taller) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' })
    }
    if (nombre.trim().length < 3) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' })
    }
    const correoNorm = correo.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoNorm)) {
      return res.status(400).json({ error: 'Correo electrónico inválido' })
    }
    if (!/^\+?[0-9\s-]{7,15}$/.test(telefono.trim())) {
      return res.status(400).json({ error: 'Teléfono inválido' })
    }
    if (!TALLERES.includes(taller)) {
      return res.status(400).json({ error: 'Taller no válido' })
    }

    const alumno = req.user?.role === 'USER' ? req.user : null
    let previas = 0
    let descuento = { porcentaje: 0, etiqueta: 'Inicia sesión para obtener hasta 15% de descuento' }

    if (alumno) {
      previas = await contarInscripcionesActivas(alumno.id)
      descuento = descuentoPorInscripciones(previas)

      const duplicada = await prisma.inscripcion.findFirst({
        where: {
          userId: alumno.id,
          taller,
          estado: { in: ['PENDIENTE', 'APROBADA'] },
        },
      })
      if (duplicada) {
        return res.status(409).json({
          error: 'Ya tienes una inscripción activa para este taller',
        })
      }

      const dbUser = await prisma.user.findUnique({ where: { id: alumno.id } })
      if (dbUser) {
        await prisma.user.update({
          where: { id: alumno.id },
          data: {
            nombre: nombre.trim(),
            telefono: telefono.trim(),
          },
        })
      }
    }

    const row = await prisma.inscripcion.create({
      data: {
        nombre: nombre.trim(),
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim(),
        taller,
        userId: alumno?.id ?? null,
      },
    })

    let mensaje = 'Inscripción registrada correctamente'
    if (alumno && descuento.porcentaje > 0) {
      mensaje += `. Descuento estimado: ${descuento.porcentaje}% (${descuento.etiqueta}). Te confirmaremos por correo.`
    }

    res.status(201).json({
      ok: true,
      id: row.id,
      mensaje,
      descuento: alumno ? descuento : null,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo guardar la inscripción' })
  }
})

const inscripcionAdminInclude = {
  user: {
    select: {
      id: true,
      email: true,
      nombre: true,
      telefono: true,
      avatarUrl: true,
      createdAt: true,
    },
  },
}

/** Listado de inscripciones — solo ADMIN */
app.get('/api/inscripciones', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const rows = await prisma.inscripcion.findMany({
      orderBy: { createdAt: 'desc' },
      include: inscripcionAdminInclude,
    })
    res.json(rows)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudieron listar las inscripciones' })
  }
})

/** Cambiar estado de inscripción — solo ADMIN (requiere explicación al aceptar o rechazar) */
app.patch('/api/inscripciones/:id/estado', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const estado = req.body?.estado
    const comentario = typeof req.body?.comentario === 'string' ? req.body.comentario.trim() : ''

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    if (!['APROBADA', 'DENEGADA'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido. Usa APROBADA o DENEGADA.' })
    }
    if (comentario.length < 10) {
      return res.status(400).json({
        error: 'Escribe una explicación para el alumno (mínimo 10 caracteres).',
      })
    }
    if (comentario.length > 2000) {
      return res.status(400).json({ error: 'La explicación es demasiado larga (máx. 2000 caracteres).' })
    }

    const row = await prisma.inscripcion.update({
      where: { id },
      data: {
        estado,
        comentarioAdmin: comentario,
        respondidoAt: new Date(),
      },
      include: inscripcionAdminInclude,
    })
    res.json({ ok: true, inscripcion: row })
  } catch (e) {
    if (e?.code === 'P2025') {
      return res.status(404).json({ error: 'Inscripción no encontrada' })
    }
    console.error(e)
    if (e?.name === 'PrismaClientValidationError') {
      return res.status(500).json({
        error:
          'El servidor no está sincronizado con la base de datos. Detén npm run dev, ejecuta en la carpeta server: npx prisma generate, y vuelve a iniciar el API.',
      })
    }
    res.status(500).json({ error: 'No se pudo actualizar el estado' })
  }
})

/** Revisar pago de inscripción — solo ADMIN */
app.patch('/api/inscripciones/:id/pago-estado', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    const pagoEstado = String(req.body?.pagoEstado || '').toUpperCase()
    const comentario =
      typeof req.body?.comentario === 'string' ? req.body.comentario.trim().slice(0, 500) : ''

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID inválido' })
    }
    if (!['APROBADO', 'RECHAZADO'].includes(pagoEstado)) {
      return res.status(400).json({ error: 'Estado de pago inválido. Usa APROBADO o RECHAZADO.' })
    }

    const actual = await prisma.inscripcion.findUnique({ where: { id } })
    if (!actual) return res.status(404).json({ error: 'Inscripción no encontrada' })
    if (actual.estado !== 'APROBADA') {
      return res.status(400).json({ error: 'Solo se revisa pago de inscripciones aprobadas.' })
    }
    if (actual.pagoEstado !== 'ENVIADO') {
      return res.status(400).json({ error: 'No hay un pago enviado pendiente de revisión.' })
    }
    if (pagoEstado === 'RECHAZADO' && comentario.length < 6) {
      return res.status(400).json({ error: 'Escribe un motivo breve para rechazar el pago.' })
    }

    const row = await prisma.inscripcion.update({
      where: { id },
      data: {
        pagoEstado,
        pagoComentarioAdmin: comentario || null,
        pagoRevisadoAt: new Date(),
      },
      include: inscripcionAdminInclude,
    })

    res.json({ ok: true, inscripcion: row })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo actualizar el estado de pago' })
  }
})

/** === Admin: Cursos === */
app.get('/api/admin/cursos', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const rows = await prisma.curso.findMany({
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
    })
    const inscripciones = await prisma.inscripcion.findMany({
      where: { estado: 'APROBADA' },
      select: {
        taller: true,
        nombre: true,
        correo: true,
        pagoEstado: true,
        user: {
          select: { nombre: true, email: true },
        },
      },
    })

    const porCurso = new Map()
    for (const i of inscripciones) {
      if (!i.taller) continue
      if (!porCurso.has(i.taller)) porCurso.set(i.taller, [])
      porCurso.get(i.taller).push({
        nombre: i.user?.nombre || i.nombre || 'Alumno',
        correo: i.user?.email || i.correo || '',
        pagoEstado: i.pagoEstado || 'NO_INICIADO',
      })
    }

    res.json(
      rows.map((r) => {
        const base = cursoPayload(r)
        const alumnos = porCurso.get(r.slug) || []
        return {
          ...base,
          alumnosCount: alumnos.length,
          alumnos,
        }
      }),
    )
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudieron listar los cursos' })
  }
})

app.post('/api/admin/cursos', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {}
    const validacion = validarCursoCampos(body)
    if (validacion) return res.status(400).json({ error: validacion })

    const slug = body.slug.trim()
    const titulo = body.titulo.trim()
    const descripcion = body.descripcion.trim()
    const niveles = Array.isArray(body.niveles) ? body.niveles.filter(Boolean) : []
    const temas = Array.isArray(body.temas) ? body.temas.filter(Boolean) : []

    const row = await prisma.curso.create({
      data: {
        slug,
        titulo,
        corto: typeof body.corto === 'string' ? body.corto.trim() : null,
        descripcion,
        detalle: typeof body.detalle === 'string' ? body.detalle.trim() : null,
        imagen: typeof body.imagen === 'string' ? body.imagen.trim() : null,
        imagenAlt: typeof body.imagenAlt === 'string' ? body.imagenAlt.trim() : null,
        duracion: typeof body.duracion === 'string' ? body.duracion.trim() : null,
        sede: typeof body.sede === 'string' ? body.sede.trim() : null,
        horario: typeof body.horario === 'string' ? body.horario.trim() : null,
        materiales: typeof body.materiales === 'string' ? body.materiales.trim() : null,
        notaPresencial: typeof body.notaPresencial === 'string' ? body.notaPresencial.trim() : null,
        precio: Number(body.precio),
        niveles: JSON.stringify(niveles),
        temas: JSON.stringify(temas),
        activo: body.activo === false ? false : true,
        orden: Number.isFinite(Number(body.orden)) ? Number(body.orden) : 0,
      },
    })
    res.status(201).json({ ok: true, curso: cursoPayload(row) })
  } catch (e) {
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Ya existe un curso con ese slug' })
    console.error(e)
    res.status(500).json({ error: 'No se pudo crear el curso' })
  }
})

app.patch('/api/admin/cursos/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' })
    const body = req.body || {}

    const niveles = Array.isArray(body.niveles) ? body.niveles.filter(Boolean) : undefined
    const temas = Array.isArray(body.temas) ? body.temas.filter(Boolean) : undefined

    const data = {
      slug: typeof body.slug === 'string' ? body.slug.trim() : undefined,
      titulo: typeof body.titulo === 'string' ? body.titulo.trim() : undefined,
      corto: typeof body.corto === 'string' ? body.corto.trim() : undefined,
      descripcion: typeof body.descripcion === 'string' ? body.descripcion.trim() : undefined,
      detalle: typeof body.detalle === 'string' ? body.detalle.trim() : undefined,
      imagen: typeof body.imagen === 'string' ? body.imagen.trim() : undefined,
      imagenAlt: typeof body.imagenAlt === 'string' ? body.imagenAlt.trim() : undefined,
      duracion: typeof body.duracion === 'string' ? body.duracion.trim() : undefined,
      sede: typeof body.sede === 'string' ? body.sede.trim() : undefined,
      horario: typeof body.horario === 'string' ? body.horario.trim() : undefined,
      materiales: typeof body.materiales === 'string' ? body.materiales.trim() : undefined,
      notaPresencial: typeof body.notaPresencial === 'string' ? body.notaPresencial.trim() : undefined,
      precio: body.precio === null ? null : Number.isFinite(Number(body.precio)) ? Number(body.precio) : undefined,
      niveles: niveles ? JSON.stringify(niveles) : undefined,
      temas: temas ? JSON.stringify(temas) : undefined,
      activo: typeof body.activo === 'boolean' ? body.activo : undefined,
      orden: Number.isFinite(Number(body.orden)) ? Number(body.orden) : undefined,
    }

    const validacion = validarCursoCampos(body, { parcial: true })
    if (validacion) return res.status(400).json({ error: validacion })

    const row = await prisma.curso.update({ where: { id }, data })
    res.json({ ok: true, curso: cursoPayload(row) })
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Curso no encontrado' })
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Ya existe un curso con ese slug' })
    console.error(e)
    res.status(500).json({ error: 'No se pudo actualizar el curso' })
  }
})

app.delete('/api/admin/cursos/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' })
    await prisma.curso.delete({ where: { id } })
    res.json({ ok: true })
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Curso no encontrado' })
    console.error(e)
    res.status(500).json({ error: 'No se pudo eliminar el curso' })
  }
})

/** === Admin: Galería === */
app.get('/api/admin/galeria', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const rows = await prisma.galeriaItem.findMany({
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
    })
    res.json(rows.map(galeriaPayload))
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo cargar la galería' })
  }
})

app.post('/api/admin/galeria', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {}
    const validacion = validarGaleriaCampos(body)
    if (validacion) return res.status(400).json({ error: validacion })

    const src = body.src.trim()
    const alt = body.alt.trim()
    const titulo = body.titulo.trim()
    const row = await prisma.galeriaItem.create({
      data: {
        cursoSlug: typeof body.curso === 'string' ? body.curso.trim().toLowerCase() : null,
        src,
        alt,
        titulo,
        alumno: typeof body.alumno === 'string' ? body.alumno.trim() : null,
        nota: typeof body.nota === 'string' ? body.nota.trim() : null,
        ancho: typeof body.ancho === 'string' ? body.ancho.trim() : null,
        activo: body.activo === false ? false : true,
        orden: Number.isFinite(Number(body.orden)) ? Number(body.orden) : 0,
      },
    })
    res.status(201).json({ ok: true, item: galeriaPayload(row) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo crear el item' })
  }
})

app.patch('/api/admin/galeria/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' })
    const body = req.body || {}
    const validacion = validarGaleriaCampos(body, { parcial: true })
    if (validacion) return res.status(400).json({ error: validacion })

    const row = await prisma.galeriaItem.update({
      where: { id },
      data: {
        cursoSlug: typeof body.curso === 'string' ? body.curso.trim().toLowerCase() : undefined,
        src: typeof body.src === 'string' ? body.src.trim() : undefined,
        alt: typeof body.alt === 'string' ? body.alt.trim() : undefined,
        titulo: typeof body.titulo === 'string' ? body.titulo.trim() : undefined,
        alumno: typeof body.alumno === 'string' ? body.alumno.trim() : undefined,
        nota: typeof body.nota === 'string' ? body.nota.trim() : undefined,
        ancho: typeof body.ancho === 'string' ? body.ancho.trim() : undefined,
        activo: typeof body.activo === 'boolean' ? body.activo : undefined,
        orden: Number.isFinite(Number(body.orden)) ? Number(body.orden) : undefined,
      },
    })
    res.json({ ok: true, item: galeriaPayload(row) })
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Item no encontrado' })
    console.error(e)
    res.status(500).json({ error: 'No se pudo actualizar el item' })
  }
})

app.delete('/api/admin/galeria/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'ID inválido' })
    await prisma.galeriaItem.delete({ where: { id } })
    res.json({ ok: true })
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Item no encontrado' })
    console.error(e)
    res.status(500).json({ error: 'No se pudo eliminar el item' })
  }
})

/** === Admin: Nosotros (contenido) === */
app.get('/api/admin/nosotros', authMiddleware, requireAdmin, async (_req, res) => {
  try {
    const row =
      (await prisma.paginaContenido.findUnique({ where: { key: 'nosotros' } })) ||
      (await prisma.paginaContenido.create({
        data: {
          key: 'nosotros',
          titulo: 'Historia y equipo',
          lead: 'Una escuela pensada para quien quiere aprender haciendo, con criterio y oficio.',
          body: '',
          activo: true,
        },
      }))
    res.json({
      key: row.key,
      titulo: row.titulo ?? '',
      lead: row.lead ?? '',
      body: row.body ?? '',
      activo: row.activo,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo cargar el contenido' })
  }
})

app.patch('/api/admin/nosotros', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const body = req.body || {}
    const validacion = validarNosotrosCampos(body)
    if (validacion) return res.status(400).json({ error: validacion })

    const row = await prisma.paginaContenido.upsert({
      where: { key: 'nosotros' },
      update: {
        titulo: typeof body.titulo === 'string' ? body.titulo.trim() : undefined,
        lead: typeof body.lead === 'string' ? body.lead.trim() : undefined,
        body: typeof body.body === 'string' ? body.body : undefined,
        activo: typeof body.activo === 'boolean' ? body.activo : undefined,
      },
      create: {
        key: 'nosotros',
        titulo: typeof body.titulo === 'string' ? body.titulo.trim() : 'Historia y equipo',
        lead:
          typeof body.lead === 'string'
            ? body.lead.trim()
            : 'Una escuela pensada para quien quiere aprender haciendo, con criterio y oficio.',
        body: typeof body.body === 'string' ? body.body : '',
        activo: typeof body.activo === 'boolean' ? body.activo : true,
      },
    })
    res.json({
      ok: true,
      nosotros: {
        key: row.key,
        titulo: row.titulo,
        lead: row.lead,
        body: row.body,
        activo: row.activo,
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'No se pudo guardar el contenido' })
  }
})

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`API Academia EFE en http://localhost:${PORT}`)
})
