// src/app/api/servicios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      where: { activo: true },
      select: {
        id:       true,
        nombre:   true,
        precio:   true,
        imagen:   true,
        duracion: true,
        activo:   true,
        categoria: { select: { nombre: true } },  // CategoriaServicio relation
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json({
      servicios: servicios.map(s => ({
        id:         s.id,
        nombre:     s.nombre,
        imagen:     s.imagen,
        duracion:   s.duracion,
        precio_min: Number(s.precio),
        disponible: s.activo,
        categoria:  s.categoria?.nombre ?? 'Sin categoría',
      }))
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}