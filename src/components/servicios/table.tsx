'use client'

// src/components/servicios/table.tsx
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PencilIcon, NoSymbolIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface Servicio {
  id:          number
  nombre:      string
  descripcion: string | null
  precio:      number
  duracion:    string
  categoria:   { nombre: string } | null
  imagen:      string | null
  activo:      boolean
}

interface Props {
  servicios:   Servicio[]
  currentPage: number
  totalPages:  number
}

const columns = [
  { label: 'Nombre',    key: 'nombre' },
  { label: 'Categoría', key: 'categoria' },
  { label: 'Duración',  key: 'duracion' },
  { label: 'Precio',    key: 'precio' },
]

export default function ServicioTable({ servicios, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()
  const pathname     = usePathname()
  const router       = useRouter()
  const [procesando, setProcesando] = useState<number | null>(null)

  const sort      = searchParams.get('sort')      || 'nombre'
  const direction = searchParams.get('direction') || 'asc'

  const handleSort = (column: string) => {
    const params       = new URLSearchParams(searchParams)
    const newDirection = column === sort && direction === 'asc' ? 'desc' : 'asc'
    params.set('sort', column)
    params.set('direction', newDirection)
    params.set('page', '1')
    router.replace(`${pathname}?${params.toString()}`)
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

  const toggleEstado = async (id: number, estadoActual: boolean) => {
    const nuevoEstado = !estadoActual
    const mensaje = nuevoEstado
      ? '¿Quieres volver a habilitar este servicio?'
      : '¿Estás segura de deshabilitar este servicio? No aparecerá disponible para citas.'

    if (!confirm(mensaje)) return

    setProcesando(id)
    try {
      const res = await fetch(`/api/admin/servicios/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ activo: nuevoEstado }),
      })
      if (res.ok) router.refresh()
      else alert('Error al actualizar el estado del servicio')
    } catch {
      alert('Ocurrió un error inesperado')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="mt-6 space-y-4">

      {/* Botón crear */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/servicios/create"
          className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Servicio
        </Link>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
              {/* Columna foto — igual que productos */}
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

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {servicios.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">
                  No hay servicios registrados
                </td>
              </tr>
            ) : (
              servicios.map((s) => (
                <tr
                  key={s.id}
                  className={`transition-colors ${
                    !s.activo ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : 'hover:bg-rose-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* Foto */}
                  <td className="px-6 py-3">
                    {s.imagen ? (
                      <div className="relative h-12 w-12 group">
                        <Image
                          src={s.imagen}
                          alt={s.nombre}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-lg object-cover border border-pink-100 shadow-sm transition-transform group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg border-2 border-dashed border-pink-200 bg-pink-50 flex items-center justify-center">
                        <svg className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A.75.75 0 0021.75 19.5V6A.75.75 0 0021 5.25H3A.75.75 0 002.25 6v13.5c0 .414.336.75.75.75z" />
                        </svg>
                      </div>
                    )}
                  </td>

                  {/* Nombre */}
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {s.nombre}
                  </td>

                  {/* Categoría */}
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.activo ? 'bg-pink-100 text-pink-700' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {s.categoria?.nombre ?? 'Sin categoría'}
                    </span>
                  </td>

                  {/* Duración */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {s.duracion}
                  </td>

                  {/* Precio */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    ${Number(s.precio).toFixed(2)} MXN
                  </td>

                  {/* Estado — igual que productos */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      s.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* Acciones — igual que productos */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/servicios/editar/${s.id}`}
                        className="rounded-md p-2 hover:bg-green-100 transition"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4 text-green-700" />
                      </Link>

                      <button
                        onClick={() => toggleEstado(s.id, s.activo)}
                        disabled={procesando === s.id}
                        className={`rounded-md p-2 transition disabled:opacity-50 ${
                          s.activo
                            ? 'hover:bg-orange-100 text-orange-600'
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={s.activo ? 'Desactivar' : 'Activar'}
                      >
                        {s.activo
                          ? <NoSymbolIcon className="h-4 w-4" />
                          : <CheckCircleIcon className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación numérica — igual que productos */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <a
          href={createPageURL(currentPage - 1)}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage <= 1 ? 'pointer-events-none opacity-50' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Anterior
        </a>

        {generatePagination().map((page, index) => {
          if (typeof page === 'string')
            return <span key={index} className="px-2 text-gray-500">...</span>
          return (
            <a
              key={index}
              href={createPageURL(page)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === page ? 'bg-rose-900 text-white border-rose-900' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </a>
          )
        })}

        <a
          href={createPageURL(currentPage + 1)}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Siguiente
        </a>
      </div>
    </div>
  )
}