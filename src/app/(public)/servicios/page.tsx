// src/app/(frontend)/servicios/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import ServicioCard from '@/components/ui/ServicioCard'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import type { ServicioCardType } from '@/components/ui/ServicioCard'
import FiltroServicios from '@/components/ui/FiltroServicios'
import Paginacion from '@/components/ui/paginacion'

const POR_PAGINA = 12

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<ServicioCardType[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    fetch('/api/servicios')
      .then(r => r.json())
      .then(data => {
        // La API ya devuelve todo normalizado — sin mapeo adicional
        setServicios(data.servicios || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  // categoria ya es string puro — sin null, sin cast
  const categoriasDisponibles = useMemo(() =>
    Array.from(new Set(servicios.map(s => s.categoria))).sort()
  , [servicios])

  const toggleCategoria = (c: string) => {
    setCategoriasSeleccionadas(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    )
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setCategoriasSeleccionadas([])
    setPagina(1)
  }

  const handleBusqueda = (valor: string) => { setBusqueda(valor); setPagina(1) }

  const serviciosFiltrados = useMemo(() =>
    servicios
      .filter(s => s.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .filter(s => categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(s.categoria))
  , [servicios, busqueda, categoriasSeleccionadas])

  const totalPaginas = Math.ceil(serviciosFiltrados.length / POR_PAGINA)
  const serviciosPagina = serviciosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-gray-950">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-pink-900 via-pink-700 to-rose-600 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-[1400px] mx-auto text-center">
          <p className="text-pink-300 text-xs font-bold uppercase tracking-[0.3em] mb-3">Tratamientos</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Nuestros Servicios
          </h1>
          <p className="text-pink-200 text-lg max-w-xl mx-auto">
            Descubre nuestros tratamientos profesionales de manicure y pedicura
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <FiltroServicios
          busqueda={busqueda}
          setBusqueda={handleBusqueda}
          categoriasDisponibles={categoriasDisponibles}
          categoriasSeleccionadas={categoriasSeleccionadas}
          toggleCategoria={toggleCategoria}
          limpiarFiltros={limpiarFiltros}
        />

        {!cargando && (
          <p className="text-sm text-gray-400 mb-6">
            {serviciosFiltrados.length === servicios.length
              ? `${servicios.length} servicios`
              : `${serviciosFiltrados.length} de ${servicios.length} servicios`}
            {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
          </p>
        )}

        {cargando && <SkeletonGrid tipo="servicio" cantidad={8} />}

        {!cargando && serviciosPagina.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {serviciosPagina.map(servicio => (
              <ServicioCard key={servicio.id} servicio={servicio} />
            ))}
          </div>
        )}

        {!cargando && serviciosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] shadow-inner border-2 border-dashed border-pink-100">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No encontramos servicios</p>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Intenta ajustando los filtros o la búsqueda.</p>
            <button
              onClick={limpiarFiltros}
              className="px-8 py-3 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition shadow-xl"
            >
              Ver todos los servicios
            </button>
          </div>
        )}

        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onChange={p => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />

        <footer className="text-center mt-20 pt-10 border-t border-pink-100">
          <p className="text-gray-400 font-medium italic">
            Actualizamos nuestro catálogo regularmente.
          </p>
        </footer>
      </div>
    </main>
  )
}