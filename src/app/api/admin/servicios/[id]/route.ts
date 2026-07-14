import { NextResponse } from 'next/server'
import { prisma }       from '@/lib/prisma'
import { auth }         from '@/lib/auth'

async function checkAdmin() {
  const session = await auth()
  return session?.user?.role === 'ADMIN'
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id } = await params
    const data   = await request.json()

    const servicio = await prisma.servicio.update({
      where: { id: Number(id) },
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

    return NextResponse.json(servicio)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el servicio' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id }     = await params
    const { activo } = await request.json()

    const servicio = await prisma.servicio.update({
      where: { id: Number(id) },
      data:  { activo, updatedAt: new Date() },
    })

    return NextResponse.json(servicio)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el estado' }, { status: 500 })
  }
}