'use client'

import { useState, useTransition } from 'react'

export default function ToggleCurso({
  id,
  nombre,
  activo,
}: {
  id: number
  nombre?: string
  activo: boolean
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const toggle = async () => {
    await fetch(`/api/admin/cursos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ activo: !activo }),
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-2 py-1 text-xs rounded ${
          activo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}
      >
        {activo ? 'Desactivar' : 'Activar'}
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-96">

            <h2 className="font-semibold text-lg">
              {activo ? 'Desactivar curso' : 'Activar curso'}
            </h2>

            <p className="mt-2 text-sm">
              ¿Seguro que deseas cambiar el estado de 
              {nombre ?? 'este curso'}?
            </p>

            <div className="flex justify-end gap-3 mt-4">

              <button
                onClick={() => setOpen(false)}
                className="border px-3 py-1"
              >
                Cancelar
              </button>

              <button
                onClick={() =>
                  startTransition(async () => {
                    await toggle()
                    setOpen(false)
                    location.reload()
                  })
                }
                className="bg-pink-700 text-white px-3 py-1"
              >
                {isPending ? 'Procesando...' : 'Confirmar'}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  )
}