// src/app/api/admin/empleadas/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

// PUT — editar empleada
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const { nombre, correo, telefono, activo, password } = await req.json()

  const data: Record<string, unknown> = {}
  if (nombre    !== undefined) data.nombre   = nombre
  if (correo    !== undefined) data.correo   = correo
  if (telefono  !== undefined) data.telefono = telefono || null
  if (activo    !== undefined) data.activo   = activo
  if (password)                data.password = await bcrypt.hash(password, 10)

  try {
    const updated = await prisma.usuario.update({
      where: { id: Number(id) },
      data,
      select: { id: true, nombre: true, correo: true, telefono: true, activo: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Empleada no encontrada" }, { status: 404 })
  }
}

// DELETE — desactivar (soft delete)
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params

  await prisma.usuario.update({
    where: { id: Number(id) },
    data: { activo: false },
  })

  return NextResponse.json({ ok: true })
}
