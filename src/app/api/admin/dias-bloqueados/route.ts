// src/app/api/admin/dias-bloqueados/route.ts

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const dias = await prisma.diaBloqueado.findMany({ orderBy: { fecha: "asc" } })
  return NextResponse.json(dias)
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { fecha, motivo } = await req.json()
  if (!fecha) return NextResponse.json({ error: "Falta la fecha" }, { status: 400 })

  const dia = await prisma.diaBloqueado.create({
    data: { fecha: new Date(fecha), motivo: motivo || null },
  })
  return NextResponse.json(dia, { status: 201 })
}