// src/app/api/empleado/stats/route.ts
// Devuelve estadísticas del día para el empleado autenticado

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const empleadoId = Number(session.user.id)

  const hoy        = new Date()
  const inicioDia  = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0)
  const finDia     = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59)

  const [citasHoy, citasPendientes, proximaCita] = await Promise.all([
    // Total de citas de hoy asignadas a este empleado
    prisma.cita.count({
      where: {
        empleado_id: empleadoId,
        fecha: { gte: inicioDia, lte: finDia },
        estado: { notIn: ["CANCELADO"] },
      },
    }),
    // Citas pendientes de confirmar
    prisma.cita.count({
      where: {
        empleado_id: empleadoId,
        estado: "PENDIENTE",
      },
    }),
    // Próxima cita del día (la más cercana a ahora)
    prisma.cita.findFirst({
      where: {
        empleado_id: empleadoId,
        fecha: { gte: inicioDia, lte: finDia },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        hora:   { gt: `${String(hoy.getHours()).padStart(2,"0")}:${String(hoy.getMinutes()).padStart(2,"0")}` },
      },
      orderBy: { hora: "asc" },
      select: { hora: true, usuario: { select: { nombre: true } } },
    }),
  ])

  return NextResponse.json({ citasHoy, citasPendientes, proximaCita })
}
