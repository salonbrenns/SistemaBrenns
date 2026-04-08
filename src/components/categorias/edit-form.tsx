'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCategoria } from '@/lib/actionsCategorias';

interface Categoria {
  id: string | number;
  nombre: string;
}

export default function EditCategoriaForm({ categoria }: { categoria: Categoria }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await updateCategoria(categoria.id as number, formData)
          router.push('/admin/categorias')
         
        })
      }}
      className="space-y-4"
    >
      <input
        name="nombre"
        defaultValue={categoria.nombre}
        className="border p-2 rounded w-full"
      />

     <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/categorias')}
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