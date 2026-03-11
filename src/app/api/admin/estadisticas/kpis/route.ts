// src/app/api/admin/estadisticas/kpis/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const hoy        = new Date()
  const inicioHoy  = new Date(hoy); inicioHoy.setHours(0, 0, 0, 0)
  const finHoy     = new Date(hoy); finHoy.setHours(23, 59, 59, 999)
  const inicioMes  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const finMes     = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59)

  const [citasHoy, citasMes, pedidosMes, clientesTotal] = await Promise.all([
    prisma.cita.count({
      where: { fecha: { gte: inicioHoy, lte: finHoy }, estado: { in: ["PENDIENTE", "CONFIRMADA"] } }
    }),
    prisma.cita.count({
      where: { fecha: { gte: inicioMes, lte: finMes } }
    }),
   prisma.pedido.count({
  where: { fecha_pedido: { gte: inicioMes, lte: finMes } }
}),
    prisma.usuario.count({
      where: { rol: "CLIENTE" }
    }),
  ])

  return NextResponse.json({ citasHoy, citasMes, pedidosMes, clientesTotal })
}