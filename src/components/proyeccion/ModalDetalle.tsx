'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'
import { ProductoFila, PeriodoVenta, primeraImagen, formatearPeriodo } from '@/app/admin/proyeccion/types'

interface Props {
  producto: ProductoFila
  onClose: () => void
}

// ─── helpers para generar rangos de períodos ───────────────────────────────

function getMondayOfWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  return monday
}

function isoWeekNumber(date: Date): number {
  const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = tmp.getUTCDay() || 7
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1))
  return Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function buildSemanaPeriods(añosAtras = 1) {
  const hoy = new Date()
  const semanaActual = isoWeekNumber(hoy)
  const añoActual = hoy.getFullYear()
  const periodos: { key: string; label: string }[] = []

  for (let año = añoActual - añosAtras; año <= añoActual; año++) {
    const maxSemana = año === añoActual ? semanaActual : 52
    for (let w = 1; w <= maxSemana; w++) {
      const lunes = getMondayOfWeek(año, w)
      const domingo = new Date(lunes)
      domingo.setDate(domingo.getDate() + 6)
      const fmt = (d: Date) =>
        d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      periodos.push({
        key: `${año}-W${String(w).padStart(2, '0')}`,
        label: `${fmt(lunes)} – ${fmt(domingo)}, ${año}`,
      })
    }
  }
  return periodos
}

function buildMesPeriods(añosAtras = 1) {
  const hoy = new Date()
  const mesActual = hoy.getMonth()
  const añoActual = hoy.getFullYear()
  const periodos: { key: string; label: string }[] = []

  for (let año = añoActual - añosAtras; año <= añoActual; año++) {
    const maxMes = año === añoActual ? mesActual : 11
    for (let m = 0; m <= maxMes; m++) {
      periodos.push({
        key: `${año}-${String(m + 1).padStart(2, '0')}`,
        label: new Date(año, m, 1).toLocaleDateString('es-MX', {
          month: 'long', year: 'numeric',
        }),
      })
    }
  }
  return periodos
}

// ─── componente ──────────────────────────────────────────────────────────────

export default function ModalDetalle({ producto, onClose }: Props) {
  const [granularidad, setGranularidad] = useState<'dia' | 'semana' | 'mes'>('semana')
  const [vista, setVista] = useState<'tabla' | 'grafica'>('tabla')
  const [historico, setHistorico] = useState<PeriodoVenta[]>([])
  const [loading, setLoading] = useState(true)

  // índice del período seleccionado en el selector (semana/mes)
  const [periodoIdx, setPeriodoIdx] = useState<number>(-1)

  // lista de todos los períodos disponibles para el selector
  const periodosDisponibles = useMemo(() => {
    if (granularidad === 'semana') return buildSemanaPeriods(1)
    if (granularidad === 'mes') return buildMesPeriods(1)
    return []
  }, [granularidad])

  // al cambiar granularidad, apuntar al período más reciente
  useEffect(() => {
    if (periodosDisponibles.length > 0) {
      setPeriodoIdx(periodosDisponibles.length - 1)
    }
  }, [periodosDisponibles])

  // fetch: para semana/mes, siempre traemos TODO el histórico y filtramos en cliente
  // para día, dejamos el comportamiento original
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const r = await fetch(
          `/api/admin/proyeccion?granularidad=${granularidad}&filtro=producto&filtro_id=${producto.id}&periodos_adelante=0`
        )
        const d = await r.json()
        setHistorico(d.historico ?? [])
      } catch {
        // error silencioso
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [granularidad, producto.id])

  // para semana/mes: mezclar períodos disponibles con datos reales (rellenar ceros)
  const datosConCeros = useMemo<PeriodoVenta[]>(() => {
    if (granularidad === 'dia') return historico

    const mapa = new Map(historico.map(h => [h.periodo, h.total]))
    return periodosDisponibles.map(p => ({
      periodo: p.key,
      total: mapa.get(p.key) ?? 0,
    }))
  }, [granularidad, historico, periodosDisponibles])

  // para la vista de tabla/gráfica: si hay selector activo, mostramos solo ese período
  // para día, mostramos todo como antes
  const datosMostrados = useMemo<PeriodoVenta[]>(() => {
    if (granularidad === 'dia') return datosConCeros
    if (periodoIdx < 0 || periodoIdx >= datosConCeros.length) return []
    return [datosConCeros[periodoIdx]]
  }, [granularidad, datosConCeros, periodoIdx])

  const img = primeraImagen(producto.imagen)
  const periodoLabel = periodosDisponibles[periodoIdx]?.label ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-lg">{producto.nombre}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{producto.categoria} · {producto.marca}</p>
          </div>
          <div className="flex items-center gap-3">
            {img && (
              <Image src={img} alt={producto.nombre} width={56} height={56}
                className="rounded-lg object-cover h-14 w-14 flex-shrink-0" />
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">

          {/* toggles granularidad + vista */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {(['dia', 'semana', 'mes'] as const).map(g => (
                <button key={g} onClick={() => setGranularidad(g)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    granularidad === g ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {g === 'dia' ? 'Por Día' : g === 'semana' ? 'Por Semana' : 'Por Mes'}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {(['tabla', 'grafica'] as const).map(v => (
                <button key={v} onClick={() => setVista(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    vista === v ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {v === 'tabla' ? 'Tabla' : 'Gráfica'}
                </button>
              ))}
            </div>
          </div>

          {/* selector de período (solo para semana y mes) */}
          {granularidad !== 'dia' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPeriodoIdx(i => Math.max(0, i - 1))}
                disabled={periodoIdx <= 0}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ←
              </button>

              <select
                value={periodoIdx}
                onChange={e => setPeriodoIdx(Number(e.target.value))}
                className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-pink-400"
              >
                {periodosDisponibles.map((p, i) => (
                  <option key={p.key} value={i}>{p.label}</option>
                ))}
              </select>

              <button
                onClick={() => setPeriodoIdx(i => Math.min(periodosDisponibles.length - 1, i + 1))}
                disabled={periodoIdx >= periodosDisponibles.length - 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          )}

          <p className="text-sm font-semibold text-gray-700">
            {granularidad === 'dia'
              ? 'Ventas por Día'
              : granularidad === 'semana'
              ? `Semana: ${periodoLabel}`
              : `Mes: ${periodoLabel}`}
          </p>

          {loading && <p className="text-center text-gray-400 py-6 text-sm">Cargando...</p>}

          {!loading && granularidad === 'dia' && historico.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Sin ventas registradas</p>
          )}

          {/* tabla */}
          {!loading && vista === 'tabla' && datosMostrados.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase">
                  <th className="text-left py-2">Fecha de venta</th>
                  <th className="text-right py-2">Unidades vendidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datosMostrados.map(h => (
                  <tr key={h.periodo} className="hover:bg-gray-50">
                    <td className="py-2.5 font-mono text-gray-600">
                      {granularidad !== 'dia'
                        ? periodosDisponibles.find(p => p.key === h.periodo)?.label ?? h.periodo
                        : formatearPeriodo(h.periodo)}
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${
                      h.total === 0 ? 'text-gray-300' : 'text-gray-800'
                    }`}>
                      {h.total === 0 ? '—' : h.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* gráfica */}
          {!loading && vista === 'grafica' && datosMostrados.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={datosMostrados.map(h => ({
                ...h,
                periodo: granularidad !== 'dia'
                  ? periodosDisponibles.find(p => p.key === h.periodo)?.label ?? h.periodo
                  : formatearPeriodo(h.periodo),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v} uds`, 'Ventas']} />
                <Bar dataKey="total" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Ventas" />
              </BarChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>
    </div>
  )
}