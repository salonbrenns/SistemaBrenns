"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, GraduationCap, Clock, ChevronLeft, ChevronRight } from "lucide-react"

type Curso = {
  id: number
  titulo: string
  precio_total: number
  duracion_horas: number | null
  nivel: string | null
  imagenes: string[] | string | null
}

function getImagen(imagenes: Curso['imagenes']): string | null {
  if (Array.isArray(imagenes) && imagenes.length > 0) return imagenes[0]
  if (typeof imagenes === 'string' && imagenes.length > 0) return imagenes
  return null
}

export default function CarruselCursos({ cursos = [] }: { cursos: Curso[] }) {
  const [idx, setIdx] = useState(0)
  const porPagina = 3
  const total = cursos.length > 0 ? Math.ceil(cursos.length / porPagina) : 1

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  const slice = cursos.slice(idx * porPagina, idx * porPagina + porPagina)

  return (
    <section className="bg-pink-50/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Aprende con nosotras</p>
            <h2 className="text-3xl font-bold text-gray-900">Academia Brenn&apos;s</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prev}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">{idx + 1} / {total}</span>
            <button onClick={next}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/cursos" className="inline-flex items-center gap-1.5 text-pink-600 font-semibold hover:text-pink-700 transition text-sm group ml-2">
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(c => {
            const foto = getImagen(c.imagenes)
            return (
              <Link key={c.id} href={`/curso/${c.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all">
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  {foto ? (
                    <Image
                      src={foto}
                      alt={c.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                      <GraduationCap className="w-10 h-10 text-pink-200" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">
                    {c.nivel || 'Principiante'}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-1 mb-3 line-clamp-1">{c.titulo}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">
                      ${Number(c.precio_total).toLocaleString()} MXN
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {c.duracion_horas} hrs
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "bg-pink-600 w-6" : "bg-gray-300 w-2"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}