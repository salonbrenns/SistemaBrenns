import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'


const prisma = new PrismaClient()

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany()
    return NextResponse.json(categorias)
  } catch {

    return NextResponse.json(
      { error: 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}