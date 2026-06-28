'use client'

import Link from 'next/link'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useState, useTransition } from 'react'
import { toggleCategorias } from '@/lib/actionsCategorias'

export function CreateCategoria() {
  return (
    <Link
      href="/admin/categorias/create"
      className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-800 transition"
    >
      <PlusIcon className="h-5 w-5" />
      Nueva Categoría
    </Link>
  )
}

export function UpdateCategoria({ id }: { id: number }) {
  return (
    <Link
      href={`/admin/categorias/${id}/edit`}
      className="rounded-md p-2 hover:bg-green-100 transition"
      title="Editar categoría"
    >
      <PencilIcon className="h-4 w-4 text-green-700" />
    </Link>
  )
}

export function ToggleCategoria({
  id,
  nombre,
  activo,
}: {
  id: number
  nombre: string
  activo: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`rounded-md px-2 py-1 text-xs font-medium transition ${
          activo
            ? 'bg-red-50 text-red-700 hover:bg-red-100'
            : 'bg-green-50 text-green-700 hover:bg-green-100'
        }`}
      >
        {activo ? 'Desactivar' : 'Activar'}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {activo ? 'Desactivar categoría' : 'Activar categoría'}
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              ¿Deseas {activo ? 'desactivar' : 'activar'} la categoría{' '}
              <span className="font-medium text-gray-800 dark:text-white">&quot;{nombre}&quot;</span>?
              {activo && (
                <span className="block mt-1 text-gray-400">
                  La categoría dejará de aparecer en el catálogo pero no se eliminará.
                </span>
              )}
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  startTransition(async () => {
                    await toggleCategorias(id, !activo)
                    setOpen(false)
                  })
                }}
                disabled={isPending}
                className={`px-4 py-2 text-sm rounded-md text-white ${
                  activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPending
                  ? activo ? 'Desactivando...' : 'Activando...'
                  : activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}