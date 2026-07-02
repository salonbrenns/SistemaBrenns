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

  // Para cada empleado, obtener sus días
  const empleadosConDias = await Promise.all(
    empleados.map(async (e) => {
      const dias = await prisma.empleadoDia.findMany({
        where: { usuario_id: e.id },
        select: { dia_semana: true },
        orderBy: { dia_semana: "asc" },
      })
      return {
        id:     e.id,
        nombre: e.nombre,
        imagen: null,
        dias:   dias.map(d => d.dia_semana),
      }
    })
  )

  return NextResponse.json(empleadosConDias)
}