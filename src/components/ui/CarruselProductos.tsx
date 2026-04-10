"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"

type Producto = {
  id: number
  nombre: string
  precio_venta: number
  imagen: string | null
  marca: { nombre: string } | null
}

// Función mejorada para detectar si es una ruta local válida
const esLocal = (img: string | null | undefined): img is string =>
  !!img && img.length > 0 && !img.startsWith("http")

export default function CarruselProductos({ productos = [] }: { productos: Producto[] }) {
  const [idx, setIdx] = useState(0)
  const porPagina = 3
  

  const esLocal = (img: string | null | undefined): img is string =>
  !!img && 
  img.length > 0 && 
  typeof img === 'string' &&
  !img.startsWith("http") && 
  img.startsWith("/") // ← solo rutas que empiecen con /
  // Evitamos división por cero si productos está vacío
  const total = productos.length > 0 ? Math.ceil(productos.length / porPagina) : 1

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  const handlePrev = () => { prev(); }
  const handleNext = () => { next(); }

  // Slice seguro de los productos a mostrar
  const slice = productos.slice(idx * porPagina, idx * porPagina + porPagina)

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Cuidado en casa</p>
            <h2 className="text-3xl font-bold text-gray-900">Productos Destacados</h2>
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
            <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-pink-600 font-semibold hover:text-pink-700 transition text-sm group ml-2">
              Ver catálogo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(p => (
            <Link key={p.id} href={`/producto/${p.id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all">
              <div className="relative h-48 overflow-hidden bg-gray-50">
                {/* VALIDACIÓN CRÍTICA: Solo renderiza Image si p.imagen existe y esLocal es true */}
                {p.imagen && esLocal(p.imagen) ? (
                  <Image 
                    src={p.imagen} 
                    alt={p.nombre} 
                    fill 
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                    <ShoppingBag className="w-10 h-10 text-pink-200" />
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {p.marca?.nombre || "Brenn&apos;s"}
                </span>
                <h3 className="font-bold text-gray-900 mt-1 mb-3 line-clamp-1">{p.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-pink-600">${p.precio_venta.toLocaleString()} MXN</span>
                  <span className="text-xs font-medium px-2 py-1 bg-pink-50 rounded-md text-pink-500">
                    Disponible
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Dots - Solo se muestran si hay más de una página */}
        {total > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: total }).map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); }}
                className={`h-2 rounded-full transition-all ${i === idx ? "bg-pink-600 w-6" : "bg-gray-300 w-2"}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}