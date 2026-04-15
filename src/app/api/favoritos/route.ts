import { NextRequest, NextResponse } from 'next/server'
import { auth } from"@/lib/auth"

import { prisma } from '@/lib/prisma'

async function getUsuarioId(): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return Number(session.user.id)
}

// GET /api/favoritos — lista de favoritos del usuario
export async function GET() {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const favoritos = await prisma.favorito.findMany({
    where: { usuario_id: usuarioId },
    include: {
      producto: {
        select: {
          id: true,
          nombre: true,
          imagen: true,
          marca:     { select: { nombre: true } },
          categoria: { select: { nombre: true } },
          variantes: {
            where:  { activo: true },
            select: { precio_venta: true, stock: true },
          },
        },
      },
    },
    orderBy: { creado_en: 'desc' },
  })

  const serialized = favoritos.map(f => ({
    id:         f.id,
    producto_id: f.producto_id,
    producto: {
      id:        f.producto.id,
      nombre:    f.producto.nombre,
      imagen:    f.producto.imagen,
      marca:     f.producto.marca?.nombre ?? null,
      categoria: f.producto.categoria?.nombre ?? null,
      precio_min: Math.min(...f.producto.variantes.map(v => Number(v.precio_venta))),
      en_stock:   f.producto.variantes.some(v => v.stock > 0),
    },
  }))

  return NextResponse.json(serialized)
}

// POST /api/favoritos — toggle: agrega si no existe, elimina si existe
// Body: { producto_id }
export async function POST(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { producto_id } = await req.json()
  if (!producto_id) return NextResponse.json({ error: 'producto_id requerido' }, { status: 400 })

  const existe = await prisma.favorito.findUnique({
    where: { usuario_id_producto_id: { usuario_id: usuarioId, producto_id } },
  })

  if (existe) {
    await prisma.favorito.delete({ where: { id: existe.id } })
    return NextResponse.json({ ok: true, accion: 'eliminado' })
  }

  await prisma.favorito.create({ data: { usuario_id: usuarioId, producto_id } })
  return NextResponse.json({ ok: true, accion: 'agregado' })
}

// DELETE /api/favoritos?id=X — elimina un favorito por id
export async function DELETE(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  await prisma.favorito.deleteMany({ where: { id: Number(id), usuario_id: usuarioId } })
  return NextResponse.json({ ok: true })
}