// src/app/api/admin/horas-bloqueadas/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const horas = await prisma.horaBloqueada.findMany({ orderBy: [{ fecha: "asc" }, { hora: "asc" }] })
  return NextResponse.json(horas)
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { fecha, hora, motivo } = await req.json()
  if (!fecha || !hora) return NextResponse.json({ error: "Fecha y hora son requeridas" }, { status: 400 })
  try {
    const horaBloqueada = await prisma.horaBloqueada.create({
      data: { fecha: new Date(fecha), hora, motivo: motivo || null },
    })
    return NextResponse.json(horaBloqueada, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Ya existe esa hora bloqueada para esa fecha" }, { status: 409 })
  }
}