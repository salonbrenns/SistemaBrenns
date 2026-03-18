'use client'

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { CreateProducto, UpdateProducto, ToggleProducto } from './buttons'
import Image from 'next/image'

interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  precio_venta: number
  precio_costo: number
  stock: number
  imagen: string | null
  activo: boolean | null  // ← nuevo
  marca: { nombre: string } | null
  categoria: { nombre: string } | null
}

interface Props {
  productos: Producto[]
  currentPage: number
  totalPages: number
}

const columns = [
  { label: 'Código',      key: 'codigo' },
  { label: 'Nombre',      key: 'nombre' },
  { label: 'Descripción', key: 'descripcion' },
  { label: 'Precio V.',   key: 'precio_venta' },
  { label: 'Precio C.',   key: 'precio_costo' },
  { label: 'Marca',       key: 'marca' },
  { label: 'Categoría',   key: 'categoria' },
  { label: 'Stock',       key: 'stock' },
]

export default function ProductoTable({ productos, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()
  const pathname     = usePathname()
  const { replace }  = useRouter()

  const sort      = searchParams.get('sort')      || 'nombre'
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
    const end   = Math.min(totalPages, currentPage + 2)
    if (start > 1) { pages.push(1); if (start > 2) pages.push('...') }
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages) }
    return pages
  }

  return (
    <div className="mt-6 space-y-4">

      <div className="flex items-center justify-between">
        <CreateProducto />
      </div>

      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">

          <thead className="bg-pink-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Foto</th>

              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="cursor-pointer px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sort === col.key && (direction === 'asc'
                      ? <ArrowUpIcon className="h-4 w-4" />
                      : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}

              {/* Columna estado ← nueva */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Estado
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {productos.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-6 text-center text-sm text-gray-500">
                  No hay productos registrados
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr
                  key={p.id}
                  className={`transition-colors ${
                    p.activo === false
                      ? 'bg-gray-50 opacity-60'   // ← fila atenuada si está inactivo
                      : 'hover:bg-pink-50'
                  }`}
                >
                  {/* FOTO */}
                  <td className="px-6 py-3">
                    {p.imagen ? (
                      <Image
                        src={p.imagen}
                        alt={p.nombre}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-cover border border-pink-100 shadow-sm"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border-2 border-dashed border-pink-200 bg-pink-50 flex items-center justify-center">
                        <svg className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A.75.75 0 0021.75 19.5V6A.75.75 0 0021 5.25H3A.75.75 0 002.25 6v13.5c0 .414.336.75.75.75z" />
                        </svg>
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">{p.codigo}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{p.descripcion || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${Number(p.precio_venta).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${Number(p.precio_costo).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.marca?.nombre || 'Sin marca'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.categoria?.nombre || 'Sin categoría'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.stock}</td>

                  {/* ESTADO ← badge visual */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                      {/* ← ToggleProducto en vez de DeleteProducto */}
                      <ToggleProducto id={p.id} nombre={p.nombre} activo={p.activo ?? true} />
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