// src/app/api/paypal/capture-order/route.ts
// Captura el pago aprobado y crea el pedido en la base de datos
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com"

async function getPayPalToken(): Promise<string> {
  const clientId     = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) throw new Error("No se pudo autenticar con PayPal")
  const data = await res.json()
  return data.access_token as string
}

// ── POST /api/paypal/capture-order ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { orderID, nombre_cliente, correo_cliente, telefono_cliente } = await req.json()

    if (!orderID) {
      return NextResponse.json({ error: "orderID requerido" }, { status: 400 })
    }

    // Capturar pago en PayPal
    const token = await getPayPalToken()
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    const captureData = await captureRes.json()

    if (!captureRes.ok || captureData.status !== "COMPLETED") {
      console.error("PayPal capture error:", captureData)
      return NextResponse.json({ error: "El pago no pudo completarse" }, { status: 400 })
    }

    // Pago exitoso — crear pedido en BD
    const carrito = await prisma.carritoItem.findMany({
      where: { usuario_id: Number(session.user.id) },
      include: {
        variante: {
          include: { producto: { select: { nombre: true } } },
        },
      },
    })

    if (carrito.length === 0) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 })
    }

    const ENVIO_GRATIS_DESDE = 1500
    const COSTO_ENVIO        = 100

    const subtotal = carrito.reduce((acc, item) => {
      return acc + (Number(item.variante.precio_venta) * item.cantidad)
    }, 0)
    const costoEnvio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
    const total      = subtotal + costoEnvio

    // Transacción: crear pedido + detalles + limpiar carrito + descontar stock
    const pedido = await prisma.$transaction(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuario_id:       Number(session.user.id),
          estado:           "PAGADO",
          subtotal,
          costo_envio:      costoEnvio,
          total,
          nombre_cliente:   nombre_cliente ?? session.user.name ?? "Cliente",
          correo_cliente:   correo_cliente ?? session.user.email ?? "",
          telefono_cliente: telefono_cliente ?? null,
          detalles: {
            create: carrito.map(item => ({
              variante_id:          item.variante_id,
              nombre_producto:      item.variante.producto.nombre,
              descripcion_variante: [item.variante.tono, item.variante.presentacion].filter(Boolean).join(' / ') || null,
              precio_unitario:      Number(item.variante.precio_venta),
              cantidad:             item.cantidad,
              subtotal:             Number(item.variante.precio_venta) * item.cantidad,
            })),
          },
        },
      })

      // Descontar stock
      for (const item of carrito) {
        await tx.variante.update({
          where: { id: item.variante_id },
          data:  { stock: { decrement: item.cantidad } },
        })
      }

      // Vaciar carrito
      await tx.carritoItem.deleteMany({ where: { usuario_id: Number(session.user.id) } })

      return nuevoPedido
    })

    return NextResponse.json({
      ok:       true,
      pedido_id: pedido.id,
      paypal_order_id: orderID,
    })
  } catch (error) {
    console.error('PayPal capture-order:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
