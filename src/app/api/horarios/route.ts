// src/app/api/horarios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const fechaStr   = searchParams.get("fecha")
  const servicioId = searchParams.get("servicioId")

  if (!fechaStr) return NextResponse.json([], { status: 400 })

  const fecha     = new Date(fechaStr + "T12:00:00")
  const jsDia     = fecha.getDay()
  const diaSemana = jsDia === 0 ? null : jsDia

  if (diaSemana === null) return NextResponse.json([])

  // Horarios activos del día de semana
  const horariosActivos = await prisma.horarioDisponible.findMany({
    where: { diaSemana, activo: true },
    orderBy: { hora: "asc" },
  })

  const fechaInicio = new Date(fechaStr + "T00:00:00")
  const fechaFin    = new Date(fechaStr + "T23:59:59")

  // Citas ya agendadas ese día
  const citasExistentes = await prisma.cita.findMany({
    where: {
      fecha:  { gte: fechaInicio, lte: fechaFin },
      estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      ...(servicioId ? { servicio_id: Number(servicioId) } : {}),
    },
    select: { hora: true },
  })

  // Horas bloqueadas puntualmente ese día
  const horasBloqueadas = await prisma.horaBloqueada.findMany({
    where: { fecha: { gte: fechaInicio, lte: fechaFin } },
    select: { hora: true },
  })

  const horasOcupadas = new Set(citasExistentes.map(c => c.hora))
  const horasBloq     = new Set(horasBloqueadas.map(h => h.hora))

  // Verificar si es hoy para filtrar horas pasadas
  const ahora    = new Date()
  const ahoraStr = ahora.toLocaleDateString("en-CA") // "2026-03-10"
  const esHoy    = fechaStr === ahoraStr

  const resultado = horariosActivos.map(h => {
    let horaYaPaso = false
    if (esHoy) {
      const [horaH, minH] = h.hora.split(":").map(Number)
      const horaActual    = ahora.getHours()
      const minActual     = ahora.getMinutes()
      horaYaPaso = horaH < horaActual || (horaH === horaActual && minH <= minActual)
    }

    return {
      id:         h.id,
      hora:       h.hora,
      disponible: !horasOcupadas.has(h.hora) && !horasBloq.has(h.hora) && !horaYaPaso,
    }
  })

  return NextResponse.json(resultado)
}