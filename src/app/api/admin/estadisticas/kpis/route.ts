import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahora  = new Date()
  const hoy    = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
  const manana  = new Date(hoy.getTime() + 86_400_000)
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const pasadoManana = new Date(hoy.getTime() + 2 * 86_400_000)

  const STOCK_MINIMO = 5

  const [citasHoy, citasMes, pedidosMes, pedidosPendientes, clientesTotal, citasSinComprobante, productosStockBajo] = await Promise.all([
    prisma.cita.count({
      where: { fecha: { gte: hoy, lt: manana } },
    }),
    prisma.cita.count({
      where: { fecha: { gte: inicioMes } },
    }),
    prisma.pedido.count({
      where: { fecha_pedido: { gte: inicioMes } },
    }),
    prisma.pedido.count({
      where: { estado: 'PENDIENTE' },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM seguridad.tblusuarios
      WHERE rol::text = 'CLIENTE' AND activo = true
    `,
    // Citas hoy y mañana que son PENDIENTE (sin comprobante subido) por TRANSFERENCIA
    prisma.cita.findMany({
      where: {
        fecha:       { gte: hoy, lt: pasadoManana },
        estado:      "PENDIENTE",
        metodo_pago: "TRANSFERENCIA",
        comprobante: null,
      },
      select: {
        id:      true,
        hora:    true,
        fecha:   true,
        usuario: { select: { nombre: true } },
        servicio:{ select: { nombre: true } },
        nombre_contacto: true,
      },
      orderBy: { fecha: "asc" },
    }),
    // Variantes con stock bajo
    prisma.varianteProducto.findMany({
      where: { stock: { lte: STOCK_MINIMO }, activo: true },
      select: {
        id:    true,
        stock: true,
        nombre: true,
        producto: { select: { id: true, nombre: true } },
      },
      orderBy: { stock: "asc" },
      take: 20,
    }),
  ])

  return NextResponse.json({
    citasHoy,
    citasMes,
    pedidosMes,
    pedidosPendientes,
    clientesTotal: Number(clientesTotal[0].count),
    citasSinComprobante: citasSinComprobante.map(c => ({
      id:       c.id,
      hora:     c.hora,
      esHoy:    c.fecha >= hoy && c.fecha < manana,
      cliente:  c.usuario?.nombre || c.nombre_contacto || "Sin nombre",
      servicio: c.servicio.nombre,
    })),
    productosStockBajo: productosStockBajo.map(v => ({
      id:        v.id,
      producto:  v.producto.nombre,
      productoId: v.producto.id,
      variante:  v.nombre || null,
      stock:     v.stock,
      sinStock:  v.stock === 0,
    })),
  })
}
