// src/app/admin/proyeccion/components/TablaProductos.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProductoFila, primeraImagen } from '@/app/admin/proyeccion/types'
const POR_PAGINA = 15

interface Props {
  productos:  ProductoFila[]
  loading:    boolean
  onDetalle:  (p: ProductoFila) => void
  onPredecir: (p: ProductoFila) => void
}

export default function TablaProductos({ productos, loading, onDetalle, onPredecir }: Props) {
  const [pagina, setPagina] = useState(1)

  // Reset a página 1 cuando cambia la lista
  const totalPaginas = Math.ceil(productos.length / POR_PAGINA)
  const paginaReal   = Math.min(pagina, Math.max(totalPaginas, 1))
  const inicio       = (paginaReal - 1) * POR_PAGINA
  const productosPagina = productos.slice(inicio, inicio + POR_PAGINA)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-900 text-xs text-gray-500 dark:text-gray-400 uppercase">
          <tr>
            <th className="px-4 py-3 text-left">Producto</th>
            <th className="px-4 py-3 text-left">Categoría / Marca</th>
            <th className="px-4 py-3 text-center">Stock disponible</th>
            <th className="px-4 py-3 text-center">Ventas totales</th>
            <th className="px-4 py-3 text-center">Operación</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                Cargando productos...
              </td>
            </tr>
          )}
          {!loading && productosPagina.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                No se encontraron productos
              </td>
            </tr>
          )}
          {!loading && productosPagina.map((p) => {
            const img        = primeraImagen(p.imagen)
           
            return (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                   
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {img
                        ? <Image src={img} alt={p.nombre} width={40} height={40} className="object-cover h-full w-full" />
                        : <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                      }
                    </div>
                    <span className="font-medium text-gray-800 dark:text-white">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  <div>{p.categoria ?? '—'}</div>
                  <div className="text-gray-400">{p.marca ?? '—'}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${
                    p.stock_total <= 2  ? 'text-red-500'    :
                    p.stock_total <= 10 ? 'text-yellow-500' : 'text-green-600'
                  }`}>
                    {p.stock_total}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                  {p.ventas_totales}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onDetalle(p)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Detalles Ventas
                    </button>
                    <button
                      onClick={() => onPredecir(p)}
                      className="px-3 py-1.5 text-xs font-medium bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Predecir Ventas
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Paginación */}
      {!loading && totalPaginas > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Mostrando {inicio + 1}–{Math.min(inicio + POR_PAGINA, productos.length)} de {productos.length} productos
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina(p => Math.max(p - 1, 1))}
              disabled={paginaReal === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>

            {/* Números de página */}
            {Array.from({ length: totalPaginas }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPaginas || Math.abs(n - paginaReal) <= 1)
              .reduce<(number | '...')[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
                acc.push(n)
                return acc
              }, [])
              .map((n, i) =>
                n === '...'
                  ? <span key={`dots-${i}`} className="px-2 text-gray-400 text-xs">…</span>
                  : <button
                      key={n}
                      onClick={() => setPagina(n as number)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        paginaReal === n
                          ? 'bg-pink-500 text-white border-pink-500'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {n}
                    </button>
              )
            }

            <button
              onClick={() => setPagina(p => Math.min(p + 1, totalPaginas))}
              disabled={paginaReal === totalPaginas}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}