import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
      take:    200,
    })
    return NextResponse.json(categorias)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}
