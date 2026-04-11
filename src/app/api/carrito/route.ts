import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../auth'
import { prisma } from '@/lib/prisma'

// ─── Helper ───────────────────────────────────────────────────────────────────

async function getUsuarioId(): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return Number(session.user.id)
}

// ─── GET /api/carrito ─────────────────────────────────────────────────────────
// Devuelve todos los items del carrito del usuario con info de variante+producto

export async function GET() {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const items = await prisma.carritoItem.findMany({
    where: { usuario_id: usuarioId },
    include: {
      variante: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              imagen: true,
              marca:     { select: { nombre: true } },
              categoria: { select: { nombre: true } },
            },
          },
        },
      },
    },
    orderBy: { creado_en: 'asc' },
  })

  const serialized = items.map(item => ({
    id:           item.id,
    cantidad:     item.cantidad,
    variante_id:  item.variante_id,
    tono:         item.variante.tono,
    presentacion: item.variante.presentacion,
    precio_venta: Number(item.variante.precio_venta),
    stock:        item.variante.stock,
    producto: {
      id:        item.variante.producto.id,
      nombre:    item.variante.producto.nombre,
      imagen:    item.variante.producto.imagen,
      marca:     item.variante.producto.marca?.nombre ?? null,
      categoria: item.variante.producto.categoria?.nombre ?? null,
    },
  }))

  return NextResponse.json(serialized)
}

// ─── POST /api/carrito ────────────────────────────────────────────────────────
// Agrega o incrementa un item. Body: { variante_id, cantidad }

export async function POST(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { variante_id, cantidad = 1 } = await req.json()
  if (!variante_id) return NextResponse.json({ error: 'variante_id requerido' }, { status: 400 })

  // Verificar stock
  const variante = await prisma.variante.findUnique({ where: { id: variante_id } })
  if (!variante?.activo) {
    return NextResponse.json({ error: 'Variante no disponible' }, { status: 404 })
  }

  // Upsert: si ya existe suma cantidad, si no crea
  const existing = await prisma.carritoItem.findUnique({
    where: { usuario_id_variante_id: { usuario_id: usuarioId, variante_id } },
  })

  const nuevaCantidad = Math.min(
    (existing?.cantidad ?? 0) + cantidad,
    variante.stock  // nunca más que el stock
  )

  const item = await prisma.carritoItem.upsert({
    where: { usuario_id_variante_id: { usuario_id: usuarioId, variante_id } },
    update: { cantidad: nuevaCantidad, actualizado_en: new Date() },
    create: { usuario_id: usuarioId, variante_id, cantidad: nuevaCantidad },
  })

  return NextResponse.json({ ok: true, item })
}

// ─── PATCH /api/carrito ───────────────────────────────────────────────────────
// Cambia la cantidad de un item. Body: { id, cantidad }

export async function PATCH(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { id, cantidad } = await req.json()
  if (!id || cantidad == null) {
    return NextResponse.json({ error: 'id y cantidad requeridos' }, { status: 400 })
  }

  if (cantidad <= 0) {
    await prisma.carritoItem.deleteMany({ where: { id, usuario_id: usuarioId } })
    return NextResponse.json({ ok: true, eliminado: true })
  }

  const item = await prisma.carritoItem.updateMany({
    where: { id, usuario_id: usuarioId },
    data:  { cantidad, actualizado_en: new Date() },
  })

  return NextResponse.json({ ok: true, item })
}

// ─── DELETE /api/carrito ──────────────────────────────────────────────────────
// Elimina un item. Query param: ?id=X  o body vacío para vaciar 

export async function DELETE(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    await prisma.carritoItem.deleteMany({ where: { id: Number(id), usuario_id: usuarioId } })
  } else {
    // Vaciar carrito completo
    await prisma.carritoItem.deleteMany({ where: { usuario_id: usuarioId } })
  }

  return NextResponse.json({ ok: true })
}