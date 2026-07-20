// src/app/api/admin/equipo/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

// GET — listar todos (admin)
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const equipo = await prisma.empleado.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  })
  return NextResponse.json(equipo)
}

// POST — crear nuevo miembro
export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const { nombre, puesto, descripcion, imagen, orden } = await req.json()
    if (!nombre?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

    const miembro = await prisma.empleado.create({
      data: {
        nombre:     nombre.trim(),
        puesto:     puesto?.trim() ?? "",
        descripcion: descripcion?.trim() ?? null,
        imagen:     imagen ?? null,
        orden:      orden ?? 0,
      },
    })
    return NextResponse.json(miembro, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Error al crear el miembro" }, { status: 500 })
  }
}
