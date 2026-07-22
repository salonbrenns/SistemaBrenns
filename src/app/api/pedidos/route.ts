import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// ─── POST /api/pedidos ────────────────────────────────────────────────────────
// Crea el pedido, descuenta stock de cada variante y vacía el carrito.
// Body: { metodo_pago, nombre_cliente, correo_cliente, telefono_cliente }

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    const usuarioId = Number(session.user.id)

    const body = await req.json()
    const metodo_pago      = String(body.metodo_pago    ?? '').trim()
    const nombre_cliente   = String(body.nombre_cliente  ?? '').trim().slice(0, 200)
    const correo_cliente   = String(body.correo_cliente  ?? '').trim().toLowerCase().slice(0, 200)
    const telefono_cliente = body.telefono_cliente ? String(body.telefono_cliente).trim().slice(0, 30) : null

    if (!metodo_pago || !nombre_cliente || !correo_cliente) {
      return NextResponse.json({ error: 'Faltan datos del pedido' }, { status: 400 })
    }

    const METODOS_VALIDOS = ['transferencia', 'efectivo', 'tarjeta']
    if (!METODOS_VALIDOS.includes(metodo_pago)) {
      return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo_cliente)) {
      return NextResponse.json({ error: 'Correo electrónico no válido' }, { status: 400 })
    }

    // 1. Leer el carrito actual del usuario desde BD
    const carritoItems = await prisma.carritoItem.findMany({
      where: { usuario_id: usuarioId },
      include: {
        variante: {
          include: {
            producto: { select: { nombre: true } },
          },
        },
      },
    })

    if (carritoItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    // 2. Verificar stock (pre-check rápido para dar feedback inmediato)
    for (const item of carritoItems) {
      if (item.variante.stock < item.cantidad) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para "${item.variante.producto.nombre}"${
              item.variante.tono ? ` (${item.variante.tono})` : ''
            }. Disponible: ${item.variante.stock}`,
          },
          { status: 409 }
        )
      }
    }

    // 3. Calcular totales
    const COSTO_ENVIO        = 100
    const ENVIO_GRATIS_DESDE = 1500

    const subtotal   = carritoItems.reduce((s, i) => s + Number(i.variante.precio_venta) * i.cantidad, 0)
    const costo_envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
    const total      = subtotal + costo_envio

    // 4. una transacción: crear pedido + descontar stock + vaciar carrito
    const pedido = await prisma.$transaction(async (tx) => {
      // 4a. Re-verificar stock dentro de la transacción (previene race conditions)
      for (const item of carritoItems) {
        const varianteActual = await tx.variante.findUnique({
          where: { id: item.variante_id },
          select: { stock: true },
        })
        if (!varianteActual || varianteActual.stock < item.cantidad) {
          throw Object.assign(new Error("stock_insuficiente"), {
            nombre: item.variante.producto.nombre,
            tono:   item.variante.tono,
            disponible: varianteActual?.stock ?? 0,
          })
        }
      }

      // 4b. Crear pedido
      const nuevoPedido = await tx.pedido.create({
        data: {
          usuario_id:       usuarioId,
          subtotal,
          costo_envio,
          total,
          nombre_cliente,
          correo_cliente,
          telefono_cliente: telefono_cliente || null,
          metodo_pago:      metodo_pago || null,
          estado:           'PENDIENTE',
          detalles: {
            create: carritoItems.map((item) => {
              const atributos = [item.variante.tono, item.variante.presentacion]
                .filter(Boolean)
                .join(' / ')
              return {
                variante_id:          item.variante_id,
                nombre_producto:      item.variante.producto.nombre,
                descripcion_variante: atributos || null,
                precio_unitario:      Number(item.variante.precio_venta),
                cantidad:             item.cantidad,
                subtotal:             Number(item.variante.precio_venta) * item.cantidad,
              }
            }),
          },
        },
      })

      // 4c. Descontar stock de cada variante
      for (const item of carritoItems) {
        await tx.variante.update({
          where: { id: item.variante_id },
          data:  { stock: { decrement: item.cantidad } },
        })
      }

      // 4d. Vaciar carrito
      await tx.carritoItem.deleteMany({ where: { usuario_id: usuarioId } })

      return nuevoPedido
    })

    // 5. Emitir evento para que el Header actualice contador (solo funciona en cliente,
    //    aquí solo devolvemos la señal para que el cliente lo dispare)
    return NextResponse.json({
      ok:        true,
      pedido_id: pedido.id,
      total,
      metodo_pago,
    })
  } catch (error) {
    // Race condition: stock se agotó entre el pre-check y la transacción
    if (error instanceof Error && error.message === "stock_insuficiente") {
      const e = error as Error & { nombre?: string; tono?: string; disponible?: number }
      return NextResponse.json(
        {
          error: `Stock insuficiente para "${e.nombre ?? 'producto'}"${
            e.tono ? ` (${e.tono})` : ''
          }. Disponible: ${e.disponible ?? 0}`,
        },
        { status: 409 }
      )
    }
    console.error('Error creando pedido:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// ─── GET /api/pedidos ─────────────────────────────────────────────────────────
// Historial de pedidos del usuario autenticado

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const pedidos = await prisma.pedido.findMany({
      where:   { usuario_id: Number(session.user.id) },
      include: {
        detalles: {
          include: {
            variante: {
              include: { producto: { select: { nombre: true, imagen: true } } },
            },
          },
        },
      },
      orderBy: { fecha_pedido: 'desc' },
    })

    const serialized = pedidos.map((p) => ({
      id:               p.id,
      estado:           p.estado,
      subtotal:         Number(p.subtotal),
      costo_envio:      Number(p.costo_envio),
      total:            Number(p.total),
      nombre_cliente:   p.nombre_cliente,
      correo_cliente:   p.correo_cliente,
      telefono_cliente: p.telefono_cliente,
      fecha_pedido:     p.fecha_pedido.toISOString(),
      metodo_pago:      p.metodo_pago,
      comprobante_url:  p.comprobante_url,
      detalles: p.detalles.map((d) => ({
        id:                   d.id,
        nombre_producto:      d.nombre_producto,
        descripcion_variante: d.descripcion_variante,
        precio_unitario:      Number(d.precio_unitario),
        cantidad:             d.cantidad,
        subtotal:             Number(d.subtotal),
        imagen:               d.variante.producto.imagen,
      })),
    }))

    return NextResponse.json(serialized)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}