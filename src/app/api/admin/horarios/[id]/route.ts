// src/app/api/admin/horarios/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const horario = await prisma.horarioDisponible.update({
    where: { id: Number(id) },
    data: { activo: body.activo },
  })
  return NextResponse.json(horario)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  await prisma.horarioDisponible.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}