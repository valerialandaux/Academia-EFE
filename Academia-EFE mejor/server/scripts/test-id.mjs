import { PrismaClient } from '@prisma/client'

const p = new PrismaClient()
try {
  await p.user.update({ where: { id: '2' }, data: { avatarUrl: '/test' } })
  console.log('string id ok')
} catch (e) {
  console.log('string id fail', e.code, e.message.slice(0, 120))
}
await p.$disconnect()
