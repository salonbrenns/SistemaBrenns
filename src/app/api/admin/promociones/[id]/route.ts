// src/app/api/admin/promociones/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const body = await req.json()
    const { producto_ids, ...datos } = body

    const promo = await prisma.promocion.update({
      where: { id },
      data: {
        ...datos,
        fecha_inicio: datos.fecha_inicio ? new Date(datos.fecha_inicio) : undefined,
        fecha_fin:    datos.fecha_fin    ? new Date(datos.fecha_fin)    : undefined,
      }
    })

    if (Array.isArray(producto_ids)) {
      await prisma.promocionProducto.deleteMany({ where: { promocion_id: id } })
      if (producto_ids.length > 0) {
        await prisma.promocionProducto.createMany({
          data: producto_ids.map((pid: number) => ({
            promocion_id: id,
            producto_id:  pid,
          }))
        })
      }
    }

    return NextResponse.json(promo)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    await prisma.promocion.delete({ where: { id: parseInt(idStr) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}