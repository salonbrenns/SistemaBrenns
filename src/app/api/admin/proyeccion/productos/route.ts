// src/app/api/admin/proyeccion/productos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get('categoria_id') ? Number(searchParams.get('categoria_id')) : null
    const marcaId     = searchParams.get('marca_id')     ? Number(searchParams.get('marca_id'))     : null

    // ── 1. Traer productos con variantes y detalles de pedidos ──────────────
    const productos = await prisma.producto.findMany({
      where: {
        activo:       true,
        ...(categoriaId && { categoria_id: categoriaId }),
        ...(marcaId    && { marca_id:      marcaId }),
      },
      include: {
        categoria: { select: { nombre: true } },
        marca:     { select: { nombre: true } },
        variantes: {
          where:  { activo: true },
          select: {
            id:          true,
            stock:       true,
            tono:        true,
            presentacion: true,
            precio_venta: true,
            detalles: {
              where: {
                pedido: { estado: { not: 'CANCELADO' } },
              },
              select: { cantidad: true },
            },
          },
        },
      },
      orderBy: { nombre: 'asc' },
    })

    // ── 2. Calcular stock total y ventas totales por producto ───────────────
    const resultado = productos.map((p) => {
      const stock_total   = p.variantes.reduce((s, v) => s + v.stock, 0)
      const ventas_totales = p.variantes.reduce(
        (s, v) => s + v.detalles.reduce((sv, d) => sv + d.cantidad, 0),
        0
      )
      const precio_min = p.variantes.length > 0
        ? Math.min(...p.variantes.map(v => Number(v.precio_venta)))
        : null

      return {
        id:             p.id,
        nombre:         p.nombre,
        imagen:         p.imagen,
        categoria:      p.categoria?.nombre ?? null,
        marca:          p.marca?.nombre     ?? null,
        stock_total,
        ventas_totales,
        precio_min,
      }
    })

    // ── 3. Ordenar por ventas totales desc ──────────────────────────────────
    resultado.sort((a, b) => b.ventas_totales - a.ventas_totales)

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en proyeccion/productos:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}