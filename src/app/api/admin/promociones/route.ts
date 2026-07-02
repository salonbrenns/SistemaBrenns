import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const promociones = await prisma.promocion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        productos: {
          include: { producto: { select: { id: true, nombre: true } } }
        }
      }
    })
    return NextResponse.json(promociones)
  } catch {
    return NextResponse.json({ error: "Error al obtener promociones" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      nombre:       string
      tipo:         string
      descuento:    number
      codigo?:      string
      fecha_inicio: string
      fecha_fin:    string
      producto_ids?: number[]
    }

    const { nombre, tipo, descuento, codigo, fecha_inicio, fecha_fin, producto_ids = [] } = body

    if (!nombre || !tipo || !descuento || !fecha_inicio || !fecha_fin) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const promo = await prisma.promocion.create({
      data: {
        nombre,
        tipo,
        descuento,
        codigo:       codigo || null,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin:    new Date(fecha_fin),
        activo: true,
        productos: {
          create: producto_ids.map(id => ({ producto_id: id }))
        }
      },
      include: {
        productos: { include: { producto: { select: { id: true, nombre: true } } } }
      }
    })

    return NextResponse.json(promo, { status: 201 })

  } catch (e: unknown) {
    // ✅ Tipo unknown con type guard en lugar de any
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "El código promocional ya existe" }, { status: 409 })
    }
    return NextResponse.json({ error: "Error al crear promoción" }, { status: 500 })
  }
}