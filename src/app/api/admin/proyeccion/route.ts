import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PeriodoVenta {
  periodo: string   // "2024-01", "2024-W03", "2024-01-15"
  total:   number   // unidades vendidas
}

interface ProyeccionResult {
  historico:   PeriodoVenta[]
  proyectado:  PeriodoVenta[]
  formula: {
    P0: number        // ventas periodo inicial
    k:  number        // tasa de crecimiento
    periodos: number  // t total
  }
  productos_top: {
    nombre:         string
    variante:       string | null
    total_vendido:  number
    stock_actual:   number
    imagen:         unknown
  }[]
  totales: {
    real:      number
    proyeccion_siguiente: number
  }
}

// ─── Función: agrupar por periodo ─────────────────────────────────────────────
function formatPeriodo(fecha: Date, granularidad: string): string {
  // Ajustar a UTC-6 (México)
  const offset = -6
  const local  = new Date(fecha.getTime() + offset * 60 * 60 * 1000)

  const anio = local.getUTCFullYear()
  const mes  = local.getUTCMonth()
  const dia  = local.getUTCDate()

  if (granularidad === 'dia') {
    return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  if (granularidad === 'semana') {
    const startOfYear  = new Date(Date.UTC(anio, 0, 1))
    const diff         = local.getTime() - startOfYear.getTime()
    const week         = Math.ceil((diff / 86400000 + startOfYear.getUTCDay() + 1) / 7)
    return `${anio}-W${String(week).padStart(2, '0')}`
  }

  // mes
  return `${anio}-${String(mes + 1).padStart(2, '0')}`
}

// ─── Función: modelo exponencial ─────────────────────────────────────────────
// P = P₀ × e^(k×t)
// k = ln(P / P₀) / t
function calcularProyeccion(historico: PeriodoVenta[], periodosAdelante: number, granularidad: string): {
  proyectado: PeriodoVenta[]
  P0: number
  k: number
} {
  if (historico.length < 2) {
    const P0 = historico[0]?.total ?? 0
    return {
      proyectado: Array.from({ length: periodosAdelante }, (_, i) => ({
        periodo: calcularFechaFutura(historico[0]?.periodo ?? '', i + 1, granularidad),
        total:   Math.round(P0),
      })),
      P0,
      k: 0,
    }
  }

  const P0 = historico[0].total
  const Pn = historico[historico.length - 1].total
  const t  = historico.length - 1
  const k  = Math.log(Math.max(Pn, 0.001) / Math.max(P0, 0.001)) / t

  const proyectado: PeriodoVenta[] = Array.from({ length: periodosAdelante }, (_, i) => {
    const tFuturo = t + i + 1
    const valor   = P0 * Math.exp(k * tFuturo)
    return {
      periodo: calcularFechaFutura(historico[historico.length - 1].periodo, i + 1, granularidad),
      total:   Math.round(Math.max(valor, 0)),
    }
  })

  return { proyectado, P0, k }
}

// ── Nueva función: calcula la fecha real siguiente ────────────────────────────
function calcularFechaFutura(ultimoPeriodo: string, n: number, granularidad: string): string {
  if (granularidad === 'dia') {
    const fecha = new Date(ultimoPeriodo + 'T12:00:00Z')
    fecha.setUTCDate(fecha.getUTCDate() + n)
    return fecha.toISOString().split('T')[0]  // "2026-04-12"
  }

  if (granularidad === 'semana') {
    // Parsear "2026-W15" → sumar n semanas
    const [anio, semStr] = ultimoPeriodo.split('-W')
    const semana = Number(semStr) + n
    const semanaFinal = semana > 52 ? semana - 52 : semana
    const anioFinal   = semana > 52 ? Number(anio) + 1 : Number(anio)
    return `${anioFinal}-W${String(semanaFinal).padStart(2, '0')}`
  }

  // mes: "2026-04" → sumar n meses
  const [anio, mes] = ultimoPeriodo.split('-').map(Number)
  const fecha = new Date(anio, mes - 1 + n, 1)
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
}

// ─── GET /api/admin/proyeccion ────────────────────────────────────────────────
// Query params:
//   granularidad = 'dia' | 'semana' | 'mes'  (default: 'mes')
//   filtro       = 'producto' | 'categoria' | 'marca'  (default: ninguno)
//   filtro_id    = number  (id del producto/categoria/marca)
//   periodos_adelante = number  (default: 3)

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const granularidad      = searchParams.get('granularidad') ?? 'mes'
    const filtro            = searchParams.get('filtro') ?? null        // 'producto' | 'categoria' | 'marca'
    const filtroId          = searchParams.get('filtro_id')
      ? Number(searchParams.get('filtro_id'))
      : null
    const periodosAdelante  = Number(searchParams.get('periodos_adelante') ?? 3)

    // ── 1. Construir WHERE dinámico según filtro ──────────────────────────────
    const whereProducto: Record<string, unknown> = { activo: true }

    if (filtro === 'categoria' && filtroId) {
      whereProducto.categoria_id = filtroId
    } else if (filtro === 'marca' && filtroId) {
      whereProducto.marca_id = filtroId
    }

    // Filtro por producto individual: se aplica en variante
    const whereVariante: Record<string, unknown> = {}
    if (filtro === 'producto' && filtroId) {
      whereVariante.producto_id = filtroId
    }

    // ── 2. Traer detalles de pedidos con sus fechas ───────────────────────────
    const detalles = await prisma.detallePedido.findMany({
      where: {
        variante: {
          ...whereVariante,
          producto: whereProducto,
        },
        pedido: {
          estado: { not: 'CANCELADO' },
        },
      },
      include: {
        pedido:  { select: { fecha_pedido: true } },
        variante: {
          include: {
            producto: {
              select: {
                id:          true,
                nombre:      true,
                imagen:      true,
                categoria_id: true,
                marca_id:    true,
              },
            },
          },
        },
      },
    })

    // ── 3. Agrupar por periodo ────────────────────────────────────────────────
    const mapaperiodos = new Map<string, number>()

    for (const d of detalles) {
      const periodo = formatPeriodo(d.pedido.fecha_pedido, granularidad)
      mapaperiodos.set(periodo, (mapaperiodos.get(periodo) ?? 0) + d.cantidad)
    }

    // Ordenar cronológicamente
    const historico: PeriodoVenta[] = Array.from(mapaperiodos.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, total]) => ({ periodo, total }))

    // ── 4. Calcular proyección exponencial ────────────────────────────────────
    const { proyectado, P0, k } = calcularProyeccion(historico, periodosAdelante, granularidad)

    // ── 5. Top productos más vendidos (con stock) ─────────────────────────────
    const mapaProductos = new Map<number, {
      nombre:        string
      variante:      string | null
      total_vendido: number
      stock_actual:  number
      imagen:        unknown
    }>()

    for (const d of detalles) {
      const productoId = d.variante.producto.id
      const actual     = mapaProductos.get(productoId)
      const atributos  = [d.variante.tono, d.variante.presentacion].filter(Boolean).join(' / ')

      if (actual) {
        actual.total_vendido += d.cantidad
      } else {
        mapaProductos.set(productoId, {
          nombre:        d.variante.producto.nombre,
          variante:      atributos || null,
          total_vendido: d.cantidad,
          stock_actual:  d.variante.stock,
          imagen:        d.variante.producto.imagen,
        })
      }
    }

    const productos_top = Array.from(mapaProductos.values())
      .sort((a, b) => b.total_vendido - a.total_vendido)
      .slice(0, 5)

    // ── 6. Totales ────────────────────────────────────────────────────────────
    const totalReal             = historico.reduce((s, p) => s + p.total, 0)
    const proyeccion_siguiente  = proyectado[0]?.total ?? 0

    const resultado: ProyeccionResult = {
      historico,
      proyectado,
      formula: {
        P0,
        k:       Math.round(k * 10000) / 10000,  // 4 decimales
        periodos: historico.length - 1,
      },
      productos_top,
      totales: {
        real:                 totalReal,
        proyeccion_siguiente,
      },
    }

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error en proyección:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}