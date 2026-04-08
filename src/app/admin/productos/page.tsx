import { Metadata } from 'next'
import ProductoTable from '@/components/productos/table'
import ProductoFilter from '@/components/productos/filtroProduc'
import Search from '@/components/search'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Productos',
  description: 'Administración de productos del salón',
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    query?: string
    categoria?: string
    marca?: string
  }>
}) {
  const params = await searchParams

  const page = Number(params.page) || 1
  const query = params.query || ''
  const categoriaId = params.categoria ? Number(params.categoria) : undefined
  const marcaId = params.marca ? Number(params.marca) : undefined

  const take = 10
  const skip = (page - 1) * take

  const where = {
    ...(query
      ? {
          OR: [
            { nombre: { contains: query, mode: 'insensitive' as const } },
            { codigo: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(categoriaId ? { categoria_id: categoriaId } : {}),
    ...(marcaId ? { marca_id: marcaId } : {}),
  }

  const [totalProductos, productosRaw, categorias, marcas] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        precio_venta: true,
        precio_costo: true,
        stock: true,
        imagen: true,
        activo: true,
        marca: { select: { nombre: true } },
        categoria: { select: { nombre: true } },
      },
      orderBy: { id: 'asc' },
      take,
      skip,
    }),
    prisma.categoria.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
    prisma.marca.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  const productos = productosRaw.map((p) => ({
    ...p,
    precio_venta: Number(p.precio_venta),
    precio_costo: Number(p.precio_costo),
  }))

  const totalPages = Math.ceil(totalProductos / take)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-pink-900">Productos</h1>

      <Search placeholder="Buscar productos..." />

      <ProductoFilter categorias={categorias} marcas={marcas} />

      <ProductoTable
        productos={productos}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}