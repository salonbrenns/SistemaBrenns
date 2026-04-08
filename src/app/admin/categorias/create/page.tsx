import CreateCategoriaForm from '@/components/categorias/create-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Categoría',
}

export default function Page() {
  return (
    <main className="p-6">
      <CreateCategoriaForm />
    </main>
  )
}