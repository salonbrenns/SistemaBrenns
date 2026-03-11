// src/app/(frontend)/servicios/page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Loader2, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import FilterSidebar from '@/components/ui/filter-sidebar'

type Servicio = {
  id: number
  nombre: string
  precio: number
  categoria: string
  imagen: string | null
  duracion: string
}

export default function ServiciosPage() {
  const [serviciosData, setServiciosData] = useState<Servicio[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])

  // Cargar servicios desde la BD
  useEffect(() => {
    fetch("/api/servicios")
      .then(r => r.json())
      .then(data => {
        setServiciosData(data.servicios || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const categoriasDisponibles = Array.from(new Set(serviciosData.map(s => s.categoria)))

  const toggleCategoria = (categoria: string) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(categoria) ? prev.filter(c => c !== categoria) : [...prev, categoria]
    )
  }

  const limpiarFiltros = () => {
    setBusqueda("")
    setCategoriasSeleccionadas([])
  }

  const serviciosFiltrados = serviciosData
    .filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(s => categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(s.categoria))

  return (
    <main className="min-h-screen bg-[#fffafa] py-12">
      <div className="max-w-[1400px] mx-auto px-6">

      

        {/* BARRA DE FILTROS HORIZONTAL */}
        <div className="mb-10">
          <FilterSidebar
            title="Filtrar por:"
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            categoriasSeleccionadas={categoriasSeleccionadas}
            categoriasDisponibles={categoriasDisponibles}
            toggleCategoria={toggleCategoria}
            limpiarFiltros={limpiarFiltros}
          />
        </div>

        {/* CONTENIDO PRINCIPAL - Ahora ocupa todo el ancho */}
        <section aria-label="Lista de servicios disponibles">
          
          {/* Estado: Cargando */}
          {cargando && (
            <div className="flex flex-col justify-center items-center py-40">
              <Loader2 className="w-16 h-16 text-pink-400 animate-spin mb-4" />
              <p className="text-pink-600 font-medium animate-pulse">Preparando algo especial para ti...</p>
            </div>
          )}

          {/* Grid de servicios: 4 columnas en pantallas grandes */}
          {!cargando && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {serviciosFiltrados.map((servicio) => (
                <article 
                  key={servicio.id} 
                  className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-pink-50 overflow-hidden transition-all duration-500 hover:-translate-y-2"
                >
                  <Link href={`/servicio/${servicio.id}`} className="block">
                    <div className="relative h-64 overflow-hidden bg-pink-50">
                      {servicio.imagen ? (
                        <Image
                          src={servicio.imagen}
                          alt={servicio.nombre}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          ✨
                        </div>
                      )}
                      
                      {/* Badge de Duración */}
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-1.5 rounded-full font-bold shadow-sm text-xs border border-pink-100">
                        {servicio.duracion}
                      </div>

                      {/* Botón Favorito */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2.5 rounded-full shadow-md hover:bg-pink-600 hover:text-white transition-all z-10 text-pink-600"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-pink-400 mb-2 block">
                        {servicio.categoria}
                      </span>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors line-clamp-1">
                        {servicio.nombre}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900">${Number(servicio.precio).toLocaleString()}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">MXN</span>
                      </div>
                    </div>
                  </Link>

                  <div className="px-6 pb-6">
                    <Link href={`/servicio/${servicio.id}`}>
                      <button className="w-full bg-gray-900 hover:bg-pink-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 text-sm">
                        Reservar Ahora
                      </button>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!cargando && serviciosFiltrados.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-pink-100">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                No encontramos lo que buscas
              </p>
              <p className="text-gray-500 mb-8">Intenta ajustando los filtros o la búsqueda.</p>
              <button
                onClick={limpiarFiltros}
                className="px-8 py-3 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition shadow-xl"
              >
                Ver todos los servicios
              </button>
            </div>
          )}
        </section>

        <footer className="text-center mt-20 pt-10 border-t border-pink-100">
          <p className="text-gray-400 font-medium italic">
            Estamos actualizando nuestro catálogo semanalmente.
          </p>
        </footer>
      </div>
    </main>
  )
}