export const etiquetaTaller = {
  basica: 'Fotografía Básica',
  retrato: 'Retrato e Iluminación',
  edicion: 'Postproducción y Edición',
}

export const etiquetaEstado = {
  PENDIENTE: 'En revisión',
  APROBADA: 'Aceptada',
  DENEGADA: 'Rechazada',
}

export const mensajeEstado = {
  PENDIENTE: 'Tu solicitud está en cola. Te avisaremos por correo cuando haya novedades.',
  APROBADA: '¡Felicidades! Tu plaza fue confirmada. Revisa tu correo para los siguientes pasos.',
  DENEGADA: 'En esta ocasión no pudimos confirmar tu plaza. Escríbenos si tienes dudas.',
}

export function claseEstado(estado) {
  if (estado === 'APROBADA') return 'estado-aprobada'
  if (estado === 'DENEGADA') return 'estado-denegada'
  return 'estado-pendiente'
}

/** Texto principal que ve el alumno según estado y respuesta del admin */
export function mensajeAlumno(row) {
  if (row?.comentarioAdmin?.trim()) {
    return row.comentarioAdmin.trim()
  }
  return mensajeEstado[row?.estado] || mensajeEstado.PENDIENTE
}

export function tituloRespuestaAlumno(estado) {
  if (estado === 'APROBADA') return 'Tu solicitud fue aceptada'
  if (estado === 'DENEGADA') return 'Tu solicitud fue rechazada'
  return null
}

export const infoPresencialPorTaller = {
  basica: {
    sede: 'Sede Central Academia EFE (Aula 2)',
    horario: 'Lunes y miércoles · 19:00 a 21:00',
    llevar: 'Cámara o celular con cámara, libreta y cargador.',
    nota: 'Llega 15 minutos antes para registro y asignación de grupo.',
  },
  retrato: {
    sede: 'Estudio EFE (planta baja)',
    horario: 'Martes y jueves · 19:00 a 21:00',
    llevar: 'Cámara con modo manual, memoria libre y cuaderno.',
    nota: 'El primer día se revisa equipo y configuración base.',
  },
  edicion: {
    sede: 'Laboratorio Digital EFE',
    horario: 'Sábados · 09:00 a 12:00',
    llevar: 'Laptop (si tienes), mouse y cargador.',
    nota: 'Si no tienes laptop, la academia te asigna equipo en aula.',
  },
}
