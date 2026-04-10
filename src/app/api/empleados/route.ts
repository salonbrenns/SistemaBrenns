import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const empleados = await prisma.$queryRaw<{ id: number; nombre: string }[]>`
    SELECT id, nombre 
    FROM seguridad.tblusuarios
    WHERE rol::text IN ('EMPLEADO', 'ADMIN')
    AND activo = true
    ORDER BY nombre ASC
  `
  return NextResponse.json(empleados)
}