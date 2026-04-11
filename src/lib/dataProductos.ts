import { prisma } from '@/lib/prisma'
import { type VarianteForm } from '@/components/productos/variantesEditor'

// ─── Para el listado admin ─────────────────────────────────────────────────

export async function fetchProductos({
  query = '',
  page = 1,
  perPage = 10,
  sort = 'nombre',
  direction = 'asc',
}: {
  query?: string
  page?: number
  perPage?: number
  sort?: string
  direction?: string
}) {
  const where = query
    ? { nombre: { contains: query, mode: 'insensitive' as const } }
    : {}

  const orderBy: Record<string, string> = {}
  if (['nombre', 'activo', 'fecha_creacion'].includes(sort)) {
    orderBy[sort] = direction
  }

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        marca: { select: { nombre: true } },
        categoria: { select: { nombre: true } },
        variantes: {
          where: { activo: true },
          select: { id: true, precio_venta: true, stock: true, tono: true, presentacion: true },
        },
      },
    }),
    prisma.producto.count({ where }),
  ])

  return { productos, total, totalPages: Math.ceil(total / perPage) }
}

// ─── Para el edit-form ────────────────────────────────────────────────────

export async function fetchProductoById(id: string) {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: {
      marca: true,
      categoria: true,
      variantes: { orderBy: { id: 'asc' } },
    },
  })

  if (!producto) return null

  // Normalizar imágenes JsonValue → string[]
  const imagenes: string[] = Array.isArray(producto.imagen)
    ? (producto.imagen as string[]).filter(u => typeof u === 'string')
    : []

  // Normalizar variantes para VariantesEditor
  const variantes: VarianteForm[] = producto.variantes.map(v => ({
    id: v.id,
    codigo:       v.codigo       ?? '',
    tono:         v.tono         ?? '',
    presentacion: v.presentacion ?? '',
    precio_costo: v.precio_costo.toString(),
    precio_venta: v.precio_venta.toString(),
    stock:        v.stock.toString(),
    activo:       v.activo,
  }))

  return {
    id:           producto.id,
    nombre:       producto.nombre,
    descripcion:  producto.descripcion,
    marca_id:     producto.marca_id,
    categoria_id: producto.categoria_id,
    activo:       producto.activo,
    imagenes,
    variantes,
  }
}

// ─── Para el catálogo público ─────────────────────────────────────────────

export async function fetchProductosCatalogo() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: {
      marca:     { select: { nombre: true } },
      categoria: { select: { nombre: true } },
      variantes: {
        where: { activo: true },
        orderBy: { id: 'asc' },
        select: {
          id: true,
          tono: true,
          presentacion: true,
          precio_venta: true,
          stock: true,
          imagen: true,
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })

  return productos.map(p => ({
    id:          p.id,
    nombre:      p.nombre,
    descripcion: p.descripcion,
    marca:       p.marca,
    categoria:   p.categoria,
    imagen:      p.imagen,   // JsonValue — ProductoCard lo normaliza
    variantes:   p.variantes.map(v => ({
      id:           v.id,
      tono:         v.tono,
      presentacion: v.presentacion,
      precio_venta: Number(v.precio_venta),
      stock:        v.stock,
      imagen:       v.imagen,
    })),
    // Precio mínimo entre variantes activas (para mostrar "desde $X")
    precio_min: Math.min(...p.variantes.map(v => Number(v.precio_venta))),
    en_stock:   p.variantes.some(v => v.stock > 0),
  }))
}