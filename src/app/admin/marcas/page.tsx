import { Metadata } from 'next'
import MarcaTable from '@/components/marcas/table'
import Search from '@/components/search'
import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Administración de marcas del salón',
}

interface Props {
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 5

export default async function MarcasPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params?.query || ''
  const currentPage = Number(params?.page) || 1

  const totalMarcas = await prisma.marca.count({
    where: { nombre: { contains: query, mode: 'insensitive' } },
  })

  const totalPages = Math.ceil(totalMarcas / ITEMS_PER_PAGE)

  const marcas = await prisma.marca.findMany({
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
        <h1 className="text-2xl font-bold text-pink-900">Marcas</h1>
      </div>

      <div className="flex items-center gap-4">
        <Suspense fallback={<div className="h-10 w-64 bg-gray-100 rounded-xl animate-pulse" />}>
          <Search placeholder="Buscar marcas..." />
        </Suspense>
      </div>

      <MarcaTable
        marcas={marcas}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  )
}