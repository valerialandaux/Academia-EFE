import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const input = path.join(__dirname, '../public/images/logo-mejor.png')
const output = path.join(__dirname, '../public/images/logo-mejor-transparent.png')

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

for (let i = 0; i < data.length; i += 4) {
  const r = data[i]
  const g = data[i + 1]
  const b = data[i + 2]
  const isNearWhite = r > 228 && g > 228 && b > 228
  if (isNearWhite) data[i + 3] = 0
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(output)

fs.copyFileSync(output, input)
fs.unlinkSync(output)

console.log('Fondo blanco eliminado:', input)
