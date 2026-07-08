'use client'

import React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface FiltroServiciosProps {
  busqueda: string
  setBusqueda: (v: string) => void
  categoriasDisponibles: string[]
  categoriasSeleccionadas: string[]
  toggleCategoria: (c: string) => void
  limpiarFiltros: () => void
}

export default function FiltroServicios({
  busqueda,
  setBusqueda,
  categoriasDisponibles,
  categoriasSeleccionadas,
  toggleCategoria,
  limpiarFiltros,
}: FiltroServiciosProps) {
  const [abierto, setAbierto] = React.useState(false)
  const hayActivos = busqueda || categoriasSeleccionadas.length > 0
  const totalActivos = categoriasSeleccionadas.length

  return (
    <div className="space-y-3 mb-6">
      {/* Barra superior */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cursos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-pink-100 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          />
        </div>
        <button
          onClick={() => setAbierto(v => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all shadow-sm ${
            abierto || hayActivos
              ? 'bg-pink-600 text-white border-pink-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-pink-100 dark:border-gray-600 hover:border-pink-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {totalActivos > 0 && (
            <span className="bg-white text-pink-600 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalActivos}
            </span>
          )}
        </button>
      </div>

      {/* Panel desplegable */}
      {abierto && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-md p-6">
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Categoría</p>
          <div className="flex flex-wrap gap-2">
            {categoriasDisponibles.map(c => (
              <button
                key={c}
                onClick={() => toggleCategoria(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  categoriasSeleccionadas.includes(c)
                    ? 'bg-pink-600 text-white border-pink-600'
                    : 'bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {hayActivos && (
            <div className="flex justify-end mt-4">
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-pink-600 font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags activos */}
      {categoriasSeleccionadas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categoriasSeleccionadas.map(c => (
            <span
              key={c}
              className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full"
            >
              {c}
              <button onClick={() => toggleCategoria(c)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}