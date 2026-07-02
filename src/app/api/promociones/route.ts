import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const hoy = new Date()
    const promociones = await prisma.promocion.findMany({
      where: {
        activo: true,
        fecha_inicio: { lte: hoy },
        fecha_fin:    { gte: hoy },
      },
      include: {
        productos: { select: { producto_id: true } }
      }
    })
    // Devuelve lista de { ...promo, producto_ids: number[] }
    const data = promociones.map(p => ({
      ...p,
      producto_ids: p.productos.map(pp => pp.producto_id)
    }))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}