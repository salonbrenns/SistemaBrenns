import { fetchCategoriaById } from '@/lib/dataCategorias'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import EditCategoriaForm from '@/components/categorias/edit-form'

export const metadata: Metadata = {
  title: 'Editar Categoría',
  description: 'Editar una categoría',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const categoria = await fetchCategoriaById(id)

  if (!categoria) {
    notFound()
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Categoría</h1>
      <EditCategoriaForm categoria={categoria} />
    </main>
  )
}