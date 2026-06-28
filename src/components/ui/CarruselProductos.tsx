"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { useCarrusel } from "@/hooks/useCarrusel"

type Producto = {
  id: number
  nombre: string
  precio_venta: number
  imagen: string[] | string | null
  marca: { nombre: string } | null
}

function getImagen(imagen: Producto["imagen"]): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0]
  if (typeof imagen === "string" && imagen.length > 0) return imagen
  return null
}

export default function CarruselProductos({ productos = [] }: { productos: Producto[] }) {
  const { idx, total, prev, next, goTo, slice } = useCarrusel(productos, 3)

  return (
    <section className="bg-white dark:bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-pink-600 text-xs font-bold uppercase tracking-widest mb-1">Cuidado en casa</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Productos destacados</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-400">{idx + 1} / {total}</span>
            <button onClick={next} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center hover:border-pink-400 hover:text-pink-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <Link href="/catalogo" className="inline-flex items-center gap-1.5 text-pink-600 font-semibold hover:text-pink-700 transition text-sm group ml-2">
              Ver catálogo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slice.map(p => {
            const foto = getImagen(p.imagen)
            return (
              <Link key={p.id} href={`/producto/${p.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-pink-200 hover:shadow-lg transition-all">
                <div className="relative h-48 bg-gray-50 overflow-hidden">
                  {foto ? (
                    <Image src={foto} alt={p.nombre} fill sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
                      <ShoppingBag className="w-10 h-10 text-pink-200" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {p.marca && <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">{p.marca.nombre}</span>}
                  <h3 className="font-bold text-gray-900 dark:text-white mt-1 mb-3 line-clamp-1">{p.nombre}</h3>
                  <span className="text-lg font-bold text-pink-600">${Number(p.precio_venta).toLocaleString()} MXN</span>
                </div>
              </Link>
            )
          })}
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
