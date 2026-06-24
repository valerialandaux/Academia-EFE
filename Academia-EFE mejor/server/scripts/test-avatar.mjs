import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import {
  AVATARS_DIR,
  deleteUserAvatars,
  avatarPublicPath,
  ensureAvatarsDir,
} from '../src/lib/avatarFiles.js'

dotenv.config()
const prisma = new PrismaClient()

try {
  ensureAvatarsDir()
  const user = await prisma.user.findFirst({ where: { role: 'USER' } })
  console.log('user', user?.id, user?.email)
  const ext = '.png'
  const buf = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  )
  deleteUserAvatars(user.id)
  fs.writeFileSync(path.join(AVATARS_DIR, `user-${user.id}${ext}`), buf)
  const avatarUrl = avatarPublicPath(user.id, ext)
  const u = await prisma.user.update({ where: { id: user.id }, data: { avatarUrl } })
  console.log('ok', u.avatarUrl)
} catch (e) {
  console.error('ERR', e)
} finally {
  await prisma.$disconnect()
}
