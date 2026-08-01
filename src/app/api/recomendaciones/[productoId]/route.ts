import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/recomendaciones/[productoId]
 * Consulta el microservicio Python (Apriori). Si no responde o no hay reglas
 * para el producto, usa un respaldo: populares de la misma categoría, y si
 * tampoco hay, populares de todo el catálogo (la sección nunca queda vacía).
 */

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://127.0.0.1:8000'
const NUM_RECOMENDACIONES = 4

type ReglaML = {
  producto_id: number
  nombre: string
  soporte: number
  confianza: number
  lift: number
}

const includeCompleto = {
  marca: { select: { nombre: true } },
  categoria: { select: { nombre: true } },
  variantes: { where: { activo: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.ProductoInclude

type ProductoConRelaciones = Prisma.ProductoGetPayload<{ include: typeof includeCompleto }>

async function consultarModelo(productoId: number): Promise<ReglaML[] | null> {
  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 2500)
    const res = await fetch(
      `${ML_URL}/recomendaciones/${productoId}?n=${NUM_RECOMENDACIONES}`,
      { signal: ctrl.signal, cache: 'no-store' },
    )
    clearTimeout(timeout)
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data.recomendaciones) ? data.recomendaciones : null
  } catch {
    return null // servicio apagado: usamos el respaldo
  }
}

async function cargarProductos(ids: number[]): Promise<ProductoConRelaciones[]> {
  const productos = await prisma.producto.findMany({
    where: { id: { in: ids }, activo: true, variantes: { some: { activo: true, stock: { gt: 0 } } } },
    include: includeCompleto,
  })
  // conservar el orden del modelo (mejor lift primero)
  const porId = new Map(productos.map(p => [p.id, p]))
  return ids
    .map(id => porId.get(id))
    .filter((p): p is ProductoConRelaciones => p !== undefined)
}

async function respaldoPopulares(
  productoId: number,
): Promise<{ productos: ProductoConRelaciones[]; categorico: boolean }> {
  const actual = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { categoria_id: true },
  })

  const base = {
    activo: true,
    variantes: { some: { activo: true, stock: { gt: 0 } } },
  } as const

  // Nivel 1: populares de la misma categoría.
  const deLaCategoria = await prisma.producto.findMany({
    where: { id: { not: productoId }, categoria_id: actual?.categoria_id ?? undefined, ...base },
    include: includeCompleto,
    orderBy: { favoritos: { _count: 'desc' } },
    take: NUM_RECOMENDACIONES,
  })
  if (deLaCategoria.length > 0) return { productos: deLaCategoria, categorico: true }

  // Nivel 2: la categoría no tenía suficientes productos disponibles (o ninguno);
  // en vez de dejar la sección vacía, se usan los más populares de TODO el catálogo.
  const deTodoElCatalogo = await prisma.producto.findMany({
    where: { id: { not: productoId }, ...base },
    include: includeCompleto,
    orderBy: { favoritos: { _count: 'desc' } },
    take: NUM_RECOMENDACIONES,
  })
  return { productos: deTodoElCatalogo, categorico: false }
}

function aCard(p: ProductoConRelaciones) {
  return {
    id: p.id,
    nombre: p.nombre,
    precio_min: Math.min(...p.variantes.map(v => Number(v.precio_venta))),
    en_stock: p.variantes.some(v => v.stock > 0),
    imagen: p.imagen,
    marca: p.marca,
    categoria: p.categoria,
    variantes: p.variantes.map(v => ({
      id: v.id,
      tono: v.tono ?? null,
      presentacion: v.presentacion ?? null,
      precio_venta: Number(v.precio_venta),
      stock: v.stock,
    })),
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productoId: string }> },
) {
  try {
    const { productoId } = await params
    const id = Number(productoId)
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'id inválido' }, { status: 400 })
    }

    const reglas = await consultarModelo(id)

    if (reglas && reglas.length > 0) {
      const productos = await cargarProductos(reglas.map(r => r.producto_id))
      if (productos.length > 0) {
        const metricas = new Map(reglas.map(r => [r.producto_id, r]))
        return NextResponse.json({
          fuente: 'apriori',
          productos: productos.map(p => ({
            ...aCard(p),
            confianza: metricas.get(p.id)?.confianza ?? null,
            lift: metricas.get(p.id)?.lift ?? null,
          })),
        })
      }
    }

    // Respaldo: populares de categoría, o de todo el catálogo si no hay de la categoría.
    const { productos: populares, categorico } = await respaldoPopulares(id)
    return NextResponse.json({
      fuente: categorico ? 'populares_categoria' : 'populares_catalogo',
      productos: populares.map(p => ({ ...aCard(p), confianza: null, lift: null })),
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener recomendaciones' }, { status: 500 })
  }
}
