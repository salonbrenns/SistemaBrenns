'use client'

import { useTransition } from 'react'
import { updateMarca } from '@/lib/actionsMarcas'
import { useRouter } from 'next/navigation'

interface Marca {
  id: string | number;
  nombre: string;
}

export default function EditMarcaForm({ marca }: { marca: Marca }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateMarca(marca.id as number, formData)
          router.push('/admin/marcas')
         
        })
      }}
      className="space-y-4"
    >
      <input
        name="nombre"
        defaultValue={marca.nombre}
        className="border p-2 rounded w-full"
      />
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/marcas')}
          className="border px-4 py-2 rounded"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="bg-pink-600 text-white px-4 py-2 rounded"
        >
          {isPending ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>
    </form>
  )
}