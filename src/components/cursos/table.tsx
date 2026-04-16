'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { PencilIcon } from '@heroicons/react/24/outline'
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

  /**
   * Valida si el string proporcionado es una URL apta para el componente Image de Next.js
   * Se cambió 'any' por 'string | null | undefined' para evitar errores de ESLint
   */
  const isValidUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('data:');
  }

  return (
    <div className="mt-6 space-y-4">
      
      {/* Buscador + Botón Nuevo */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Buscar cursos por título o código..."
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full sm:w-96 border border-pink-200 focus:border-pink-500 rounded-3xl px-5 py-3 placeholder:text-gray-400 focus:ring-1 focus:ring-pink-200"
        />

        <Link
          href="/admin/cursos/create"
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-3xl transition-all active:scale-95 shadow-sm"
        >
          <span className="text-xl leading-none">+</span>
          Nuevo Curso
        </Link>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#9F1239] text-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Imagen</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Título</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Cupo</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Duración</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Nivel</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Inicio</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Fin</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {cursos.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                  No hay cursos registrados
                </td>
              </tr>
            ) : (
              cursos.map((curso) => {
                const firstImage = curso.imagenes?.[0];
                const hasValidImage = isValidUrl(firstImage);

                return (
                  <tr key={curso.id} className="hover:bg-pink-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {hasValidImage ? (
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-pink-100">
                          <Image
                            src={firstImage as string}
                            alt={curso.titulo}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl border border-pink-200 bg-pink-50 flex items-center justify-center">
                          <span className="text-[10px] text-pink-400 font-medium">IMG</span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">{curso.codigo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{curso.titulo}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-pink-600">
                      ${Number(curso.precio_total).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{curso.cupo_maximo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {curso.duracion_horas ? `${curso.duracion_horas} hrs` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 uppercase">{curso.nivel || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(curso.fecha_inicio)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(curso.fecha_fin)}</td>

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
                          href={`/admin/cursos/editar/${curso.id}`}
                          className="text-gray-500 hover:text-pink-600 transition-colors"
                        >
                          <PencilIcon className="w-5 h-5" />
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

      <div className="flex justify-center items-center gap-3 mt-8">
        <Link
          href={`?page=${currentPage - 1}`}
          className={`px-5 py-2 rounded-xl border text-sm ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
        >
          Anterior
        </Link>
        <span className="text-sm text-gray-600">
          Página <span className="font-semibold text-[#9F1239]">{currentPage}</span> de {totalPages}
        </span>
        <Link
          href={`?page=${currentPage + 1}`}
          className={`px-5 py-2 rounded-xl border text-sm ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}
        >
          Siguiente
        </Link>
      </div>
    </div>
  )
}