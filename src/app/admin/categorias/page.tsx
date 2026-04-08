import { Metadata } from 'next'
import CategoriaTable from '@/components/categorias/table'
import Search from '@/components/search'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Administración de categorías del salón',
}

interface Props {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 5

export default async function CategoriasPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params?.query || ''
  const currentPage = Number(params?.page) || 1

  const totalCategorias = await prisma.categoria.count({
    where: { nombre: { contains: query, mode: 'insensitive' } },
  })

  const totalPages = Math.ceil(totalCategorias / ITEMS_PER_PAGE)

  const categorias = await prisma.categoria.findMany({
    select: {
      id: true,
      nombre: true,
      activo: true,
    },
    where: { nombre: { contains: query, mode: 'insensitive' } },
    orderBy: { id: 'asc' },
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-pink-900">Categorías</h1>
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="h-10 w-64 bg-gray-100 rounded-xl animate-pulse" />}>
          <Search placeholder="Buscar categorías..." />
        </Suspense>
      </div>

      <CategoriaTable
        categorias={categorias}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  )
}