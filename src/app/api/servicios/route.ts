// src/app/api/servicios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      select: {
        id:        true,
        nombre:    true,
        precio:    true,
        categoria: true,
        imagen:    true,
        duracion:  true,
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json({
      servicios: servicios.map(s => ({
        ...s,
        precio: Number(s.precio),
      }))
    })
  } catch { 
    // Al quitar (_err), TypeScript entiende que el error se captura 
    // pero no se necesita instanciar ninguna variable.
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}