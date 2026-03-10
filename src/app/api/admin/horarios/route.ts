// src/app/api/admin/horarios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const horarios = await prisma.horarioDisponible.findMany({
    orderBy: [{ diaSemana: "asc" }, { hora: "asc" }],
  })
  return NextResponse.json(horarios)
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { hora, diaSemana } = await req.json()
  if (!hora || !diaSemana) return NextResponse.json({ error: "Hora y día son requeridos" }, { status: 400 })
  try {
    const horario = await prisma.horarioDisponible.create({
      data: { hora, diaSemana: Number(diaSemana), activo: true },
    })
    return NextResponse.json(horario, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Ya existe ese horario para ese día" }, { status: 409 })
  }
}