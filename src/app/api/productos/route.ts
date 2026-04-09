import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRasp } from '@/lib/withRasp'

async function getProductosHandler(req: NextRequest) {
  try {
    const productos = await prisma.producto.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
        stock: true,
        activo: true,
        imagen: true,
        categoria: {
          select: {
            nombre: true
          }
        },
        marca: {
          select: { nombre: true }
        }
      },
      orderBy: { id: 'desc' }
    })
    return NextResponse.json(productos)
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export const GET = withRasp(getProductosHandler)