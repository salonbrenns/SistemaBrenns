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
  const body = await req.json()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (body.correo !== undefined && !emailRegex.test(String(body.correo).trim())) {
    return NextResponse.json({ error: "Formato de correo inválido" }, { status: 400 })
  }
  if (body.password !== undefined && String(body.password).length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (body.nombre   !== undefined) data.nombre   = String(body.nombre).trim().slice(0, 200)
  if (body.correo   !== undefined) data.correo   = String(body.correo).trim().toLowerCase().slice(0, 200)
  if (body.telefono !== undefined) data.telefono = body.telefono ? String(body.telefono).trim().slice(0, 30) : null
  if (body.activo   !== undefined) data.activo   = body.activo
  if (body.password)               data.password = await bcrypt.hash(String(body.password), 12)

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
