import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

export async function GET() {
  const session = await auth()
  const role = session?.user?.role
  
  if (role !== "ADMIN" && role !== "EMPLEADO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    // EL CAMBIO ESTÁ AQUÍ: El tipo <> va pegado a $queryRaw
    const empleados = await prisma.$queryRaw<{ id: number; nombre: string; correo: string }[]>`
      SELECT id, nombre, correo
      FROM seguridad.tblusuarios
      WHERE rol::text = 'EMPLEADO'
      AND activo = true
      ORDER BY nombre ASC
    `

    return NextResponse.json(empleados)
  } catch (error) {
    console.error("Error al obtener empleados:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}