// src/app/api/admin/equipo/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

// PUT — actualizar miembro completo
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const { id } = await params
    const { nombre, puesto, descripcion, imagen, orden } = await req.json()
    if (!nombre?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

    const miembro = await prisma.empleado.update({
      where: { id: Number(id) },
      data: {
        nombre:      nombre.trim(),
        puesto:      puesto?.trim() ?? "",
        descripcion: descripcion?.trim() ?? null,
        imagen:      imagen ?? null,
        orden:       orden ?? 0,
      },
    })
    return NextResponse.json(miembro)
  } catch {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 })
  }
}

// PATCH — toggle activo
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const { id } = await params
    const { activo } = await req.json()
    const miembro = await prisma.empleado.update({
      where: { id: Number(id) },
      data:  { activo },
    })
    return NextResponse.json(miembro)
  } catch {
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 })
  }
}

// DELETE — eliminar miembro
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const { id } = await params
    await prisma.empleado.delete({ where: { id: Number(id) } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }
}
