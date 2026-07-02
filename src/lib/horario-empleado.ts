// src/lib/horario-empleado.ts
import { prisma } from "@/lib/prisma"

export async function getHorasEmpleado(usuario_id: number, fecha: Date) {
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay() // 1=Lun … 6=Sáb

  // 1. Horario global activo para ese día
  const horasGlobales = await prisma.horarioDisponible.findMany({
    where: { diaSemana, activo: true },
    select: { hora: true },
  })

  // 2. Excepciones del empleado (permanentes del día + por fecha específica)
  const excepciones = await prisma.empleadoHoraExcepcion.findMany({
    where: {
      usuario_id,
      OR: [
        { dia_semana: diaSemana },
        { fecha },
      ],
    },
  })

  const quitadas = new Set(excepciones.filter(e => e.tipo === "QUITAR").map(e => e.hora))
  const agregadas = excepciones.filter(e => e.tipo === "AGREGAR").map(e => e.hora)

  // 3. Base global - quitadas + agregadas (sin duplicados)
  const horas = [
    ...horasGlobales.map(h => h.hora).filter(h => !quitadas.has(h)),
    ...agregadas,
  ]

  return [...new Set(horas)].sort()
}