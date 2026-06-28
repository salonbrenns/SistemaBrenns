// src/app/api/paypal/create-order/route.ts
// Crea una orden en PayPal con el total del carrito del usuario
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL ?? "https://api-m.sandbox.paypal.com"

// ── Obtener access token de PayPal ────────────────────────────────────────────
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

// ── POST /api/paypal/create-order ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { nombre_cliente, correo_cliente, telefono_cliente } = await req.json()

    // Obtener carrito del usuario
    const carrito = await prisma.carritoItem.findMany({
      where: { usuario_id: Number(session.user.id) },
      include: {
        variante: {
          include: { producto: { select: { nombre: true } } },
        },
      },
    })

    if (carrito.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 })
    }

    // Calcular totales
    const ENVIO_GRATIS_DESDE = 1500
    const COSTO_ENVIO        = 100

    const subtotal = carrito.reduce((acc, item) => {
      return acc + (Number(item.variante.precio_venta) * item.cantidad)
    }, 0)
    const envio      = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
    const totalFinal = subtotal + envio

    // Construir items para PayPal
    const items = carrito.map(item => ({
      name:        item.variante.producto.nombre.slice(0, 127),
      unit_amount: { currency_code: "MXN", value: Number(item.variante.precio_venta).toFixed(2) },
      quantity:    String(item.cantidad),
    }))

    // Crear orden en PayPal
    const token = await getPayPalToken()
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
        "PayPal-Request-Id": `${session.user.id}-${Date.now()}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: "Compra en Salon Brenns",
          amount: {
            currency_code: "MXN",
            value:         totalFinal.toFixed(2),
            breakdown: {
              item_total: { currency_code: "MXN", value: subtotal.toFixed(2) },
              shipping:   { currency_code: "MXN", value: envio.toFixed(2) },
            },
          },
          items,
        }],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
              brand_name:                "Salon Brenns",
              locale:                    "es-MX",
              landing_page:              "LOGIN",
              user_action:               "PAY_NOW",
            },
          },
        },
      }),
    })

    if (!orderRes.ok) {
      const err = await orderRes.json()
      console.error("PayPal create-order error:", err)
      return NextResponse.json({ error: "Error al crear orden en PayPal" }, { status: 500 })
    }

    const order = await orderRes.json()

    // Guardar temporalmente los datos del cliente en la sesión para usarlos al capturar
    // (Los enviamos de vuelta al frontend para incluirlos en capture-order)
    return NextResponse.json({
      orderID:          order.id,
      nombre_cliente:   nombre_cliente,
      correo_cliente:   correo_cliente,
      telefono_cliente: telefono_cliente,
    })
  } catch (error) {
    console.error("PayPal create-order:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
