// src/app/api/admin/servicios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const servicios = await prisma.servicio.findMany({ orderBy: { id: "asc" } })
  return NextResponse.json({ servicios })
}

export async function POST(req: Request) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { nombre, descripcion, precio, duracion, categoria, imagen, activo } = body

    if (!nombre || !precio || !duracion || !categoria) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        precio:      Number(precio),
        duracion,
        categoria,
        imagen:      imagen || null,
        activo:      activo ?? true,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ ok: true, servicio }, { status: 201 })
  } catch (err) {
    console.error("Error creando servicio:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}