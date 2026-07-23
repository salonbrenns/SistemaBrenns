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
        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-colors"
      />

     <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push('/admin/categorias')}
          className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded transition-colors"
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