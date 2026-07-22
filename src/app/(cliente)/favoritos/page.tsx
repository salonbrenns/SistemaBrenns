'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart, ShoppingBag, Trash2, Wrench, GraduationCap, Clock } from 'lucide-react'
import { useFavoritos } from '@/hooks/useFavoritos'
import { useFavoritosServicios } from '@/hooks/useFavoritosServicios'
import AuthGuard from '@/components/ui/AuthGuard'

type CursoFav = {
  id:            number
  titulo:        string
  nivel:         string | null
  precio_total:  number
  cupo_maximo:   number
  inscritos:     number
  imagenes:      string[]
  duracion_horas: number | null
}

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
  const [tab, setTab] = useState<'productos' | 'servicios' | 'cursos'>('productos')

  const { favoritos, cargando: cargandoP, toggle: toggleProducto } = useFavoritos()
  const { favoritos: favServicios, cargando: cargandoS, toggle: toggleServicio } = useFavoritosServicios()

  // Cursos favoritos — fetch directo (raw SQL API)
  const [favCursos,    setFavCursos]    = useState<CursoFav[]>([])
  const [favCursoIds,  setFavCursoIds]  = useState<number[]>([])
  const [cargandoC,    setCargandoC]    = useState(true)

  const cargarCursos = async () => {
    setCargandoC(true)
    try {
      const res = await fetch('/api/favoritos-cursos')
      if (res.ok) {
        const data = await res.json()
        setFavCursoIds(data.favoritos ?? [])
        setFavCursos(data.cursos ?? [])
      }
    } finally {
      setCargandoC(false)
    }
  }

  useEffect(() => { cargarCursos() }, [])

  const toggleCurso = async (cursoId: number) => {
    await fetch('/api/favoritos-cursos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cursoId }),
    })
    await cargarCursos()
  }

  const cargando = cargandoP || cargandoS || cargandoC
  const totalFavs = favoritos.length + favServicios.length + favCursoIds.length

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
      </div>
    )
  }

  const tabClass = (t: typeof tab) =>
    `flex items-center gap-2 px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
      tab === t
        ? 'border-rose-600 text-rose-600'
        : 'border-transparent text-gray-400 hover:text-gray-700 dark:text-gray-300'
    }`
  const countClass = (t: typeof tab) =>
    `text-xs font-black px-1.5 py-0.5 rounded-full ${
      tab === t ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
    }`

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-rose-600 fill-rose-600" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Mis Favoritos
            <span className="ml-2 text-lg font-semibold text-gray-400">({totalFavs})</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 border-b border-rose-100 dark:border-gray-700">
          <button onClick={() => setTab('productos')} className={tabClass('productos')}>
            <ShoppingBag className="w-4 h-4" />
            Productos
            <span className={countClass('productos')}>{favoritos.length}</span>
          </button>
          <button onClick={() => setTab('servicios')} className={tabClass('servicios')}>
            <Wrench className="w-4 h-4" />
            Servicios
            <span className={countClass('servicios')}>{favServicios.length}</span>
          </button>
          <button onClick={() => setTab('cursos')} className={tabClass('cursos')}>
            <GraduationCap className="w-4 h-4" />
            Cursos
            <span className={countClass('cursos')}>{favCursoIds.length}</span>
          </button>
        </div>

        {/* ── TAB PRODUCTOS ── */}
        {tab === 'productos' && (
          <>
            {favoritos.length === 0 && <TabVacio href="/catalogo" label="Explora el catálogo" icono={<ShoppingBag className="w-14 h-14 text-rose-200" />} texto="Guarda los productos que más te gusten" />}
            {favoritos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoritos.map(fav => {
                  const p = fav.producto
                  const foto = getImagen(p.imagen)
                  return (
                    <article key={fav.id} className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl border border-rose-50 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <Link href={`/producto/${p.id}`} className="block">
                        <div className="relative h-56 overflow-hidden bg-rose-50 dark:bg-gray-700">
                          {foto ? (
                            <Image src={foto} alt={p.nombre} fill sizes="(max-width: 640px) 100vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-14 h-14 text-rose-200" /></div>
                          )}
                          {!p.en_stock && (
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <span className="bg-white text-gray-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Agotado</span>
                            </div>
                          )}
                          <button onClick={e => { e.preventDefault(); toggleProducto(p.id) }}
                            className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-md hover:bg-rose-700 transition-all z-10">
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                        <div className="p-5">
                          {p.marca && <p className="text-[10px] uppercase tracking-widest font-black text-rose-400 mb-1">{p.marca}</p>}
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-2">{p.nombre}</h3>
                          <p className="text-xl font-black text-gray-900 dark:text-white">${p.precio_min.toLocaleString('es-MX')}<span className="text-xs font-normal text-gray-400 ml-1">MXN</span></p>
                        </div>
                      </Link>
                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link href={`/producto/${p.id}`}>
                          <button disabled={!p.en_stock} className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95">
                            {p.en_stock ? 'Ver producto' : 'Agotado'}
                          </button>
                        </Link>
                        <button onClick={() => toggleProducto(p.id)}
                          className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1">
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

        {/* ── TAB SERVICIOS ── */}
        {tab === 'servicios' && (
          <>
            {favServicios.length === 0 && <TabVacio href="/servicios" label="Explorar servicios" icono={<Wrench className="w-14 h-14 text-rose-200" />} texto="Guarda los servicios que más te interesen" />}
            {favServicios.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favServicios.map(fav => {
                  const s = fav.servicio
                  const foto = getImagen(s.imagen)
                  return (
                    <article key={fav.id} className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl border border-rose-50 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <Link href={`/servicio/${s.id}`} className="block">
                        <div className="relative h-56 overflow-hidden bg-rose-50 dark:bg-gray-700">
                          {foto ? (
                            <Image src={foto} alt={s.nombre} fill sizes="(max-width: 640px) 100vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Wrench className="w-14 h-14 text-rose-200" /></div>
                          )}
                          <button onClick={e => { e.preventDefault(); toggleServicio(s.id) }}
                            className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-md hover:bg-rose-700 transition-all z-10">
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                        </div>
                        <div className="p-5">
                          {s.categoria && <p className="text-[10px] uppercase tracking-widest font-black text-rose-400 mb-1">{s.categoria}</p>}
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-2">{s.nombre}</h3>
                          <p className="text-xl font-black text-gray-900 dark:text-white">${s.precio_min.toLocaleString('es-MX')}<span className="text-xs font-normal text-gray-400 ml-1">MXN</span></p>
                        </div>
                      </Link>
                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link href={`/servicio/${s.id}`}>
                          <button className="w-full bg-gray-900 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95">Ver servicio</button>
                        </Link>
                        <button onClick={() => toggleServicio(s.id)}
                          className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1">
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

        {/* ── TAB CURSOS ── */}
        {tab === 'cursos' && (
          <>
            {favCursos.length === 0 && <TabVacio href="/cursos" label="Ver catálogo de cursos" icono={<GraduationCap className="w-14 h-14 text-rose-200" />} texto="Guarda los cursos que más te interesen" />}
            {favCursos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favCursos.map(curso => {
                  const foto = curso.imagenes[0] ?? null
                  const cupoDisponible = curso.cupo_maximo - curso.inscritos
                  return (
                    <article key={curso.id} className="group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-xl border border-rose-50 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1">
                      <Link href={`/curso/${curso.id}`} className="block">
                        <div className="relative h-48 overflow-hidden bg-rose-50 dark:bg-gray-700">
                          {foto ? (
                            <Image src={foto} alt={curso.titulo} fill sizes="(max-width: 640px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>
                          )}
                          <button onClick={e => { e.preventDefault(); toggleCurso(curso.id) }}
                            className="absolute top-3 right-3 bg-rose-600 text-white p-2 rounded-full shadow-md hover:bg-rose-700 transition-all z-10">
                            <Heart className="w-4 h-4 fill-white" />
                          </button>
                          {curso.nivel && (
                            <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/80 text-xs font-bold px-3 py-1 rounded-full">{curso.nivel}</span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-rose-600 transition-colors mb-2">{curso.titulo}</h3>
                          <div className="flex items-center gap-3 mb-2">
                            {curso.duracion_horas && (
                              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {curso.duracion_horas}h</span>
                            )}
                            <span className="text-xs text-gray-400">{cupoDisponible} lugares</span>
                          </div>
                          <p className="text-xl font-black text-gray-900 dark:text-white">${curso.precio_total.toLocaleString('es-MX')}<span className="text-xs font-normal text-gray-400 ml-1">MXN</span></p>
                        </div>
                      </Link>
                      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                        <Link href={`/curso/${curso.id}`}>
                          <button className="w-full bg-gray-900 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95">Ver curso</button>
                        </Link>
                        <button onClick={() => toggleCurso(curso.id)}
                          className="w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-1">
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

function TabVacio({ href, label, icono, texto }: { href: string; label: string; icono: React.ReactNode; texto: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4">{icono}</div>
      <p className="text-gray-400 text-lg font-medium mb-1">{texto}</p>
      <Link href={href} className="mt-4 inline-block bg-rose-600 hover:bg-rose-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all active:scale-95">
        {label}
      </Link>
    </div>
  )
}
