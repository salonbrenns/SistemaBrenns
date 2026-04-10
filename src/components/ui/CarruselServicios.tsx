"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Scissors, ChevronLeft, ChevronRight } from "lucide-react"

type Servicio = {
  id: number
  nombre: string
  precio: number
  duracion: string
  imagen: string | null
  categoria: string
}

const esLocal = (img: string | null | undefined): img is string =>
  !!img && !img.startsWith("http")

export default function CarruselServicios({ servicios }: { servicios: Servicio[] }) {
  const [idx, setIdx] = useState(0)
  const porPagina = 3
  const total = Math.ceil(servicios.length / porPagina)

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)



  const handlePrev = () => { prev()}
  const handleNext = () => { next(); }

  const slice = servicios.slice(idx * porPagina, idx * porPagina + porPagina)

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Lo que ofrecemos</p>
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Servicios</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrev}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">{idx + 1} / {total}</span>
            <button onClick={handleNext}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
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
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden">
                {esLocal(s.imagen) ? (
                  <Image src={s.imagen} alt={s.nombre} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center">
                    <Scissors className="w-10 h-10 text-pink-200" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">{s.categoria}</span>
                <h3 className="font-bold text-gray-900 mt-1 mb-3">{s.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-pink-600">${s.precio.toLocaleString()} MXN</span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />{s.duracion}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => { setIdx(i); }}
              className={`h-2 rounded-full transition-all ${i === idx ? "bg-pink-600 w-6" : "bg-gray-300 w-2"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}