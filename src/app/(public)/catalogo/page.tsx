'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchX } from 'lucide-react'
import DotsLoader from '@/components/ui/DotsLoader'
import ProductoCard, { type ProductoCardType } from '@/components/ui/ProductoCard'
import ProductosFiltros from '@/components/ui/ProductosFiltros'
import Paginacion from '@/components/ui/paginacion'
import { usePromociones } from "@/hooks/usePromociones"

const POR_PAGINA = 12

function ProductosContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const [productos, setProductos] = useState<ProductoCardType[]>([])
  const [cargando, setCargando]   = useState(true)
  const { descuentoParaProducto, precioConDescuento } = usePromociones()

  // ── Estado sincronizado con la URL ──────────────────────────────────────────
  const pagina              = Number(searchParams.get('page')  ?? '1')
  const busqueda            = searchParams.get('q')            ?? ''
  const marcasSeleccionadas = useMemo(
    () => searchParams.get('marcas')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  )
  const categoriasSeleccionadas = useMemo(
    () => searchParams.get('cats')?.split(',').filter(Boolean) ?? [],
    [searchParams]
  )

  // Helper: actualiza la URL conservando los parámetros existentes
  const pushParams = useCallback((updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') p.delete(k)
      else p.set(k, v)
    })
    // Siempre resetea la página salvo que se esté cambiando explícitamente
    if (!('page' in updates)) p.delete('page')
    router.replace(`/catalogo?${p.toString()}`, { scroll: false })
  }, [searchParams, router])

  useEffect(() => {
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        setProductos(Array.isArray(data) ? data : [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  const marcasDisponibles = useMemo(() =>
    Array.from(new Set(productos.map(p => p.marca?.nombre).filter(Boolean) as string[])).sort()
  , [productos])

  const categoriasDisponibles = useMemo(() =>
    Array.from(new Set(productos.map(p => p.categoria?.nombre).filter(Boolean) as string[])).sort()
  , [productos])

  const toggleMarca = (m: string) => {
    const next = marcasSeleccionadas.includes(m)
      ? marcasSeleccionadas.filter(x => x !== m)
      : [...marcasSeleccionadas, m]
    pushParams({ marcas: next.join(',') || null })
  }

  const toggleCategoria = (c: string) => {
    const next = categoriasSeleccionadas.includes(c)
      ? categoriasSeleccionadas.filter(x => x !== c)
      : [...categoriasSeleccionadas, c]
    pushParams({ cats: next.join(',') || null })
  }

  const limpiarFiltros = () => {
    router.replace('/catalogo', { scroll: false })
  }

  const productosFiltrados = useMemo(() =>
    productos
      .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
      .filter(p => marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(p.marca?.nombre ?? ''))
      .filter(p => categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(p.categoria?.nombre ?? ''))
  , [productos, busqueda, marcasSeleccionadas, categoriasSeleccionadas])

  const totalPaginas   = Math.ceil(productosFiltrados.length / POR_PAGINA)
  const productosPagina = productosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const handleBusqueda = (valor: string) => pushParams({ q: valor || null })

  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-gray-950">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-700 py-16 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2" />
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

        <ProductosFiltros
          busqueda={busqueda}
          setBusqueda={handleBusqueda}
          marcasDisponibles={marcasDisponibles}
          marcasSeleccionadas={marcasSeleccionadas}
          toggleMarca={toggleMarca}
          categoriasDisponibles={categoriasDisponibles}
          categoriasSeleccionadas={categoriasSeleccionadas}
          toggleCategoria={toggleCategoria}
          limpiarFiltros={limpiarFiltros}
        />

        {!cargando && (
          <p className="text-sm text-gray-400 mb-6">
            {productosFiltrados.length === productos.length
              ? `${productos.length} productos`
              : `${productosFiltrados.length} de ${productos.length} productos`}
            {totalPaginas > 1 && ` · página ${pagina} de ${totalPaginas}`}
          </p>
        )}

        {cargando && <DotsLoader texto="Cargando productos..." />}

        {!cargando && productosPagina.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosPagina.map(producto => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                descuentoProducto={descuentoParaProducto(producto.id)}
                precioConDescuento={(precio) => precioConDescuento(precio, producto.id)}
              />
            ))}
          </div>
        )}

        {!cargando && productosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <div className="mb-6 flex justify-center">
              <SearchX className="w-16 h-16 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No encontramos productos</p>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Intenta ajustando los filtros o la búsqueda.</p>
            <button onClick={limpiarFiltros}
              className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
              Ver todos los productos
            </button>
          </div>
        )}

        <Paginacion
          paginaActual={pagina}
          totalPaginas={totalPaginas}
          onChange={(p) => {
            pushParams({ page: p === 1 ? null : String(p) })
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
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

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <DotsLoader />
      </div>
    }>
      <ProductosContent />
    </Suspense>
  )
}