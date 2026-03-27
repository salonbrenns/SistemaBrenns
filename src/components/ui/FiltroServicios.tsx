// src/components/ui/FiltroServicios.tsx
"use client"

import { Search, X } from "lucide-react"

interface FiltroServiciosProps {
  busqueda: string
  setBusqueda: (value: string) => void
  categoriasSeleccionadas: string[]
  categoriasDisponibles: string[]
  toggleCategoria: (categoria: string) => void
  limpiarFiltros: () => void
}

export default function FiltroServicios({
  busqueda,
  setBusqueda,
  categoriasSeleccionadas,
  categoriasDisponibles,
  toggleCategoria,
  limpiarFiltros,
}: FiltroServiciosProps) {

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 py-5">
        <div className="flex flex-col lg:flex-row gap-5 items-center">

          {/* Barra de búsqueda */}
          <div className="flex-1 relative w-full max-w-2xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Qué servicio buscas?"
              className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-pink-400 text-base"
            />
          </div>

          {/* Filtros de categorías */}
          <div className="flex items-center gap-2 flex-wrap">
            {categoriasDisponibles.map((categoria) => (
              <button
                key={categoria}
                onClick={() => toggleCategoria(categoria)}
                className={`px-6 py-2.5 text-sm font-medium rounded-2xl transition-all ${
                  categoriasSeleccionadas.includes(categoria)
                    ? "bg-pink-600 text-white shadow"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {categoria}
              </button>
            ))}

            {(busqueda || categoriasSeleccionadas.length > 0) && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-500 hover:text-red-600 transition"
              >
                <X className="w-4 h-4" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}