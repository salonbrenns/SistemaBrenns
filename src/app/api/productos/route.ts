import { NextResponse } from 'next/server'
import { fetchProductosCatalogo } from '@/lib/dataProductos'

export async function GET() {
  try {
    const productos = await fetchProductosCatalogo()
    return NextResponse.json(productos)
  } catch {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}