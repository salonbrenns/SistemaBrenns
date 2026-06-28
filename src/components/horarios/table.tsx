'use client'

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Horario {
  id:     number
  hora:   string
  activo: boolean
}

interface Props {
  horarios: Horario[]
}

const HORAS_SUGERIDAS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
]

export default function HorariosTable({ horarios }: Props) {
  const router           = useRouter()
  const [nuevaHora,      setNuevaHora]      = useState("")
  const [agregando,      setAgregando]      = useState(false)
  const [eliminando,     setEliminando]     = useState<number | null>(null)
  const [toggling,       setToggling]       = useState<number | null>(null)
  const [error,          setError]          = useState("")

  const agregar = async () => {
    if (!nuevaHora) { setError("Selecciona una hora"); return }
    const yaExiste = horarios.some(h => h.hora === nuevaHora)
    if (yaExiste) { setError("Ese horario ya existe"); return }

    setAgregando(true)
    setError("")
    const res = await fetch("/api/admin/horarios", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ hora: nuevaHora }),
    })
    if (res.ok) { setNuevaHora(""); router.refresh() }
    else setError("Error al agregar horario")
    setAgregando(false)
  }

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return
    setEliminando(id)
    const res = await fetch(`/api/admin/horarios/${id}`, { method: "DELETE" })
    if (res.ok) router.refresh()
    else alert("Error al eliminar")
    setEliminando(null)
  }

  const toggleActivo = async (id: number, activo: boolean) => {
    setToggling(id)
    await fetch(`/api/admin/horarios/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ activo: !activo }),
    })
    router.refresh()
    setToggling(null)
  }

  return (
    <div className="mt-6 space-y-6">

      {/* Agregar nuevo horario */}
      <div className="flex items-end gap-4 bg-pink-50 rounded-xl p-5 border border-pink-100">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Agregar horario disponible
          </label>
          <select
            value={nuevaHora}
            onChange={e => { setNuevaHora(e.target.value); setError("") }}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-pink-500"
          >
            <option value="">— Selecciona una hora —</option>
            {HORAS_SUGERIDAS.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
        </div>
        <button
          onClick={agregar}
          disabled={agregando}
          className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-medium text-white hover:bg-pink-800 transition disabled:opacity-50 whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" />
          {agregando ? "Agregando..." : "Agregar"}
        </button>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {horarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  No hay horarios configurados. Agrega el primero arriba.
                </td>
              </tr>
            ) : (
              horarios.map(h => (
                <tr key={h.id} className="hover:bg-pink-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{h.hora}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActivo(h.id, h.activo)}
                      disabled={toggling === h.id}
                      className="flex items-center gap-2 group"
                    >
                      <div className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                        h.activo ? "bg-pink-600" : "bg-gray-300"
                      }`}>
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          h.activo ? "translate-x-5" : "translate-x-1"
                        }`} />
                      </div>
                      <span className={`text-xs font-medium ${h.activo ? "text-green-600" : "text-gray-400"}`}>
                        {toggling === h.id ? "..." : h.activo ? "Activo" : "Inactivo"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => eliminar(h.id)}
                      disabled={eliminando === h.id}
                      className="rounded-md p-2 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4 text-red-700" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}