'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PlusIcon, TrashIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline'

type DiaBloqueado = {
  id: number
  fecha: string
  motivo: string | null
}

type HoraBloqueada = {
  id: number
  fecha: string
  hora: string
  motivo: string | null
}

type Props = {
  dias:  DiaBloqueado[]
  horas: HoraBloqueada[]
}

export default function DiasBloqueadosTable({ dias, horas }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'dias' | 'horas'>('dias')

  // ── Estado días ────────────────────────────────────────────
  const [fecha,      setFecha]      = useState('')
  const [motivo,     setMotivo]     = useState('')
  const [agregando,  setAgregando]  = useState(false)
  const [eliminando, setEliminando] = useState<number | null>(null)
  const [error,      setError]      = useState('')

  // ── Estado horas ───────────────────────────────────────────
  const [fechaHora,      setFechaHora]      = useState('')
  const [hora,           setHora]           = useState('')
  const [motivoHora,     setMotivoHora]     = useState('')
  const [agregandoHora,  setAgregandoHora]  = useState(false)
  const [eliminandoHora, setEliminandoHora] = useState<number | null>(null)
  const [errorHora,      setErrorHora]      = useState('')

  // ── Acciones días ──────────────────────────────────────────
  const agregarDia = async () => {
    if (!fecha) { setError('Selecciona una fecha'); return }
    setAgregando(true); setError('')
    const res = await fetch('/api/admin/dias-bloqueados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha, motivo }),
    })
    if (res.ok) { setFecha(''); setMotivo(''); router.refresh() }
    else setError('Error al agregar. ¿Ya existe esa fecha?')
    setAgregando(false)
  }

  const eliminarDia = async (id: number) => {
    if (!confirm('¿Desbloquear esta fecha?')) return
    setEliminando(id)
    await fetch(`/api/admin/dias-bloqueados/${id}`, { method: 'DELETE' })
    router.refresh()
    setEliminando(null)
  }

  // ── Acciones horas ─────────────────────────────────────────
  const agregarHora = async () => {
    if (!fechaHora || !hora) { setErrorHora('Selecciona fecha y hora'); return }
    setAgregandoHora(true); setErrorHora('')
    const res = await fetch('/api/admin/horas-bloqueadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: fechaHora, hora, motivo: motivoHora }),
    })
    if (res.ok) { setFechaHora(''); setHora(''); setMotivoHora(''); router.refresh() }
    else setErrorHora('Error al agregar. ¿Ya existe esa hora para esa fecha?')
    setAgregandoHora(false)
  }

  const eliminarHora = async (id: number) => {
    if (!confirm('¿Desbloquear esta hora?')) return
    setEliminandoHora(id)
    await fetch(`/api/admin/horas-bloqueadas/${id}`, { method: 'DELETE' })
    router.refresh()
    setEliminandoHora(null)
  }

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-MX', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
    })

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-100">
        <button onClick={() => setTab('dias')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'dias' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500 hover:text-pink-600'
          }`}>
          <CalendarDaysIcon className="h-4 w-4" />
          Días completos
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'dias' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
            {dias.length}
          </span>
        </button>
        <button onClick={() => setTab('horas')}
          className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            tab === 'horas' ? 'border-pink-600 text-pink-700' : 'border-transparent text-gray-500 hover:text-pink-600'
          }`}>
          <ClockIcon className="h-4 w-4" />
          Horas específicas
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === 'horas' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-500'}`}>
            {horas.length}
          </span>
        </button>
      </div>

      {/* ── TAB DÍAS COMPLETOS ─────────────────────────────────── */}
      {tab === 'dias' && (
        <div className="space-y-6">
          <div className="bg-pink-50 rounded-xl p-5 border border-pink-100 space-y-4">
            <p className="text-sm font-semibold text-gray-700">Bloquear un día completo</p>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fecha</label>
                <input type="date" value={fecha} onChange={e => { setFecha(e.target.value); setError('') }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs text-gray-600 mb-1">Motivo (opcional)</label>
                <input value={motivo} onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Día festivo, vacaciones..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400" />
              </div>
              <button onClick={agregarDia} disabled={agregando}
                className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-medium text-white hover:bg-pink-800 transition disabled:opacity-50">
                <PlusIcon className="h-4 w-4" />
                {agregando ? 'Agregando...' : 'Bloquear fecha'}
              </button>
            </div>
            {error && <p className="text-red-600 text-xs">{error}</p>}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-pink-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dias.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-10 text-center text-sm text-gray-500">No hay fechas bloqueadas</td></tr>
                ) : dias.map(d => (
                  <tr key={d.id} className="hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-pink-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">{formatFecha(d.fecha)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{d.motivo || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => eliminarDia(d.id)} disabled={eliminando === d.id}
                        className="rounded-md p-2 hover:bg-red-100 transition disabled:opacity-50">
                        <TrashIcon className="h-4 w-4 text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB HORAS ESPECÍFICAS ──────────────────────────────── */}
      {tab === 'horas' && (
        <div className="space-y-6">
          <div className="bg-pink-50 rounded-xl p-5 border border-pink-100 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Bloquear una hora en fecha específica</p>
              <p className="text-xs text-gray-500 mt-0.5">El resto del día seguirá disponible normalmente</p>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Fecha</label>
                <input type="date" value={fechaHora} onChange={e => { setFechaHora(e.target.value); setErrorHora('') }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hora</label>
                <input type="time" value={hora} onChange={e => { setHora(e.target.value); setErrorHora('') }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs text-gray-600 mb-1">Motivo (opcional)</label>
                <input value={motivoHora} onChange={e => setMotivoHora(e.target.value)}
                  placeholder="Ej: Cita personal, descanso..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-pink-400" />
              </div>
              <button onClick={agregarHora} disabled={agregandoHora}
                className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-medium text-white hover:bg-pink-800 transition disabled:opacity-50">
                <PlusIcon className="h-4 w-4" />
                {agregandoHora ? 'Agregando...' : 'Bloquear hora'}
              </button>
            </div>
            {errorHora && <p className="text-red-600 text-xs">{errorHora}</p>}
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-pink-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Hora bloqueada</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horas.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">No hay horas bloqueadas</td></tr>
                ) : horas.map(h => (
                  <tr key={h.id} className="hover:bg-pink-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-4 w-4 text-pink-400" />
                        <span className="text-sm font-medium text-gray-900 capitalize">{formatFecha(h.fecha)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-bold text-orange-600">{h.hora}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{h.motivo || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => eliminarHora(h.id)} disabled={eliminandoHora === h.id}
                        className="rounded-md p-2 hover:bg-red-100 transition disabled:opacity-50">
                        <TrashIcon className="h-4 w-4 text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}