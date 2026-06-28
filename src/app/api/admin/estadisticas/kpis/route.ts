import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahora  = new Date()
  const hoy    = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const manana  = new Date(hoy.getTime() + 86_400_000)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const [citasHoy, citasMes, pedidosMes, clientesTotal] = await Promise.all([
    prisma.cita.count({
      where: { fecha: { gte: hoy, lt: manana } },
    }),
    prisma.cita.count({
      where: { fecha: { gte: inicioMes } },
    }),
    prisma.pedido.count({
      where: { fecha_pedido: { gte: inicioMes } },
    }),
    prisma.usuario.count({
      where: { rol: "CLIENTE", activo: true },
    }),
  ])

  return NextResponse.json({ citasHoy, citasMes, pedidosMes, clientesTotal })
}
