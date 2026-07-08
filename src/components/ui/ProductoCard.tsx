'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFavoritos } from '@/hooks/useFavoritos'

export type ProductoCardType = {
  id: number
  nombre: string
  precio_min: number
  en_stock: boolean
  imagen: unknown
  marca:     { nombre: string } | null
  categoria: { nombre: string } | null
  variantes: { id: number; tono: string | null; presentacion: string | null; precio_venta: number; stock: number }[]
}

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0]
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

interface Props {
  producto: ProductoCardType
  descuentoProducto?: number
  precioConDescuento?: (precio: number) => number | null
}

export default function ProductoCard({ producto, descuentoProducto = 0, precioConDescuento }: Props) {
  const foto = getImagen(producto.imagen)
  const sinStock = !producto.en_stock
  const { status } = useSession()
  const router = useRouter()
  const { toggle, esFavorito } = useFavoritos()
  const tonos = [...new Set(producto.variantes.map(v => v.tono).filter(Boolean))] as string[]
  const tieneVariantes = producto.variantes.length > 1

  const precioOriginal = producto.precio_min
  const precioFinal = precioConDescuento ? precioConDescuento(precioOriginal) : null
  const tieneDescuento = !!precioFinal && precioFinal < precioOriginal

  return (
    <article className={`group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-2xl border border-rose-50 dark:border-gray-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${sinStock ? 'opacity-60' : ''}`}>
      <Link href={`/producto/${producto.id}`} className="block">

        {/* Imagen */}
        <div className="relative h-60 overflow-hidden bg-rose-50">
          {foto ? (
            <Image
              src={foto}
              alt={producto.nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-rose-200" />
            </div>
          )}

          {/* Badge descuento — esquina superior izquierda */}
          {tieneDescuento && (
            <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
              -{descuentoProducto}%
            </span>
          )}

          {/* Badge variantes — solo si no hay descuento */}
          {tieneVariantes && !tieneDescuento && (
            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {producto.variantes.length} variantes
            </span>
          )}

          {sinStock && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest">
                Agotado
              </span>
            </div>
          )}

          <div className={`absolute top-3 right-3 z-10 transition-opacity ${esFavorito(producto.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                if (status !== 'authenticated') {
                  router.push(`/login?next=/producto/${producto.id}`)
                  return
                }
                toggle(producto.id)
              }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-rose-600 hover:text-white dark:text-gray-300 transition-all duration-200"
            >
              <Heart
                size={22}
                className={`transition-colors duration-200 ${
                  esFavorito(producto.id)
                    ? 'fill-red-500 stroke-red-500'
                    : 'fill-transparent stroke-gray-400 hover:stroke-red-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            {producto.marca && (
              <span className="text-[10px] uppercase tracking-widest font-black text-rose-400">
                {producto.marca.nombre}
              </span>
            )}
            {producto.categoria && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                {producto.categoria.nombre}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
            {producto.nombre}
          </h3>

          {tonos.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tonos.slice(0, 5).map(tono => (
                <span key={tono} className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-1.5 py-0.5 rounded-full font-medium">
                  {tono}
                </span>
              ))}
              {tonos.length > 5 && (
                <span className="text-[10px] text-gray-400 px-1 py-0.5">+{tonos.length - 5}</span>
              )}
            </div>
          )}

          {/* Precio */}
          <div className="flex items-end gap-2 flex-wrap">
            {tieneDescuento ? (
              <>
                <div className="flex flex-col">
                  {tieneVariantes && (
                    <span className="text-[10px] text-gray-400 font-medium">desde</span>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ${precioFinal!.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">MXN</span>
                  </div>
                  <span className="text-xs text-gray-400 line-through">
                    ${precioOriginal.toLocaleString('es-MX')} MXN
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                {tieneVariantes && (
                  <span className="text-xs text-gray-400 font-medium">desde</span>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    ${precioOriginal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">MXN</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link href={`/producto/${producto.id}`}>
          <button
            disabled={sinStock}
            className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            <ShoppingBag className="inline w-4 h-4 mr-2" />
            {sinStock ? 'Agotado' : 'Ver producto'}
          </button>
        </Link>
      </div>
    </article>
  )
}
