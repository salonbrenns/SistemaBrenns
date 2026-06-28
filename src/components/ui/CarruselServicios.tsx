"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Scissors, ChevronLeft, ChevronRight } from "lucide-react"
import { useCarrusel } from "@/hooks/useCarrusel"

type Servicio = {
  id: number
  nombre: string
  precio: number
  duracion: string
  imagen: string | null
  categoria: { id: number; nombre: string; activo: boolean } | null
}

export default function CarruselServicios({ servicios }: { servicios: Servicio[] }) {
  const { idx, total, prev, next, goTo, slice } = useCarrusel(servicios, 3)

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Lo que ofrecemos</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Nuestros Servicios</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">{idx + 1} / {total}</span>
            <button onClick={next} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/servicios" className="inline-flex items-center gap-1.5 text-pink-600 font-semibold hover:text-pink-700 transition text-sm group ml-2">
              Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(s => (
            <Link key={s.id} href={`/servicio/${s.id}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-pink-200 hover:shadow-lg transition-all">
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                {s.imagen ? (
                  <Image src={s.imagen} alt={s.nombre} fill sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                    <Scissors className="w-10 h-10 text-pink-200" />
                  </div>
                )}
              </div>
              <div className="p-5">
                {s.categoria && <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">{s.categoria.nombre}</span>}
                <h3 className="font-bold text-gray-900 dark:text-white mt-1 mb-3 line-clamp-1">{s.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-pink-600">${Number(s.precio).toLocaleString()} MXN</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" /> {s.duracion}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {total > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === idx ? "bg-pink-600 w-6" : "bg-gray-300 w-2"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
