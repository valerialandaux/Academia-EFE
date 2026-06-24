import jwt from 'jsonwebtoken'

/** Si hay Bearer válido, rellena req.user; si no, continúa sin usuario. */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next()
  }
  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return next()
    const payload = jwt.verify(header.slice(7), secret)
    const id = Number(payload.sub)
    if (!Number.isInteger(id) || id <= 0) return next()
    req.user = { id, role: payload.role }
  } catch {
    /* token inválido: tratar como anónimo */
  }
  next()
}
