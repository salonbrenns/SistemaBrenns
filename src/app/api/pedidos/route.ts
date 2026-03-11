// src/app/api/pedidos/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "../../../../auth"

const prisma = new PrismaClient()

// 1. Definimos la interfaz para evitar el uso de 'any'
interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { 
      items, 
      subtotal, 
      costo_envio, 
      total, 
      nombre_cliente, 
      correo_cliente, 
      telefono_cliente 
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    // Crear pedido con sus detalles
    const pedido = await prisma.pedido.create({
      data: {
        usuario_id: Number(session.user.id),
        subtotal,
        costo_envio,
        total,
        nombre_cliente,
        correo_cliente,
        telefono_cliente: telefono_cliente || null,
        detalles: {
          // Aplicamos la interfaz CartItem aquí
          create: items.map((item: CartItem) => ({
            producto_id: item.id,
            nombre_producto: item.nombre,
            precio_unitario: item.precio / 100, // convertir de centavos
            cantidad: item.cantidad,
            subtotal: (item.precio * item.cantidad) / 100,
          })),
        },
      },
      include: { detalles: true },
    })

    return NextResponse.json({ ok: true, pedido_id: pedido.id })
  } catch (err) {
    console.error("Error creando pedido:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Obtener pedidos del usuario autenticado
export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const pedidos = await prisma.pedido.findMany({
      where: { usuario_id: Number(session.user.id) },
      include: { detalles: true },
      orderBy: { fecha_pedido: "desc" },
    })

    return NextResponse.json({ pedidos })
  } catch {
    // 2. Eliminamos 'err' porque no se estaba usando, resolviendo el warning
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}