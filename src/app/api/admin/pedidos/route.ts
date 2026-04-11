import { NextRequest, NextResponse } from 'next/server'
import { auth } from '../../../../../auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/pedidos — todos los pedidos (solo admin)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const pedidos = await prisma.pedido.findMany({
    include: {
      usuario:  { select: { nombre: true, correo: true } },
      detalles: true,
    },
    orderBy: { fecha_pedido: 'desc' },
  })

  return NextResponse.json(
    pedidos.map((p) => ({
      id:             p.id,
      estado:         p.estado,
      total:          Number(p.total),
      nombre_cliente: p.nombre_cliente,
      correo_cliente: p.correo_cliente,
      fecha_pedido:   p.fecha_pedido.toISOString(),
      usuario:        p.usuario,
      total_items:    p.detalles.reduce((s, d) => s + d.cantidad, 0),

      detalles: p.detalles,
    }))
  )
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id, estado } = await req.json()
  const estadosValidos = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']
  if (!id || !estadosValidos.includes(estado)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const pedido = await prisma.pedido.update({
    where: { id: Number(id) },
    data:  { estado },
  })

  // Si se cancela, devolver stock
  if (estado === 'CANCELADO') {
    const detalles = await prisma.detallePedido.findMany({ where: { pedido_id: id } })
    for (const d of detalles) {
      await prisma.variante.update({
        where: { id: d.variante_id },
        data:  { stock: { increment: d.cantidad } },
      })
    }
  }

  return NextResponse.json({ ok: true, pedido })
}