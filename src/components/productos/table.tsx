'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { CreateProducto, UpdateProducto, ToggleProducto } from './buttons'
import Image from 'next/image'

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  imagen: any
  activo: boolean | null
  marca: { nombre: string } | null
  categoria: { nombre: string } | null

  //derivados de variantes
  precio_min: number
  precio_max: number
  stock_total: number

  variantes: {
    id: number
    codigo: string | null
    precio_venta: number
    stock: number
  }[]
}

interface Props {
  productos: Producto[]
  currentPage: number
  totalPages: number
}

const columns = [
  { label: 'Código', key: 'codigo' },
  { label: 'Nombre', key: 'nombre' },
  { label: 'Descripción', key: 'descripcion' },
  { label: 'Precio V.', key: 'precio_min' }, 
  { label: 'Marca', key: 'marca' },
  { label: 'Categoría', key: 'categoria' },
  { label: 'Stock', key: 'stock_total' },
]

export default function ProductoTable({ productos, currentPage, totalPages }: Readonly<Props>) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const sort = searchParams.get('sort') || 'nombre'
  const direction = searchParams.get('direction') || 'asc'

  const handleSort = (column: string) => {
    const params = new URLSearchParams(searchParams)
    const newDirection = column === sort && direction === 'asc' ? 'desc' : 'asc'
    params.set('sort', column)
    params.set('direction', newDirection)
    params.set('page', '1')
    replace(`${pathname}?${params.toString()}`)
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const generatePagination = () => {
    const pages: (number | string)[] = []
    const start = Math.max(1, currentPage - 2)
    const end = Math.min(totalPages, currentPage + 2)

    if (start > 1) {
      pages.push(1)
      if (start > 2) pages.push('...')
    }

    for (let i = start; i <= end; i++) pages.push(i)

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <CreateProducto />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          
          {/* HEADER */}
          <thead className="bg-rose-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Foto
              </th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sort === col.key && (
                      direction === 'asc'
                        ? <ArrowUpIcon className="h-4 w-4" />
                        : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}

              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Estado
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-6 text-center text-sm text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((p) => {
                let foto: string | null = null
                let totalImagenes = 0

                if (p.imagen) {
                  if (Array.isArray(p.imagen)) {
                    foto = p.imagen[0]
                    totalImagenes = p.imagen.length
                  } else if (typeof p.imagen === 'string') {
                    foto = p.imagen
                    totalImagenes = 1
                  }
                }

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors ${
                      p.activo === false
                        ? 'bg-gray-50 opacity-60'
                        : 'hover:bg-rose-50'
                    }`}
                  >
                    <td className="px-6 py-3">
                      {foto ? (
                        <div className="relative h-12 w-12 group">
                          <Image
                            src={foto}
                            alt={p.nombre}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover border border-rose-100 shadow-sm"
                          />
                          {totalImagenes > 1 && (
                            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                              {totalImagenes}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg border-2 border-dashed border-rose-200 bg-rose-50 flex items-center justify-center">
                          <span className="text-xs text-rose-300">IMG</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {p.variantes[0]?.codigo || '—'}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {p.nombre}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {p.descripcion || '—'}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      ${p.precio_min.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {p.marca?.nombre || 'Sin marca'}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {p.categoria?.nombre || 'Sin categoría'}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium">
                      {p.stock_total}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        p.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <UpdateProducto id={p.id} />
                        <ToggleProducto
                          id={p.id}
                          nombre={p.nombre}
                          activo={p.activo ?? true}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <a
          href={createPageURL(currentPage - 1)}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
          }`}
        >
          Anterior
        </a>

        {generatePagination().map((page, index) =>
          typeof page === 'string'
            ? (
              <span key={`ellipsis-${index < 3 ? 'start' : 'end'}`} className="px-2">
                ...
              </span>
            )
            : (
              <a
                key={page}
                href={createPageURL(page)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === page ? 'bg-rose-900 text-white' : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </a>
            )
        )}

        <a
          href={createPageURL(currentPage + 1)}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'
          }`}
        >
          Siguiente
        </a>
      </div>
    </div>
  )
}