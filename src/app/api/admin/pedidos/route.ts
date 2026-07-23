import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { sendPedidoEstado } from '@/lib/email'
import type { Prisma } from '@prisma/client'

const PAGE_SIZE = 15

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const pageNum = Math.max(1, Number(searchParams.get('page')) || 1)
  const estado  = searchParams.get('estado') || ''

  const where: Prisma.PedidoWhereInput = estado && estado !== 'TODOS'
    ? { estado: estado as Prisma.PedidoWhereInput['estado'] }
    : {}

  const [pedidosRaw, total] = await Promise.all([
    prisma.pedido.findMany({
      where,
      include: {
        usuario: { select: { nombre: true, correo: true } },
        detalles: {
          include: {
            variante: {
              include: {
                producto: { select: { nombre: true } },
              },
            },
          },
        },
      },
      orderBy: { fecha_pedido: 'desc' },
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.pedido.count({ where }),
  ])

  return NextResponse.json({
    pedidos: pedidosRaw.map((p) => ({
      id:              p.id,
      estado:          p.estado,
      total:           Number(p.total),
      nombre_cliente:  p.nombre_cliente,
      correo_cliente:  p.correo_cliente,
      fecha_pedido:    p.fecha_pedido.toISOString(),
      usuario:         p.usuario,
      total_items:     p.detalles.reduce((s, d) => s + d.cantidad, 0),
      comprobante_url: p.comprobante_url,
      detalles:        p.detalles.map((d) => ({
        id:                   d.id,
        cantidad:             d.cantidad,
        precio_unitario:      Number(d.precio_unitario),
        subtotal:             Number(d.subtotal),
        nombre_producto:      d.variante.producto.nombre,
        descripcion_variante: [d.variante.tono, d.variante.presentacion].filter(Boolean).join(' / ') || null,
      })),
    })),
    total,
    totalPaginas: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    paginaActual: pageNum,
  })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id, estado } = await req.json()
  const estadosValidos = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']
  if (!id || !estadosValidos.includes(estado)) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const pedido = await prisma.pedido.update({
    where:   { id: Number(id) },
    data:    { estado },
    include: {
      detalles: {
        select: {
          cantidad: true,
          variante: {
            select: {
              tono: true,
              presentacion: true,
              producto: {
                select: { nombre: true },
              },
            },
          },
        },
      },
    },
  })

  if (estado === 'CANCELADO') {
    const detalles = await prisma.detallePedido.findMany({ where: { pedido_id: id } })
    for (const d of detalles) {
      await prisma.variante.update({
        where: { id: d.variante_id },
        data:  { stock: { increment: d.cantidad } },
      })
    }
  }

  if (['PAGADO', 'ENVIADO', 'ENTREGADO'].includes(estado)) {
    const estadoEmail = estado === 'ENVIADO' ? 'EN_CAMINO' : estado === 'PAGADO' ? 'EN_PREPARACION' : estado
    sendPedidoEstado({
      to:        pedido.correo_cliente,
      nombre:    pedido.nombre_cliente,
      pedidoId:  pedido.id,
      estado:    estadoEmail as 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO',
      productos: pedido.detalles.map(d => `${d.variante.producto.nombre} x${d.cantidad}`).join(', '),
    }).catch(err => console.error('Email pedido estado:', err))
  }

  return NextResponse.json({ ok: true, pedido })
}
