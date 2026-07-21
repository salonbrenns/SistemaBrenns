import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { auth }         from '@/lib/auth'

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === 'ADMIN'
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
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
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const data = await request.json()

    if (!data.nombre?.trim())
      return NextResponse.json({ error: "El nombre del servicio es requerido" }, { status: 400 })
    if (!data.precio || Number(data.precio) <= 0)
      return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 })
    if (!data.duracion?.trim())
      return NextResponse.json({ error: "La duración es requerida" }, { status: 400 })

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