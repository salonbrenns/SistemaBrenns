// src/app/admin/servicios/editar/[id]/page.tsx
import EditServicioForm from '@/components/servicios/edit-form'
import { prisma }       from '@/lib/prisma'
import { notFound }     from 'next/navigation'
import { Metadata }     from 'next'

export const metadata: Metadata = {
  title: 'Editar Servicio',
  description: 'Editar un servicio',
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [servicio, categorias] = await Promise.all([
    prisma.servicio.findUnique({
      where: { id: Number(id) },
      select: {
        id:           true,
        nombre:       true,
        descripcion:  true,
        precio:       true,
        duracion:     true,
        imagen:       true,
        beneficios:   true,
        incluye:      true,
        activo:       true,
        categoria_id: true,
      },
    }),
    prisma.categoriaServicio.findMany({
      where:   { activo: true },
      select:  { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    }),
  ])

  if (!servicio) notFound()

  return (
    <main className="p-6">
      <EditServicioForm
        categorias={categorias}
        servicio={{
          ...servicio,
          precio: Number(servicio.precio),
        }}
      />
    </main>
  )
}