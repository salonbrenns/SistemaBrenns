// src/app/api/admin/servicios/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

// PUT — editar servicio
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body   = await req.json()
    const { nombre, descripcion, precio, duracion, categoria, imagen, activo } = body

    const servicio = await prisma.servicio.update({
      where: { id: Number(id) },
      data: {
        nombre,
        descripcion: descripcion || null,
        precio:      Number(precio),
        duracion,
        categoria,
        imagen:      imagen || null,
        activo:      activo ?? true,
      },
    })

    return NextResponse.json({ ok: true, servicio })
  } catch (err) {
    console.error("Error editando servicio:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE — eliminar servicio
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.servicio.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch {
    // Se añadió el guion bajo (_) para indicar que la variable no se usa intencionalmente
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}