'use client'

import { useRouter, usePathname } from 'next/navigation' // Se eliminó useSearchParams de aquí
import { useState } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'

type Cita = {
  id: number
  fecha: string
  hora: string
  estado: string
  notas: string | null
  nombre_contacto: string | null
  telefono_contacto: string | null
  metodo_pago: string | null
  usuario: { nombre: string; correo: string; telefono: string | null } | null
  servicio: { nombre: string; precio: number }
}

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const estadoConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100   text-blue-700'   },
  COMPLETADA: { label: 'Completada', color: 'bg-green-100  text-green-700'  },
  CANCELADA:  { label: 'Cancelada',  color: 'bg-red-100    text-red-700'    },
}

export default function CitasTable({
  citas = [],
  estadoFiltro,
  fechaFiltro,
}: {
  citas: Cita[]
  estadoFiltro: string
  fechaFiltro: string
}) {
  const router   = useRouter()
  const pathname = usePathname()
  // Se eliminó la línea de searchParams que causaba el warning
  const [cambiando, setCambiando] = useState<number | null>(null)

  const aplicarFiltro = (key: string, value: string) => {
    const params = new URLSearchParams()
    if (key !== 'estado' && estadoFiltro) params.set('estado', estadoFiltro)
    if (key !== 'fecha'  && fechaFiltro)  params.set('fecha',  fechaFiltro)
    if (value) params.set(key, value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    setCambiando(id)
    await fetch(`/api/admin/citas/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ estado: nuevoEstado }),
    })
    router.refresh()
    setCambiando(null)
  }

  return (
    <div className="space-y-4">

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-pink-50 rounded-xl p-4 border border-pink-100">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
          <select
            value={estadoFiltro}
            onChange={e => aplicarFiltro('estado', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400"
          >
            <option value="">Todos</option>
            {ESTADOS.map(e => <option key={e} value={e}>{estadoConfig[e].label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={e => aplicarFiltro('fecha', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400"
          />
        </div>
        {(estadoFiltro || fechaFiltro) && (
          <div className="flex items-end">
            <button
              onClick={() => router.push(pathname)}
              className="text-sm text-pink-600 font-medium hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500">{citas.length} cita{citas.length !== 1 ? 's' : ''} encontrada{citas.length !== 1 ? 's' : ''}</p>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-900">
            <tr>
              {['Cliente', 'Servicio', 'Fecha', 'Hora', 'Estado', 'Notas', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {citas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                  No hay citas con los filtros aplicados
                </td>
              </tr>
            ) : citas.map(cita => {
              const cfg   = estadoConfig[cita.estado] || estadoConfig.PENDIENTE
              const fecha = new Date(cita.fecha).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
              })
              return (
                <tr key={cita.id} className="hover:bg-pink-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cita.usuario?.nombre || cita.nombre_contacto || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">{cita.usuario?.correo}</p>
                        {cita.usuario?.telefono && (
                          <p className="text-xs text-gray-400">{cita.usuario.telefono}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-900">{cita.servicio.nombre}</p>
                    <p className="text-xs text-pink-600 font-bold">${cita.servicio.precio.toLocaleString()} MXN</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <CalendarDaysIcon className="h-4 w-4 text-pink-400" />
                      {fecha}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                      <ClockIcon className="h-4 w-4 text-pink-400" />
                      {cita.hora}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 max-w-[150px]">
                    <p className="text-xs text-gray-500 truncate">{cita.notas || '—'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {cita.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'CONFIRMADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-3 w-3" /> Confirmar
                        </button>
                      )}
                      {cita.estado === 'CONFIRMADA' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'COMPLETADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-3 w-3" /> Completar
                        </button>
                      )}
                      {cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'CANCELADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition disabled:opacity-50"
                        >
                          <XCircleIcon className="h-3 w-3" /> Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}