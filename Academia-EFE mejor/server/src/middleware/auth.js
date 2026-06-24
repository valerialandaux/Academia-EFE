import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' })
  }
  try {
    const token = header.slice(7)
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET no configurado' })
    }
    const payload = jwt.verify(token, secret)
    const id = Number(payload.sub)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    req.user = {
      id,
      role: payload.role,
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Solo administradores' })
  }
  next()
}
