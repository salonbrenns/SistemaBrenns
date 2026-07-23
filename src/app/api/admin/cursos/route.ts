import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const data = await req.json()

    if (!data.titulo?.trim())
      return NextResponse.json({ error: "El título del curso es requerido" }, { status: 400 })
    if (!data.codigo?.trim())
      return NextResponse.json({ error: "El código del curso es requerido" }, { status: 400 })
    if (!data.precio_total || Number(data.precio_total) <= 0)
      return NextResponse.json({ error: "El precio total debe ser mayor a 0" }, { status: 400 })
    if (!data.cupo_maximo || Number(data.cupo_maximo) < 1)
      return NextResponse.json({ error: "El cupo máximo debe ser al menos 1" }, { status: 400 })
    if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_fin) <= new Date(data.fecha_inicio))
      return NextResponse.json({ error: "La fecha de fin debe ser posterior a la de inicio" }, { status: 400 })

    const curso = await prisma.curso.create({
      data: {
        codigo: data.codigo,
        titulo: data.titulo,
        descripcion: data.descripcion || null,
        precio_total: Number(data.precio_total),
        cupo_maximo: Number(data.cupo_maximo),
        duracion_horas: data.duracion_horas
          ? Number(data.duracion_horas)
          : null,
        nivel: data.nivel || null,
        activo: data.activo ?? true,

        fecha_inicio: data.fecha_inicio
          ? new Date(data.fecha_inicio)
          : null,

        fecha_fin: data.fecha_fin
          ? new Date(data.fecha_fin)
          : null,

        imagenes: data.imagenes || [],
      },
    })

    return NextResponse.json(curso)
  } catch (error) {
    console.error('Error al crear curso:', error)
    return NextResponse.json(
      { error: 'Error al crear curso' },
      { status: 500 }
    )
  }
}