'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createMarca } from '@/lib/actionsMarcas'

export default function CreateMarcaForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-pink-900 dark:text-pink-300 mb-6">
        Crear Nueva Marca
      </h2>

      <form
        action={(formData) => {
          startTransition(async () => {
            await createMarca(formData)
            router.push('/admin/marcas')
          })
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre *
          </label>
          <input
            name="nombre"
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-colors"
          />
        </div>



        <div className="flex items-center gap-3">
          <input type="checkbox" name="activa" defaultChecked />
          <label className="text-sm text-gray-700 dark:text-gray-300">Marca activa</label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/marcas')}
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="bg-pink-700 hover:bg-pink-600 text-white px-5 py-2 rounded transition-colors"
          >
            {isPending ? 'Guardando...' : 'Guardar Marca'}
          </button>
        </div>
      </form>
    </div>
  )
}