'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { CreateCategoria, UpdateCategoria, ToggleCategoria } from './buttons'

interface Categoria {
  id: number
  nombre: string
  activo: boolean  
}

interface Props {
  categorias: Categoria[]
  currentPage: number
  totalPages: number
}

export default function CategoriaTable({ categorias, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()
  const pathname     = usePathname()

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const generatePagination = () => {
    const pages: (number | string)[] = []
    const start = Math.max(1, currentPage - 2)
    const end   = Math.min(totalPages, currentPage + 2)
    if (start > 1) { pages.push(1); if (start > 2) pages.push('...') }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages) }
    return pages
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-end">
        <CreateCategoria />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-pink-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Nombre</th>
              {/* Columna estado ← nueva */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-sm text-gray-500">
                  No se encontraron categorías
                </td>
              </tr>
            ) : (
              categorias.map((categoria) => (
                <tr
                  key={categoria.id}
                  className={`transition-colors ${
                    !categoria.activo ? 'bg-gray-50 opacity-60' : 'hover:bg-pink-50'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-900">{categoria.id}</td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{categoria.nombre}</td>

                  {/* ESTADO ← badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      categoria.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {categoria.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <UpdateCategoria id={categoria.id} />
                      <ToggleCategoria id={categoria.id} nombre={categoria.nombre} activo={categoria.activo} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <a
          href={createPageURL(currentPage - 1)}
          className={`px-3 py-1 rounded border ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
        >
          Anterior
        </a>

        {generatePagination().map((page, index) => {
          if (typeof page === 'string') return <span key={index} className="px-2 text-gray-500">...</span>
          return (
            <a
              key={index}
              href={createPageURL(page)}
              className={`px-3 py-1 rounded border ${currentPage === page ? 'bg-pink-900 text-white' : 'hover:bg-gray-100'}`}
            >
              {page}
            </a>
          )
        })}

        <a
          href={createPageURL(currentPage + 1)}
          className={`px-3 py-1 rounded border ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
        >
          Siguiente
        </a>
      </div>
    </div>
  )
}