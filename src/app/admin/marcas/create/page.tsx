import CreateMarcaForm from '@/components/marcas/create-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear Marca',
}

export default function Page() {
  return (
    <main className="p-6">
      <CreateMarcaForm />
    </main>
  )
}