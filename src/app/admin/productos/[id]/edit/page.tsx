import EditProductoForm from '@/components/productos/edit-form'
import { fetchProductoById } from '@/lib/dataProductos'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editar Producto',
  description: 'Editar un producto',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const producto = await fetchProductoById(id)

  if (!producto) {
    notFound()
  }

 
  const marcas = await prisma.marca.findMany({
    orderBy: { nombre: 'asc' },
  })
  const categorias = await prisma.categoria.findMany({
  orderBy: { nombre: 'asc' }
})

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Editar Producto</h1>
      <EditProductoForm producto={producto} marcas={marcas} categorias={categorias} />
    </main>
  )
}