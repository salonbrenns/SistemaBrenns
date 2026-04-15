import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  // Lista de perfiles de empleados para el panel admin
  const empleados = await prisma.empleado.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
    select: {
      id:          true,
      nombre:      true,
      puesto:      true,
      imagen:      true,
      descripcion: true,
      orden:       true,
    },
  })

  return NextResponse.json(empleados)
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { nombre, puesto, descripcion, imagen, orden } = await req.json()
  if (!nombre || !puesto) return NextResponse.json({ error: "Nombre y puesto son requeridos" }, { status: 400 })

  const empleado = await prisma.empleado.create({
    data: {
      nombre,
      puesto,
      descripcion,
      imagen,
      orden:     orden ?? 0,
      updatedAt: new Date(),
      // ← ya no se crean días aquí, se asignan después desde [id]/dias
    },
  })

  return NextResponse.json(empleado, { status: 201 })
}