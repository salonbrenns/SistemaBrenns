'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { UserCircle, ShieldCheck, CheckCircle, XCircle, ClipboardCheck } from 'lucide-react'
import Paginacion from '@/components/ui/paginacion'
import DropdownAcciones, { DropdownItem, DropdownSeparator } from '@/components/ui/DropdownAcciones'

const POR_PAGINA = 10

type Cita = {
  id: number
  fecha: string
  hora: string
  estado: string
  estado_cita: string
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

// Confirmación de pago
const estadoConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Sin pagar',        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  CONFIRMADA: { label: 'Pago confirmado',  color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'         },
  COMPLETADA: { label: 'Completada',       color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'     },
  CANCELADA:  { label: 'Cancelada',        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'             },
}

// Estado de realización de la cita
const estadoCitaConfig: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  FINALIZADA: { label: 'Finalizada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'     },
  COMPLETADA: { label: 'Finalizada', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'     },
  CANCELADA:  { label: 'Cancelada',  color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'             },
  EN_PROCESO: { label: 'En proceso', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
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
  const [cambiando,     setCambiando]     = useState<number | null>(null)
  const [cambiandoCita, setCambiandoCita] = useState<number | null>(null)
  const [pagina,        setPagina]        = useState(1)

  const totalPaginas = Math.ceil(citas.length / POR_PAGINA)
  const citasPagina  = citas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

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
    try {
      await fetch(`/api/admin/citas/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado: nuevoEstado }),
      })
      router.refresh()
    } catch {
      console.error('Error al cambiar estado')
    } finally {
      setCambiando(null)
    }
  }

  const cambiarEstadoCita = async (id: number, nuevoEstado: string) => {
    setCambiandoCita(id)
    try {
      await fetch(`/api/admin/citas/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ estado_cita: nuevoEstado }),
      })
      router.refresh()
    } catch {
      console.error('Error al cambiar estado de cita')
    } finally {
      setCambiandoCita(null)
    }
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
              { label: 'Hoy',        fn: () => { const h = hoy();    aplicarFiltro({ desde: h, hasta: h }) } },
              { label: 'Mañana',     fn: () => { const m = manana(); aplicarFiltro({ desde: m, hasta: m }) } },
              { label: 'Esta semana', fn: () => { const { d, h } = semana(); aplicarFiltro({ desde: d, hasta: h }) } },
              { label: 'Este mes',   fn: () => { const { d, h } = mes();    aplicarFiltro({ desde: d, hasta: h }) } },
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
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
              {['#', 'Cliente', 'Servicio', 'Fecha / Hora', 'Conf. Pago', 'Estado Cita', 'Notas', 'Acciones'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {citasPagina.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay citas con los filtros aplicados
                </td>
              </tr>
            ) : citasPagina.map((cita, idx) => {
              const num   = (pagina - 1) * POR_PAGINA + idx + 1
              const cfg   = estadoConfig[cita.estado] || estadoConfig.PENDIENTE
              const fecha = new Date(cita.fecha).toLocaleDateString('es-MX', {
                day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC'
              })

              // Si la hora de la cita ya pasó y no está cancelada, mostrar como Finalizada
              const fechaLocal = cita.fecha.slice(0, 10) // YYYY-MM-DD
              const citaDateTime = new Date(`${fechaLocal}T${cita.hora}:00`)
              const yaTermino = citaDateTime < new Date() && cita.estado !== 'CANCELADA'
              const estadoCitaMostrar =
                cita.estado === 'CANCELADA'
                  ? 'CANCELADA'
                  : yaTermino && (!cita.estado_cita || cita.estado_cita === 'PENDIENTE')
                    ? 'FINALIZADA'
                    : cita.estado_cita
              return (
                <tr key={cita.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">

                  {/* # */}
                  <td className="px-4 py-4 text-xs text-gray-400 font-mono">{num}</td>

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
                      {horaA12(cita.hora)}
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

                  {/* Estado Cita */}
                  <td className="px-4 py-4">
                    {estadoCitaMostrar ? (() => {
                      const cfgCita = estadoCitaConfig[estadoCitaMostrar] ?? { label: estadoCitaMostrar, color: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' }
                      return (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${cfgCita.color}`}>
                          {cfgCita.label}
                        </span>
                      )
                    })() : <span className="text-gray-400">—</span>}
                  </td>

                  {/* Notas */}
                  <td className="px-4 py-4 max-w-[140px]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{cita.notas || '—'}</p>
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-4">
                    <DropdownAcciones>
                      {cita.estado === 'PENDIENTE' && (
                        <DropdownItem
                          onClick={() => cambiarEstado(cita.id, 'CONFIRMADA')}
                          disabled={cambiando === cita.id}
                          icon={<CheckCircle className="w-4 h-4" />}
                          label="Confirmar pago"
                        />
                      )}
                      {estadoCitaMostrar !== 'FINALIZADA' && estadoCitaMostrar !== 'CANCELADA' && cita.estado !== 'CANCELADA' && (
                        <DropdownItem
                          onClick={() => cambiarEstadoCita(cita.id, 'FINALIZADA')}
                          disabled={cambiandoCita === cita.id}
                          icon={<ClipboardCheck className="w-4 h-4" />}
                          label="Finalizar cita"
                        />
                      )}
                      {cita.estado !== 'CANCELADA' && <DropdownSeparator />}
                      {cita.estado !== 'CANCELADA' && (
                        <DropdownItem
                          onClick={() => cambiarEstado(cita.id, 'CANCELADA')}
                          disabled={cambiando === cita.id}
                          icon={<XCircle className="w-4 h-4" />}
                          label="Cancelar cita"
                          danger
                        />
                      )}
                    </DropdownAcciones>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onChange={setPagina}
      />
    </div>
  )
}

// ── Helper AM/PM ──────────────────────────────────────────────
function horaA12(hora: string): string {
  const [h, m] = hora.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

// ── Helpers de rangos rápidos (fecha LOCAL, no UTC) ───────────
function fechaLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function hoy() {
  return fechaLocal(new Date())
}
function manana() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return fechaLocal(d)
}
function semana() {
  const hoy = new Date()
  const dia  = hoy.getDay() || 7
  const lunes   = new Date(hoy); lunes.setDate(hoy.getDate() - dia + 1)
  const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6)
  return { d: fechaLocal(lunes), h: fechaLocal(domingo) }
}
function mes() {
  const hoy  = new Date()
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const fin    = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
  return { d: fechaLocal(inicio), h: fechaLocal(fin) }
}
