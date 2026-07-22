import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const marcas = await prisma.marca.findMany()
    return NextResponse.json(marcas)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener marcas' },
      { status: 500 }
    )
  }
}
