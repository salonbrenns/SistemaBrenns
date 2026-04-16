import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'



export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
      select: {
        id:      true,
        nombre:  true,
        precio:  true,
        duracion: true,
      },
    })
    return NextResponse.json(servicios)
  } catch {
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const servicio = await prisma.servicio.create({
      data: {
        nombre:       data.nombre,
        descripcion:  data.descripcion  || null,
        precio:       data.precio,
        duracion:     data.duracion,
        imagen:       data.imagen       || null,
        beneficios:   data.beneficios   || null,
        incluye:      data.incluye      || null,
        activo:       data.activo       ?? true,
        categoria_id: data.categoria_id ?? null,
        updatedAt:    new Date(),
      },
    })
    return NextResponse.json(servicio, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear el servicio' }, { status: 500 })
  }
}