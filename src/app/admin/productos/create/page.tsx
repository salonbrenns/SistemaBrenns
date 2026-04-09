import CreateProductoForm from '@/components/productos/create-form'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Producto',
}

export default async function Page() {
  const marcas = await prisma.marca.findMany({
    orderBy: { nombre: 'asc' },
  })
  const categorias = await prisma.categoria.findMany({
  orderBy: { nombre: 'asc' }
})
  return (
    <main className="p-6">
      <CreateProductoForm marcas={marcas} categorias={categorias} />
    </main>
  )
}