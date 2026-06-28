'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { UserCircle, ShieldCheck } from 'lucide-react'

type Cita = {
  id: number
  fecha: string
  hora: string
  estado: string
  notas: string | null
  nombre_contacto: string | null
  telefono_contacto: string | null
  metodo_pago: string | null
  cancelado_por: string | null
  cancelado_en: string | null
  usuario: { nombre: string; correo: string; telefono: string | null } | null
  servicio: { nombre: string; precio: number }
}

const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA']

const estadoConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  CONFIRMADA: { label: 'Confirmada', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'         },
  COMPLETADA: { label: 'Completada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'     },
  CANCELADA:  { label: 'Cancelada',  color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'             },
}

export default function CitasTable({
  citas = [],
  estadoFiltro,
  desdeFiltro,
  hastaFiltro,
}: {
  citas: Cita[]
  estadoFiltro: string
  desdeFiltro: string
  hastaFiltro: string
}) {
  const router   = useRouter()
  const pathname = usePathname()
  const [cambiando, setCambiando] = useState<number | null>(null)

  const aplicarFiltro = (updates: Record<string, string>) => {
    const params = new URLSearchParams()
    const merged = {
      estado: estadoFiltro,
      desde:  desdeFiltro,
      hasta:  hastaFiltro,
      ...updates,
    }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`${pathname}?${params.toString()}`)
  }

  const limpiar = () => router.push(pathname)

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

  const hayFiltros = estadoFiltro || desdeFiltro || hastaFiltro

  return (
    <div className="space-y-4">

      {/* ── Filtros ── */}
      <div className="bg-pink-50 dark:bg-gray-800 rounded-xl p-4 border border-pink-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-end">

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Estado</label>
            <select
              value={estadoFiltro}
              onChange={e => aplicarFiltro({ estado: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-pink-400"
            >
              <option value="">Todos</option>
              {ESTADOS.map(e => <option key={e} value={e}>{estadoConfig[e].label}</option>)}
            </select>
          </div>

          {/* Desde */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={desdeFiltro}
              onChange={e => aplicarFiltro({ desde: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Hasta */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={hastaFiltro}
              min={desdeFiltro || undefined}
              onChange={e => aplicarFiltro({ hasta: e.target.value })}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:border-pink-400"
            />
          </div>

          {/* Atajos rápidos */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Hoy',       fn: () => { const h = hoy(); aplicarFiltro({ desde: h, hasta: h }) } },
              { label: 'Esta semana', fn: () => { const { d, h } = semana(); aplicarFiltro({ desde: d, hasta: h }) } },
              { label: 'Este mes',  fn: () => { const { d, h } = mes();    aplicarFiltro({ desde: d, hasta: h }) } },
            ].map(a => (
              <button key={a.label} onClick={a.fn}
                className="px-3 py-2 text-xs font-semibold border border-pink-200 dark:border-gray-600 text-pink-600 dark:text-pink-400 rounded-lg hover:bg-pink-50 dark:hover:bg-gray-700 transition">
                {a.label}
              </button>
            ))}
          </div>

          {hayFiltros && (
            <button onClick={limpiar} className="text-sm text-pink-600 dark:text-pink-400 font-medium hover:underline self-end pb-2">
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contador */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {citas.length} cita{citas.length !== 1 ? 's' : ''} encontrada{citas.length !== 1 ? 's' : ''}
      </p>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-pink-900 dark:bg-pink-950">
            <tr>
              {['Cliente', 'Servicio', 'Fecha / Hora', 'Estado', 'Notas', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {citas.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay citas con los filtros aplicados
                </td>
              </tr>
            ) : citas.map(cita => {
              const cfg   = estadoConfig[cita.estado] || estadoConfig.PENDIENTE
              const fecha = new Date(cita.fecha).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
              })
              return (
                <tr key={cita.id} className="hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors">

                  {/* Cliente */}
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {cita.usuario?.nombre || cita.nombre_contacto || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{cita.usuario?.correo}</p>
                        {cita.usuario?.telefono && (
                          <p className="text-xs text-gray-400">{cita.usuario.telefono}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Servicio */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{cita.servicio.nombre}</p>
                    <p className="text-xs text-pink-600 font-bold">${cita.servicio.precio.toLocaleString()} MXN</p>
                  </td>

                  {/* Fecha / Hora */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                      <CalendarDaysIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      {fecha}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white mt-1">
                      <ClockIcon className="h-4 w-4 text-pink-400 flex-shrink-0" />
                      {cita.hora}
                    </div>
                  </td>

                  {/* Estado + info cancelación */}
                  <td className="px-4 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {cita.estado === 'CANCELADA' && cita.cancelado_por && (
                      <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {cita.cancelado_por === 'CLIENTE'
                          ? <UserCircle className="w-3 h-3 text-orange-400" />
                          : <ShieldCheck className="w-3 h-3 text-red-400" />
                        }
                        <span className={cita.cancelado_por === 'CLIENTE' ? 'text-orange-500 dark:text-orange-400 font-semibold' : 'text-red-500 dark:text-red-400 font-semibold'}>
                          {cita.cancelado_por === 'CLIENTE' ? 'Clienta' : 'Admin'}
                        </span>
                        {cita.cancelado_en && (
                          <span className="text-gray-400 dark:text-gray-500">
                            · {new Date(cita.cancelado_en).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Notas */}
                  <td className="px-4 py-4 max-w-[140px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cita.notas || '—'}</p>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {cita.estado === 'PENDIENTE' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'CONFIRMADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 text-blue-700 dark:text-blue-400 text-xs font-medium transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-3 w-3" /> Confirmar
                        </button>
                      )}
                      {cita.estado === 'CONFIRMADA' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'COMPLETADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-700 dark:text-green-400 text-xs font-medium transition disabled:opacity-50"
                        >
                          <CheckCircleIcon className="h-3 w-3" /> Completar
                        </button>
                      )}
                      {cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                        <button
                          onClick={() => cambiarEstado(cita.id, 'CANCELADA')}
                          disabled={cambiando === cita.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-700 dark:text-red-400 text-xs font-medium transition disabled:opacity-50"
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

// ── Helpers de rangos rápidos ──────────────────────────────────
function hoy() {
  return new Date().toISOString().slice(0, 10)
}
function semana() {
  const hoy = new Date()
  const dia = hoy.getDay() || 7 // lunes = 1
  const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - dia + 1)
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6)
  return { d: lunes.toISOString().slice(0, 10), h: domingo.toISOString().slice(0, 10) }
}
function mes() {
  const hoy = new Date()
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  return { d: inicio.toISOString().slice(0, 10), h: fin.toISOString().slice(0, 10) }
}
