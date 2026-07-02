import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'


const prisma = new PrismaClient()

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