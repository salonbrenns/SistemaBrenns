'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'

interface ProductosFiltrosProps {
  busqueda: string
  setBusqueda: (v: string) => void
  marcasDisponibles: string[]
  marcasSeleccionadas: string[]
  toggleMarca: (m: string) => void
  categoriasDisponibles: string[]
  categoriasSeleccionadas: string[]
  toggleCategoria: (c: string) => void
  limpiarFiltros: () => void
}

export default function ProductosFiltros({
  busqueda,
  setBusqueda,
  marcasDisponibles,
  marcasSeleccionadas,
  toggleMarca,
  categoriasDisponibles,
  categoriasSeleccionadas,
  toggleCategoria,
  limpiarFiltros,
}: ProductosFiltrosProps) {
  const [abierto, setAbierto] = React.useState(false)
  const hayActivos = busqueda || marcasSeleccionadas.length > 0 || categoriasSeleccionadas.length > 0
  const totalActivos = marcasSeleccionadas.length + categoriasSeleccionadas.length

  return (
    <div className="space-y-3 mb-6">
      {/* Barra superior */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-rose-100 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-300 text-sm"
          />
        </div>
        <button
          onClick={() => setAbierto(v => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border font-semibold text-sm transition-all shadow-sm ${
            abierto || hayActivos
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-white text-gray-700 border-rose-100 hover:border-rose-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {totalActivos > 0 && (
            <span className="bg-white text-rose-700 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {totalActivos}
            </span>
          )}
        </button>
      </div>

      {/* Panel desplegable */}
      {abierto && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Marca</p>
            <div className="flex flex-wrap gap-2">
              {marcasDisponibles.map(m => (
                <button
                  key={m}
                  onClick={() => toggleMarca(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    marcasSeleccionadas.includes(m)
                      ? 'bg-rose-700 text-white border-rose-700'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">Categoría</p>
            <div className="flex flex-wrap gap-2">
              {categoriasDisponibles.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCategoria(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    categoriasSeleccionadas.includes(c)
                      ? 'bg-pink-700 text-white border-pink-700'
                      : 'bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {hayActivos && (
            <div className="md:col-span-2 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-600 font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tags activos */}
      {(marcasSeleccionadas.length > 0 || categoriasSeleccionadas.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {marcasSeleccionadas.map(m => (
            <span key={m} className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full">
              {m} <button onClick={() => toggleMarca(m)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {categoriasSeleccionadas.map(c => (
            <span key={c} className="inline-flex items-center gap-1 bg-pink-100 text-pink-700 text-xs font-semibold px-3 py-1 rounded-full">
              {c} <button onClick={() => toggleCategoria(c)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// React import necesario para useState dentro de un componente no-'use client' en el archivo
import React from 'react'