'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCategoria } from '@/lib/actionsCategorias'


export default function CreateCategoriaForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-pink-900 mb-6">
        Crear Nueva Categoría
      </h2>

      <form
        action={(formData) => {
          startTransition(async () => {
            await createCategoria(formData)
            router.push('/admin/categorias')
          })
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre *
          </label>
          <input
            name="nombre"
            required
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>

       

        <div className="flex items-center gap-3">
          <input type="checkbox" name="activa" defaultChecked />
          <label>Categoría activa</label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
            className="bg-pink-700 text-white px-5 py-2 rounded"
          >
            {isPending ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </div>
      </form>
    </div>
  )
}