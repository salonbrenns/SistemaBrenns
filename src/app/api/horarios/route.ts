// src/app/api/horarios/route.ts
// GET — devuelve horarios disponibles para una fecha
// Considera duración de servicios existentes y del nuevo servicio para detectar solapamientos

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

/** "1h 30min" → 90, "1h" → 60, "45min" → 45 */
function parseDuracionMinutos(duracion: string): number {
  let minutos = 0
  const hMatch = duracion.match(/(\d+)\s*h/)
  const mMatch = duracion.match(/(\d+)\s*min/)
  if (hMatch) minutos += parseInt(hMatch[1]) * 60
  if (mMatch) minutos += parseInt(mMatch[1])
  return minutos || 60
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const fecha      = searchParams.get("fecha")      // "2025-04-15"
  const empleadoId = searchParams.get("empleadoId") // opcional
  const servicioId = searchParams.get("servicioId") // para calcular solapamiento por duración

  if (!fecha) return NextResponse.json([], { status: 400 })

  const fechaDate   = new Date(fecha + "T00:00:00")
  const diaSemanaJS = fechaDate.getDay()
  const diaSemana   = diaSemanaJS === 0 ? 7 : diaSemanaJS // 7=Domingo

  // Verificar si el empleado atiende ese día
  if (empleadoId && empleadoId !== "null") {
    const atiende = await prisma.empleadoDia.findUnique({
      where: {
        usuario_id_dia_semana: {
          usuario_id: Number(empleadoId),
          dia_semana: diaSemana,
        },
      },
    })
    if (!atiende) {
      return NextResponse.json({ sinAtencion: true, horarios: [] })
    }
  }

  // Duración del servicio que se quiere agendar
  let duracionNuevo = 60
  if (servicioId && servicioId !== "null") {
    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(servicioId) },
      select: { duracion: true },
    })
    if (servicio?.duracion) duracionNuevo = parseDuracionMinutos(servicio.duracion)
  }

  // Citas activas del día (con duración de su servicio)
  const [horasBloqueadas, citasDelDia, excepciones] = await Promise.all([
    prisma.horaBloqueada.findMany({ where: { fecha: fechaDate } }),
    prisma.cita.findMany({
      where: {
        fecha: fechaDate,
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        ...(empleadoId && empleadoId !== "null"
          ? { empleado_id: Number(empleadoId) }
          : {}),
      },
      select: {
        hora: true,
        servicio: { select: { duracion: true } },
      },
    }),
    prisma.horarioExcepcion.findMany({ where: { fecha: fechaDate } }),
  ])

  // Intervalos ocupados [inicio, fin) en minutos
  const intervalos: { inicio: number; fin: number }[] = [
    ...horasBloqueadas.map(h => ({
      inicio: horaAMinutos(h.hora),
      fin:    horaAMinutos(h.hora) + 60,
    })),
    ...excepciones.map(h => ({
      inicio: horaAMinutos(h.hora),
      fin:    horaAMinutos(h.hora) + 60,
    })),
    ...citasDelDia.map(c => {
      const dur = parseDuracionMinutos(c.servicio?.duracion ?? "1h")
      return {
        inicio: horaAMinutos(c.hora),
        fin:    horaAMinutos(c.hora) + dur,
      }
    }),
  ]

  const ahora        = new Date()
  const esHoy        = fechaDate.toDateString() === ahora.toDateString()
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes()

  const horariosBase = await prisma.horarioDisponible.findMany({
    where: { diaSemana: diaSemana, activo: true },
    orderBy: { hora: "asc" },
  })

  const resultado = horariosBase.map(h => {
    const inicio = horaAMinutos(h.hora)
    const fin    = inicio + duracionNuevo

    const pasado = esHoy && inicio <= minutosAhora + 30

    // Solapamiento: el nuevo servicio [inicio, fin) choca con algún intervalo ocupado
    const solapado = intervalos.some(iv => inicio < iv.fin && fin > iv.inicio)

    return { id: h.id, hora: h.hora, disponible: !pasado && !solapado }
  })

  return NextResponse.json({ sinAtencion: false, horarios: resultado })
}
