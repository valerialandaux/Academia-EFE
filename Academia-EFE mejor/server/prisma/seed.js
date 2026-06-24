import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const email = process.env.ADMIN_EMAIL || 'admin@academiaefe.com'
const plain = process.env.ADMIN_PASSWORD || 'admin123'

async function main() {
  const password = await bcrypt.hash(plain, 10)

  await prisma.user.upsert({
    where: { email },
    update: { password, role: 'ADMIN' },
    create: {
      email,
      password,
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'demo@academiaefe.com' },
    update: {
      nombre: 'Alumno Demo',
      telefono: '+591 70000000',
    },
    create: {
      email: 'demo@academiaefe.com',
      password: await bcrypt.hash('demo123', 10),
      role: 'USER',
      nombre: 'Alumno Demo',
      telefono: '+591 70000000',
    },
  })

  // Contenido inicial (solo si la tabla está vacía)
  const presencialPorSlug = {
    basica: {
      sede: 'Sede Central Academia EFE (Aula 2)',
      horario: 'Lunes y miércoles · 19:00 a 21:00',
      materiales: 'Cámara o celular con cámara, libreta y cargador.',
      notaPresencial: 'Llega 15 minutos antes para registro y asignación de grupo.',
    },
    retrato: {
      sede: 'Estudio EFE (planta baja)',
      horario: 'Martes y jueves · 19:00 a 21:00',
      materiales: 'Cámara con modo manual, memoria libre y cuaderno.',
      notaPresencial: 'El primer día se revisa equipo y configuración base.',
    },
    edicion: {
      sede: 'Laboratorio Digital EFE',
      horario: 'Sábados · 09:00 a 12:00',
      materiales: 'Laptop (si tienes), mouse y cargador.',
      notaPresencial: 'Si no tienes laptop, la academia te asigna equipo en aula.',
    },
  }

  const cursosCount = await prisma.curso.count()
  if (!cursosCount) {
    await prisma.curso.createMany({
      data: [
        {
          slug: 'basica',
          titulo: 'Fotografía Básica',
          corto: 'Domina tu cámara en manual',
          descripcion:
            'Aprende a dominar tu cámara en modo manual: exposición, diafragma, ISO y composición desde cero.',
          detalle:
            'Ideal para quien empieza sin miedo a los modos M, A y S. Incluye salidas prácticas y revisión de imágenes en grupo.',
          imagen:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=82',
          imagenAlt: 'Paisaje montañoso al amanecer, ejemplo de fotografía de viaje',
          duracion: '8 semanas',
          ...presencialPorSlug.basica,
          precio: 2400,
          niveles: JSON.stringify(['basico']),
          temas: JSON.stringify(['paisaje']),
          activo: true,
          orden: 1,
        },
        {
          slug: 'retrato',
          titulo: 'Retrato e Iluminación',
          corto: 'Luz natural y estudio',
          descripcion: 'Técnicas de estudio y luz natural para retratos expresivos y profesionales.',
          detalle:
            'Trabajarás con softboxes, reflectores y hora dorada. Montajes sencillos en casa y protocolo en estudio.',
          imagen:
            'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=82',
          imagenAlt: 'Retrato artístico con luz suave',
          duracion: '10 semanas',
          ...presencialPorSlug.retrato,
          precio: 3200,
          niveles: JSON.stringify(['basico', 'avanzado']),
          temas: JSON.stringify(['retrato']),
          activo: true,
          orden: 2,
        },
        {
          slug: 'edicion',
          titulo: 'Postproducción',
          corto: 'Lightroom y Photoshop',
          descripcion: 'Revelado digital con Lightroom y Photoshop: color, máscaras y flujo de trabajo.',
          detalle:
            'De la importación al export para web e impresión. Perfiles de color básicos y atajos para ganar tiempo.',
          imagen:
            'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1000&q=82',
          imagenAlt: 'Ordenador mostrando software de edición de fotografía',
          duracion: '6 semanas',
          ...presencialPorSlug.edicion,
          precio: 1800,
          niveles: JSON.stringify(['avanzado']),
          temas: JSON.stringify(['edicion']),
          activo: true,
          orden: 3,
        },
      ],
    })
  } else {
    for (const [slug, data] of Object.entries(presencialPorSlug)) {
      await prisma.curso.updateMany({
        where: { slug, sede: null },
        data,
      })
    }
  }

  const galCount = await prisma.galeriaItem.count()
  if (!galCount) {
    await prisma.galeriaItem.createMany({
      data: [
        {
          cursoSlug: 'basica',
          src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=82',
          alt: 'Paisaje montañoso con niebla al amanecer',
          titulo: 'Horizonte en valle',
          alumno: 'María G.',
          nota: 'Exposición manual y regla de los tercios',
          ancho: 'alto',
          activo: true,
          orden: 1,
        },
        {
          cursoSlug: 'retrato',
          src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=82',
          alt: 'Retrato de mujer con luz suave lateral',
          titulo: 'Mirada en estudio',
          alumno: 'Lucía P.',
          nota: 'Softbox principal + relleno',
          ancho: 'alto',
          activo: true,
          orden: 2,
        },
        {
          cursoSlug: 'edicion',
          src: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=82',
          alt: 'Pantalla con revelado de fotografía',
          titulo: 'Antes / después',
          alumno: 'Miguel A.',
          nota: 'Flujo Lightroom — curva y split toning',
          ancho: 'alto',
          activo: true,
          orden: 3,
        },
      ],
    })
  }

  await prisma.paginaContenido.upsert({
    where: { key: 'nosotros' },
    update: {},
    create: {
      key: 'nosotros',
      titulo: 'Historia y equipo',
      lead: 'Una escuela pensada para quien quiere aprender haciendo, con criterio y oficio.',
      body: '',
      activo: true,
    },
  })

  console.log('Seed OK — admin:', email, '| user demo: demo@academiaefe.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
