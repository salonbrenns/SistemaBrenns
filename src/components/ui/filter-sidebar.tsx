// src/components/ui/filter-sidebar.tsx
import { Search, Filter, X } from "lucide-react";

interface FilterSidebarProps {
  title: string;
  busqueda: string;
  setBusqueda: (value: string) => void;
  categoriasDisponibles: string[];
  categoriasSeleccionadas: string[];
  toggleCategoria: (category: string) => void;
  limpiarFiltros: () => void;
}

export default function FilterSidebar({
  busqueda,
  setBusqueda,
  categoriasDisponibles,
  categoriasSeleccionadas,
  toggleCategoria,
  limpiarFiltros,
}: FilterSidebarProps) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 border border-pink-100 mb-8 w-full">
      <div className="flex flex-col md:flex-row items-center gap-4">
        
        {/* BUSCADOR - Toma más espacio */}
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="¿Qué servicio buscas?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-pink-500 focus:outline-none text-gray-700 transition-all"
          />
        </div>

        {/* SELECT DE CATEGORÍAS (Horizontal) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categoriasDisponibles.map((categoria) => {
            const isSelected = categoriasSeleccionadas.includes(categoria);
            return (
              <button
                key={categoria}
                onClick={() => toggleCategoria(categoria)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                  isSelected
                    ? "bg-pink-600 text-white border-pink-600 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                }`}
              >
                {categoria}
              </button>
            );
          })}
        </div>

        {/* BOTÓN LIMPIAR - Icono para ahorrar espacio */}
        {(busqueda || categoriasSeleccionadas.length > 0) && (
          <button
            onClick={limpiarFiltros}
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold text-sm px-4 py-2 transition-colors"
            title="Limpiar filtros"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
}