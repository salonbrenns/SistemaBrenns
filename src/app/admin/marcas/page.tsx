import { Metadata } from 'next'
import MarcaTable from '@/components/marcas/table'
import Search from '@/components/search'
import { PrismaClient } from '@prisma/client'
import { Suspense } from 'react'


const prisma = new PrismaClient()

export const metadata: Metadata = {
  title: 'Marcas',
  description: 'Administración de marcas del salón',
}

export default async function MarcasPage() {
  const marcas = await prisma.marca.findMany({ orderBy: { id: 'asc' } })

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

      <MarcaTable marcas={marcas} />
    </div>
  )
}