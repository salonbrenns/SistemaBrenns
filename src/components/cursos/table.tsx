'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { PencilIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import ToggleCurso from './ToggleCurso'

interface Curso {
  id: number
  codigo: string
  titulo: string
  descripcion: string | null
  precio_total: number
  cupo_maximo: number
  duracion_horas: number | null
  nivel: string | null
  fecha_inicio: Date | null
  fecha_fin: Date | null
  activo: boolean
  imagenes: string[]
}

export default function CursoTable({
  cursos,
  totalPages,
  currentPage,
}: {
  cursos: Curso[]
  totalPages: number
  currentPage: number
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('query', term)
    params.set('page', '1')
    replace(`${pathname}?${params.toString()}`)
  }

  const formatDate = (date: Date | null) =>
    date ? new Date(date).toISOString().slice(0, 10) : '—'

  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false
    const trimmed = url.trim()
    return trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:')
  }

  return (
    <div className="mt-6 space-y-4">

      {/* Buscador + Boton Nuevo */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Buscar cursos por titulo o codigo..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-96 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 dark:bg-gray-800 dark:text-white"
        />
        <Link
          href="/admin/cursos/create"
          className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-medium px-6 py-3 rounded-lg transition-all active:scale-95 shadow-sm"
        >
          <span className="text-xl leading-none">+</span>
          Nuevo Curso
        </Link>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Codigo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Titulo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Cupo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Duracion</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Nivel</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Inicio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Fin</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {cursos.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  No hay cursos registrados
                </td>
              </tr>
            ) : (
              cursos.map((curso) => {
                const firstImage = curso.imagenes?.[0]
                const hasValidImage = isValidUrl(firstImage)

                return (
                  <tr key={curso.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      {hasValidImage ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-rose-100">
                          <Image
                            src={firstImage as string}
                            alt={curso.titulo}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50 flex items-center justify-center">
                          <span className="text-[10px] text-rose-300">IMG</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 font-medium">{curso.codigo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{curso.titulo}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-rose-600">
                      ${Number(curso.precio_total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{curso.cupo_maximo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {curso.duracion_horas ? `${curso.duracion_horas} hrs` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 uppercase">{curso.nivel || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(curso.fecha_inicio)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(curso.fecha_fin)}</td>

                    <td className="px-6 py-4">
                      <ToggleCurso
                        id={curso.id}
                        nombre={curso.titulo}
                        activo={curso.activo}
                      />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/cursos/${curso.id}/inscritos`}
                          title="Ver inscritos"
                          className="p-2 rounded-md hover:bg-rose-100 dark:hover:bg-gray-600 text-gray-500 hover:text-rose-600 transition-colors"
                        >
                          <UserGroupIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/cursos/editar/${curso.id}`}
                          title="Editar curso"
                          className="p-2 rounded-md hover:bg-green-100 dark:hover:bg-gray-600 text-gray-500 hover:text-green-600 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <Link
          href={`?page=${currentPage - 1}`}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage <= 1
              ? 'pointer-events-none opacity-50 border-gray-200 dark:border-gray-600 text-gray-400'
              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Anterior
        </Link>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Pagina <span className="font-semibold text-rose-900 dark:text-rose-400">{currentPage}</span> de {totalPages}
        </span>
        <Link
          href={`?page=${currentPage + 1}`}
          className={`px-3 py-1 rounded border text-sm ${
            currentPage >= totalPages
              ? 'pointer-events-none opacity-50 border-gray-200 dark:border-gray-600 text-gray-400'
              : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Siguiente
        </Link>
      </div>
    </div>
  )
}
