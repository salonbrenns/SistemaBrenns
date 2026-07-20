// src/app/api/equipo/route.ts — pública, sin auth
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const equipo = await prisma.empleado.findMany({
      where:   { activo: true },
      select:  { id: true, nombre: true, puesto: true, descripcion: true, imagen: true, orden: true },
      orderBy: { orden: "asc" },
    })
    return NextResponse.json(equipo)
  } catch {
    return NextResponse.json({ error: "Error al obtener el equipo" }, { status: 500 })
  }
}
