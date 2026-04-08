'use client'

import { useState, useEffect, useMemo } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import ProductoCard, { type ProductoCardType } from '@/components/ui/ProductoCard'
import ProductosFiltros from '@/components/ui/ProductosFiltros'
import Paginacion from '@/components/ui/paginacion'

const POR_PAGINA = 12

export default function ProductosPage() {
  const [productos, setProductos] = useState<ProductoCardType[]>([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>([])
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState<string[]>([])
  const [pagina, setPagina] = useState(1)

  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        const activos = (Array.isArray(data) ? data : []).filter((p: ProductoCardType & { activo: boolean }) => p.activo)
        setProductos(activos)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  // Opciones de filtros
  const marcasDisponibles = useMemo(() =>
    Array.from(new Set(productos.map(p => p.marca?.nombre).filter(Boolean) as string[])).sort()
  , [productos])

  const categoriasDisponibles = useMemo(() =>
    Array.from(new Set(productos.map(p => p.categoria?.nombre).filter(Boolean) as string[])).sort()
  , [productos])

  const toggleMarca = (m: string) => {
    setMarcasSeleccionadas(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
    setPagina(1)
  }

  const toggleCategoria = (c: string) => {
    setCategoriasSeleccionadas(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setMarcasSeleccionadas([])
    setCategoriasSeleccionadas([])
    setPagina(1)
  }

  // Filtrado
  const productosFiltrados = useMemo(() =>
    productos
      .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .filter(p => marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(p.marca?.nombre ?? ''))
      .filter(p => categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(p.categoria?.nombre ?? ''))
  , [productos, busqueda, marcasSeleccionadas, categoriasSeleccionadas])

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / POR_PAGINA)
  const productosPagina = productosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  // Resetear página al cambiar búsqueda
  useEffect(() => { setPagina(1) }, [busqueda])

  return (
    <main className="min-h-screen bg-[#fffafa]">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-700 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-300 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-[1400px] mx-auto text-center">
          <p className="text-rose-300 text-xs font-bold uppercase tracking-[0.3em] mb-3">Colección</p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Nuestros Productos
          </h1>
          <p className="text-rose-200 text-lg max-w-xl mx-auto">
            Descubre nuestra selección de productos de belleza y cuidado personal
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10">

        {/* Filtros */}
        <ProductosFiltros
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          marcasDisponibles={marcasDisponibles}
          marcasSeleccionadas={marcasSeleccionadas}
          toggleMarca={toggleMarca}
          categoriasDisponibles={categoriasDisponibles}
          categoriasSeleccionadas={categoriasSeleccionadas}
          toggleCategoria={toggleCategoria}
          limpiarFiltros={limpiarFiltros}
        />

        {/* Contador */}
        {!cargando && (
          <p className="text-sm text-gray-400 mb-6">
            {productosFiltrados.length === productos.length
              ? `${productos.length} productos`
              : `${productosFiltrados.length} de ${productos.length} productos`}
            {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
          </p>
        )}

        {/* Cargando */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-rose-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-rose-600 font-medium animate-pulse mt-4">Cargando productos...</p>
          </div>
        )}

        {/* Grid */}
        {!cargando && productosPagina.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosPagina.map(producto => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {!cargando && productosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-2xl font-bold text-gray-800 mb-2">No encontramos productos</p>
            <p className="text-gray-500 mb-8">Intenta ajustando los filtros o la búsqueda.</p>
            <button
              onClick={limpiarFiltros}
              className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl"
            >
              Ver todos los productos
            </button>
          </div>
        )}

        {/* Paginación */}
        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onChange={(p) => { setPagina(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />

        <footer className="text-center mt-20 pt-10 border-t border-rose-100">
          <p className="text-gray-400 font-medium italic">
            Actualizamos nuestro catálogo regularmente.
          </p>
        </footer>
      </div>
    </main>
  )
}