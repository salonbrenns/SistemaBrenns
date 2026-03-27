import { NextResponse, NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "../../../../auth"
import { withRasp } from "@/lib/withRasp" 

const prisma = new PrismaClient()

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// Lógica para crear pedidos
async function createPedidoHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { items, subtotal, costo_envio, total, nombre_cliente, correo_cliente, telefono_cliente } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    const pedido = await prisma.pedido.create({
      data: {
        usuario_id: Number(session.user.id),
        subtotal, costo_envio, total, nombre_cliente, correo_cliente,
        telefono_cliente: telefono_cliente || null,
        detalles: {
          create: items.map((item: CartItem) => ({
            producto_id: item.id,
            nombre_producto: item.nombre,
            precio_unitario: item.precio / 100,
            cantidad: item.cantidad,
            subtotal: (item.precio * item.cantidad) / 100,
          })),
        },
      },
    })
    return NextResponse.json({ ok: true, pedido_id: pedido.id })
  } catch (err) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// Lógica para obtener pedidos
async function getPedidosHandler() {
  try {
    const session = await auth()
    if (!session || !session.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const pedidos = await prisma.pedido.findMany({
      where: { usuario_id: Number(session.user.id) },
      include: { detalles: true },
      orderBy: { fecha_pedido: "desc" },
    })
    return NextResponse.json({ pedidos })
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

export const POST = withRasp(createPedidoHandler);
export const GET = withRasp(getPedidosHandler);