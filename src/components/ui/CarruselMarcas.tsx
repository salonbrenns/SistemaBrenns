"use client"
import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Marca = {
  nombre: string
  img: string
}

export default function CarruselMarcas({ marcas }: { marcas: Marca[] }) {
  const [idx, setIdx] = useState(0)
  const porPagina = 4
  const total = Math.ceil(marcas.length / porPagina)

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)


  const handlePrev = () => { prev(); }
  const handleNext = () => { next(); }

  const slice = marcas.slice(idx * porPagina, idx * porPagina + porPagina)

  return (
    <section className="bg-gray-50 py-16 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Calidad Profesional</p>
            <h2 className="text-2xl font-bold text-gray-900">Marcas que utilizamos</h2>
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
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 items-center justify-items-center">
          {slice.map((marca, i) => (
            <div key={i}
                    className="w-40 h-24 relative transition-all duration-300 hover:scale-110">


             {marca.img && (
  <Image src={`/marcas/${marca.img}`} alt={marca.nombre} fill className="object-contain" />
)}
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => { setIdx(i) }}
              className={`h-2 rounded-full transition-all ${i === idx ? "bg-pink-600 w-6" : "bg-gray-300 w-2"}`} />
          ))}
        </div>
      </div>
    </section>
  )
}