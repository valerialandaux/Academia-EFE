import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars')

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export function ensureAvatarsDir() {
  if (!fs.existsSync(AVATARS_DIR)) {
    fs.mkdirSync(AVATARS_DIR, { recursive: true })
  }
}

export function extForMime(mimetype) {
  return MIME_EXT[mimetype] || null
}

export function avatarPublicPath(userId, ext) {
  return `/uploads/avatars/user-${userId}${ext}`
}

/** Elimina archivos previos del usuario (cualquier extensión). */
export function deleteUserAvatars(userId) {
  ensureAvatarsDir()
  const prefix = `user-${userId}.`
  for (const name of fs.readdirSync(AVATARS_DIR)) {
    if (name.startsWith(prefix)) {
      fs.unlinkSync(path.join(AVATARS_DIR, name))
    }
  }
}
