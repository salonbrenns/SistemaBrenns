import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdminOrEmpleado() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

export async function GET() {
  if (!await isAdminOrEmpleado())
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
  if (!await isAdminOrEmpleado())
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { nombre, puesto, descripcion, imagen, orden } = await req.json()
  if (!nombre || !puesto)
    return NextResponse.json({ error: "Nombre y puesto son requeridos" }, { status: 400 })

  const empleado = await prisma.empleado.create({
    data: {
      nombre,
      puesto,
      descripcion,
      imagen,
      orden:     orden ?? 0,
      updatedAt: new Date(),
      // Los días de atención se asignan después desde /api/admin/empleados/[id]/dias
    },
  })
  return NextResponse.json(empleado, { status: 201 })
}
