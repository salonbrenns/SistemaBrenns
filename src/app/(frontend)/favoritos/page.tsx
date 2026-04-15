'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart, ShoppingBag, Loader2, Trash2, Wrench } from 'lucide-react'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useFavoritosServicios } from '@/hooks/useFavoritosServicios'
import AuthGuard from '@/components/ui/AuthGuard'

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0] as string
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

export default function FavoritosPage() {
  return (
    <AuthGuard>
      <FavoritosContenido />
    </AuthGuard>
  )
}

function FavoritosContenido() {
  const [tab, setTab] = useState<'productos' | 'servicios'>('productos')

  const { favoritos, cargando: cargandoP, toggle: toggleProducto } = useFavoritos()
  const { favoritos: favServicios, cargando: cargandoS, toggle: toggleServicio } = useFavoritosServicios()
  

  const cargando = cargandoP || cargandoS

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
          <h1 className="text-3xl font-black text-gray-900">
            Mis Favoritos
            <span className="ml-2 text-lg font-semibold text-gray-400">
              ({favoritos.length + favServicios.length})
            </span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b border-rose-100">
          <button
            onClick={() => setTab('productos')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === 'productos'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Productos
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
              tab === 'productos' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {favoritos.length}
            </span>
          </button>
          <button
            onClick={() => setTab('servicios')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
              tab === 'servicios'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Servicios
            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${
              tab === 'servicios' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {favServicios.length}
            </span>
          </button>
        </div>

        {/* ── TAB PRODUCTOS (código original intacto) ── */}
        {tab === 'productos' && (
          <>
            {favoritos.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
                <Heart className="w-20 h-20 text-rose-200 mx-auto mb-6" />
                <p className="text-2xl font-bold text-gray-800 mb-2">Aún no tienes favoritos</p>
                <p className="text-gray-500 mb-8">Guarda los productos que más te gusten</p>
                <Link href="/catalogo">
                  <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
                    Explorar catálogo
                  </button>
                </Link>
              </div>
            )}

            {favoritos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritos.map(fav => {
                  const p = fav.producto
                  const foto = getImagen(p.imagen)

                  return (
                    <article key={fav.id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-rose-50 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <Link href={`/producto/${p.id}`} className="block">
                        <div className="relative h-56 overflow-hidden bg-rose-50">
                          {foto ? (
                            <Image src={foto} alt={p.nombre} fill
                              sizes="(max-width: 640px) 100vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-14 h-14 text-rose-200" />
                            </div>
                          )}
                          {!p.en_stock && (
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <span className="bg-white text-gray-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Agotado</span>
                            </div>
                          )}
                          <button
                            onClick={e => { e.preventDefault(); toggleProducto(p.id) }}
                            className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-md hover:bg-rose-700 transition-all z-10"
                          >
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>

                        <div className="p-5">
                          {p.marca && (
                            <p className="text-[10px] uppercase tracking-widest font-black text-rose-400 mb-1">{p.marca}</p>
                          )}
                          <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-2">
                            {p.nombre}
                          </h3>
                          <p className="text-xl font-black text-gray-900">
                            ${p.precio_min.toLocaleString('es-MX')}
                            <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                          </p>
                        </div>
                      </Link>

                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link href={`/producto/${p.id}`}>
                          <button
                            disabled={!p.en_stock}
                            className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95"
                          >
                            {p.en_stock ? 'Ver producto' : 'Agotado'}
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleProducto(p.id)}
                          className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB SERVICIOS (mismo estilo de card que productos) ── */}
        {tab === 'servicios' && (
          <>
            {favServicios.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
                <Heart className="w-20 h-20 text-rose-200 mx-auto mb-6" />
                <p className="text-2xl font-bold text-gray-800 mb-2">Aún no tienes servicios favoritos</p>
                <p className="text-gray-500 mb-8">Guarda los servicios que más te interesen</p>
                <Link href="/servicios">
                  <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
                    Explorar servicios
                  </button>
                </Link>
              </div>
            )}

            {favServicios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favServicios.map(fav => {
                  const s = fav.servicio
                  const foto = getImagen(s.imagen)

                  return (
                    <article key={fav.id} className="group bg-white rounded-[2rem] shadow-sm hover:shadow-xl border border-rose-50 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <Link href={`/servicio/${s.id}`} className="block">
                        <div className="relative h-56 overflow-hidden bg-rose-50">
                          {foto ? (
                            <Image src={foto} alt={s.nombre} fill
                              sizes="(max-width: 640px) 100vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Wrench className="w-14 h-14 text-rose-200" />
                            </div>
                          )}
                          <button
                            onClick={e => { e.preventDefault(); toggleServicio(s.id) }}
                            className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-md hover:bg-rose-700 transition-all z-10"
                          >
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>

                        <div className="p-5">
                          {s.categoria && (
                            <p className="text-[10px] uppercase tracking-widest font-black text-rose-400 mb-1">{s.categoria}</p>
                          )}
                          <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-2">
                            {s.nombre}
                          </h3>
                          <p className="text-xl font-black text-gray-900">
                            ${s.precio_min.toLocaleString('es-MX')}
                            <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                          </p>
                        </div>
                      </Link>

                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link href={`/servicio/${s.id}`}>
                          <button className="w-full bg-gray-900 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95">
                            Ver servicio
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleServicio(s.id)}
                          className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Quitar
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}