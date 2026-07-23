// src/app/api/usuario/recordatorios/route.ts
// Devuelve citas próximas (≤48h) y pedidos en tránsito del usuario autenticado
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const userId = Number(session.user.id)

  // Si el userId es inválido (NaN por UUID en sesión), devolver vacío sin explotar
  if (isNaN(userId)) {
    return NextResponse.json({ citasProximas: [], pedidosEnTransito: [] })
  }

  const ahora = new Date()
  const en48h = new Date(ahora.getTime() + 48 * 60 * 60 * 1000)

  try {
  const [citasProximas, pedidosEnTransito] = await Promise.all([
    // Citas en las próximas 48 horas con estado PENDIENTE o CONFIRMADA
    prisma.cita.findMany({
      where: {
        usuario_id: userId,
        fecha: { gte: ahora, lte: en48h },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
      include: { servicio: { select: { nombre: true } } },
      orderBy: [{ fecha: "asc" }, { hora: "asc" }],
    }),

    // Pedidos que aún no han sido entregados/cancelados
    prisma.pedido.findMany({
      where: {
        usuario_id: userId,
        estado: { in: ["PAGADO", "ENVIADO"] },
      },
      include: {
        detalles: {
          select: {
            cantidad: true,
            variante: {
              select: {
                tono: true,
                presentacion: true,
                producto: { select: { nombre: true } },
              },
            },
          },
        },
      },
      orderBy: { fecha_pedido: "desc" },
    }),
  ])

  return NextResponse.json({
    citasProximas: citasProximas.map(c => ({
      id:       c.id,
      servicio: c.servicio.nombre,
      fecha:    c.fecha.toISOString(),
      hora:     c.hora,
      estado:   c.estado,
    })),
    pedidosEnTransito: pedidosEnTransito.map(p => ({
      id:           p.id,
      estado:       p.estado,
      total:        Number(p.total),
      fecha_pedido: p.fecha_pedido.toISOString(),
      productos:    p.detalles.map(d => `${d.variante.producto.nombre} ×${d.cantidad}`).join(", "),
    })),
  })
  } catch (err) {
    console.error("[recordatorios]", err)
    return NextResponse.json({ citasProximas: [], pedidosEnTransito: [] })
  }
}
