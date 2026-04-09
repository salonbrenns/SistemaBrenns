import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'

export type ProductoCardType = {
  id: number
  nombre: string
  precio_venta: number
  stock: number
  imagen: unknown
  marca: { nombre: string } | null
  categoria: { nombre: string } | null
}

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0]
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

function getTotalFotos(imagen: unknown): number {
  if (Array.isArray(imagen)) return imagen.length
  if (typeof imagen === 'string') return 1
  return 0
}

export default function ProductoCard({ producto }: { producto: ProductoCardType }) {
  const foto = getImagen(producto.imagen)
  const totalFotos = getTotalFotos(producto.imagen)
  const sinStock = producto.stock === 0

  return (
    <article
      className={`group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl border border-rose-50 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
        sinStock ? 'opacity-60' : ''
      }`}
    >
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

          {totalFotos > 1 && (
            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              +{totalFotos} fotos
            </span>
          )}

          {sinStock && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest">
                Agotado
              </span>
            </div>
          )}

          <button
            onClick={e => { e.preventDefault(); e.stopPropagation() }}
            className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-rose-600 hover:text-white transition-all z-10 text-rose-600 opacity-0 group-hover:opacity-100"
          >
            <Heart className="w-4 h-4" />
          </button>
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
          <h3 className="text-base font-bold text-gray-800 mb-3 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
            {producto.nombre}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">
              ${Number(producto.precio_venta).toLocaleString('es-MX')}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">MXN</span>
          </div>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link href={`/producto/${producto.id}`}>
          <button
            disabled={sinStock}
            className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm"
          >
            {sinStock ? 'Sin disponibilidad' : 'Ver producto'}
          </button>
        </Link>
      </div>
    </article>
  )
}