import { Search, Filter, X } from "lucide-react";

interface FilterSidebarProps {
  title: string;
  busqueda: string;
  setBusqueda: (value: string) => void;
  categoriasDisponibles: string[];
  categoriasSeleccionadas: string[];
  toggleCategoria: (category: string) => void;
  limpiarFiltros: () => void;
  placeholder?: string;
}

export default function FilterSidebar({
  title,
  busqueda,
  setBusqueda,
  categoriasDisponibles,
  categoriasSeleccionadas,
  toggleCategoria,
  limpiarFiltros,
  placeholder,
}: FilterSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 border border-pink-100 dark:border-gray-700 mb-8 w-full">
      <div className="flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
        <Filter className="w-5 h-5 text-pink-600" />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">

        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={placeholder || "¿Qué servicio buscas?"}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:bg-white dark:focus:bg-gray-600 focus:border-pink-500 focus:outline-none text-gray-700 dark:text-white transition-all"
          />
        </div>

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
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-pink-300"
                }`}
              >
                {categoria}
              </button>
            );
          })}
        </div>

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