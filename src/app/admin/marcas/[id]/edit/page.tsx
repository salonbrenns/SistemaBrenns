import EditMarcaForm from '@/components/marcas/edit-form'
import { fetchMarcaById } from '@/lib/dataMarcas'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar Marca',
  description: 'Editar una marca',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const marca = await fetchMarcaById(id)

  if (!marca) {
    notFound()
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Editar Marca</h1>
      <EditMarcaForm marca={marca} />
    </main>
  )
}