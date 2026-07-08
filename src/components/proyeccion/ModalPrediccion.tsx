'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  ProductoFila, ProyeccionData,
  primeraImagen, calcularPuntoReorden,
  calcularIngresoProyectado, formatearPeriodo
} from '@/app/admin/proyeccion/types'

interface Props {
  producto: ProductoFila
  onClose:  () => void
}

export default function ModalPrediccion({ producto, onClose }: Props) {
  const [granularidad, setGranularidad] = useState<'dia' | 'semana' | 'mes'>('dia')
  const [tipoGrafica,  setTipoGrafica]  = useState<'linea' | 'barras'>('barras')
  const [data,         setData]         = useState<ProyeccionData | null>(null)
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true)

        const res = await fetch(`/api/admin/proyeccion?granularidad=${granularidad}&filtro=producto&filtro_id=${producto.id}&periodos_adelante=3`)
        const d = await res.json()

        if (isMounted) {
          setData(d)
          setLoading(false)
        }
      } catch {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [granularidad, producto.id])

  const img         = primeraImagen(producto.imagen)
  const reorden     = data ? calcularPuntoReorden(data.historico) : 0
  const proxPeriodo = data?.proyectado[0]?.total ?? 0
  const ingreso     = calcularIngresoProyectado(proxPeriodo, producto.precio_min)

  const datosGrafica = data ? [
    ...data.historico.map(p  => ({
      periodo:    formatearPeriodo(p.periodo),
      historico:  p.total,
      proyeccion: undefined,
    })),
    ...data.proyectado.map(p => ({
      periodo:    formatearPeriodo(p.periodo),
      historico:  undefined,
      proyeccion: p.total,
    })),
  ] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Predicción de Ventas</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Producto analizado */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Producto Analizado</p>
            <div className="flex items-center gap-4">
              {img && (
                <Image src={img} alt={producto.nombre} width={64} height={64}
                  className="rounded-xl object-cover h-16 w-16 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-gray-800 dark:text-white">{producto.nombre}</p>
                {producto.precio_min && (
                  <p className="text-sm text-gray-500">Precio desde: ${producto.precio_min}</p>
                )}
                <p className="text-sm text-gray-500">Stock: {producto.stock_total} uds</p>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Predicción de Ventas · {producto.nombre}
            </p>
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(['dia', 'semana', 'mes'] as const).map(g => (
                  <button key={g} onClick={() => setGranularidad(g)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      granularidad === g ? 'bg-pink-500 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {g === 'dia' ? 'Día' : g === 'semana' ? 'Semana' : 'Mes'}
                  </button>
                ))}
              </div>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(['linea', 'barras'] as const).map(t => (
                  <button key={t} onClick={() => setTipoGrafica(t)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      tipoGrafica === t ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                    {t === 'linea' ? 'Línea' : 'Barras'}
                  </button>
                ))}
              </div>
            </div>

            {loading && <p className="text-center text-gray-400 py-8 text-sm">Calculando proyección...</p>}

            {!loading && datosGrafica.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">Sin datos suficientes para proyectar</p>
            )}

            {!loading && datosGrafica.length > 0 && (
              <ResponsiveContainer width="100%" height={260}>
                {tipoGrafica === 'barras' ? (
                  <BarChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

<Tooltip
  formatter={(
    value: number | string | readonly (number | string)[] | undefined,
    name: string | number | undefined
  ) => {
    const val = Array.isArray(value) ? value[0] : value
    const label =
      name === 'historico'
        ? 'Ventas históricas'
        : 'Proyección'

    return [`${val ?? 0} uds`, label]
  }}
/>
         <Legend
  formatter={(name: string | number | undefined) =>
    name === 'historico' ? 'Ventas históricas' : 'Proyección'
  }
/>

                    <Bar dataKey="historico"  fill="#93c5fd" radius={[4,4,0,0]} name="historico" />
                    <Bar dataKey="proyeccion" fill="#fbbf24" radius={[4,4,0,0]} name="proyeccion" />
                  </BarChart>
                ) : (
                  <LineChart data={datosGrafica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

     <Tooltip
  formatter={(
    value: number | string | readonly (number | string)[] | undefined,
    name: string | number | undefined
  ) => {
    const val = Array.isArray(value) ? value[0] : value
    const label =
      name === 'historico'
        ? 'Ventas históricas'
        : 'Proyección'

    return [`${val ?? 0} uds`, label]
  }}
/>

  <Legend
  formatter={(name: string | number | undefined) =>
    name === 'historico' ? 'Ventas históricas' : 'Proyección'
  }
/>

                    <Line type="monotone" dataKey="historico"  stroke="#93c5fd" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} name="historico" />
                    <Line type="monotone" dataKey="proyeccion" stroke="#fbbf24" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4 }} connectNulls={false} name="proyeccion" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Cards recomendaciones */}
          {!loading && data && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3 text-center">Recomendaciones</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Punto de reorden</p>
                  <p className="text-xl font-bold text-blue-600">{reorden} uds</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ordenar más cuando el stock llegue a este nivel
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Ventas proyectadas</p>
                  <p className="text-xl font-bold text-green-600">{proxPeriodo} uds</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Estimado para el próximo {granularidad === 'dia' ? 'día' : granularidad === 'semana' ? 'semana' : 'mes'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Ingreso proyectado</p>
                  {ingreso !== null
                    ? <p className="text-xl font-bold text-pink-600">${ingreso.toLocaleString('es-MX')}</p>
                    : <p className="text-xl font-bold text-gray-400">—</p>
                  }
                  <p className="text-xs text-gray-400 mt-1">
                    Estimado de ventas × precio mínimo
                  </p>
                </div>
              </div>

              {producto.stock_total <= reorden && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-red-500 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Stock bajo</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      El stock actual ({producto.stock_total} uds) está por debajo del punto de reorden ({reorden} uds). Se recomienda reabastecer pronto.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}