import CreateServicioForm from '@/components/servicios/create-form'
import { prisma }         from '@/lib/prisma'
import { Metadata }       from 'next'
 
export const metadata: Metadata = {
  title: 'Crear Servicio',
}
 
export default async function Page() {
  const categorias = await prisma.categoriaServicio.findMany({
    where:   { activo: true },
    select:  { id: true, nombre: true },
    orderBy: { nombre: 'asc' },
  })
 
  return (
    <main className="p-6">
      <CreateServicioForm categorias={categorias} />
    </main>
  )
}