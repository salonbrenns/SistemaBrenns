'use client'

// src/components/categorias-servicios/table.tsx
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { PencilIcon, NoSymbolIcon, CheckCircleIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface CategoriaServicio {
  id:     number
  nombre: string
  activo: boolean
  _count: { servicios: number }
}

interface Props {
  categorias:  CategoriaServicio[]
  currentPage: number
  totalPages:  number
}

const columns = [
  { label: 'ID',       key: 'id' },
  { label: 'Nombre',   key: 'nombre' },
  { label: 'Servicios', key: 'servicios' },
  { label: 'Estado',   key: 'activo' },
]

export default function CategoriaServicioTable({ categorias, currentPage, totalPages }: Props) {
  const searchParams = useSearchParams()
  const pathname     = usePathname()
  const router       = useRouter()
  const [procesando, setProcesando] = useState<number | null>(null)
  const [showModal, setShowModal]   = useState(false)
  const [editando, setEditando]     = useState<CategoriaServicio | null>(null)

  const sort      = searchParams.get('sort')      || 'id'
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
      ? '¿Quieres volver a habilitar esta categoría?'
      : '¿Estás segura de deshabilitar esta categoría?'

    if (!confirm(mensaje)) return

    setProcesando(id)
    try {
      const res = await fetch(`/api/categorias-servicios/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ activo: nuevoEstado }),
      })
      if (res.ok) router.refresh()
      else alert('Error al actualizar el estado')
    } catch {
      alert('Ocurrió un error inesperado')
    } finally {
      setProcesando(null)
    }
  }

  const abrirCrear = () => {
    setEditando(null)
    setShowModal(true)
  }

  const abrirEditar = (cat: CategoriaServicio) => {
    setEditando(cat)
    setShowModal(true)
  }

  return (
    <div className="mt-6 space-y-4">

      {/* Botón crear */}
      <div className="flex items-center justify-between">
        <button
          onClick={abrirCrear}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
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
              <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
                  No hay categorías registradas
                </td>
              </tr>
            ) : (
              categorias.map((c) => (
                <tr
                  key={c.id}
                  className={`transition-colors ${
                    !c.activo ? 'bg-gray-50 dark:bg-gray-900/50 opacity-60' : 'hover:bg-rose-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{c.id}</td>

                  <td className={`px-6 py-4 text-sm font-medium ${c.activo ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {c.nombre}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                      {c._count.servicios} servicio{c._count.servicios !== 1 ? 's' : ''}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="rounded-md p-2 hover:bg-green-100 transition"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4 text-green-700" />
                      </button>

                      <button
                        onClick={() => toggleEstado(c.id, c.activo)}
                        disabled={procesando === c.id}
                        className={`rounded-md p-2 transition disabled:opacity-50 ${
                          c.activo
                            ? 'hover:bg-orange-100 text-orange-600'
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={c.activo ? 'Desactivar' : 'Activar'}
                      >
                        {c.activo
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

      {/* Paginación */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <a
          href={createPageURL(currentPage - 1)}
          className={`px-3 py-1 rounded border text-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          Anterior
        </a>

        {generatePagination().map((page, index) => {
          if (typeof page === 'string') return <span key={index} className="px-2 text-gray-500">...</span>
          return (
            <a
              key={index}
              href={createPageURL(page)}
              className={`px-3 py-1 rounded border text-sm ${currentPage === page ? 'bg-rose-900 text-white border-rose-900' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {page}
            </a>
          )
        })}

        <a
          href={createPageURL(currentPage + 1)}
          className={`px-3 py-1 rounded border text-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          Siguiente
        </a>
      </div>

      {/* Modal crear/editar */}
      {showModal && (
        <CategoriaModal
          categoria={editando}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); router.refresh() }}
        />
      )}
    </div>
  )
}

/* ─── Modal inline ─────────────────────────────────────────── */
function CategoriaModal({
  categoria,
  onClose,
  onSuccess,
}: {
  categoria: CategoriaServicio | null
  onClose:   () => void
  onSuccess: () => void
}) {
  const [nombre,    setNombre]    = useState(categoria?.nombre ?? '')
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('El nombre es requerido'); return }

    setGuardando(true)
    setError('')

    try {
      const url    = categoria ? `/api/categorias-servicios/${categoria.id}` : '/api/categorias-servicios'
      const method = categoria ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre: nombre.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al guardar')
        return
      }
      onSuccess()
    } catch {
      setError('Error de conexión')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-pink-100 dark:border-gray-700 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-pink-900 to-pink-700 px-8 py-5">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <p className="text-pink-200 text-sm mt-0.5">
            {categoria ? 'Modifica el nombre de la categoría' : 'Ingresa el nombre de la nueva categoría'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nombre *
            </label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Uñas esculturales"
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-800 to-pink-600 text-white text-sm font-semibold shadow-md hover:from-pink-900 hover:to-pink-700 disabled:opacity-60 transition"
            >
              {guardando ? 'Guardando...' : categoria ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}