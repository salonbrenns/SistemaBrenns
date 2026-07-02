'use client'

import { useState, useEffect } from 'react' // Eliminado useCallback
import { ProductoFila, FiltroOpcion } from './types'
import FiltrosProyeccion from '@/components/proyeccion/FiltrosProyeccion'
import TablaProductos    from '@/components/proyeccion/TablaProductos'
import ModalDetalle      from '@/components/proyeccion/ModalDetalle'
import ModalPrediccion   from '@/components/proyeccion/ModalPrediccion'
import TopProductos      from '@/components/proyeccion/TopProductos'

export default function ProyeccionPage() {
  const [productos,       setProductos]       = useState<ProductoFila[]>([])
  const [loading,         setLoading]         = useState(true)
  const [busqueda,        setBusqueda]        = useState('')
  const [categoriaId,     setCategoriaId]     = useState<number | null>(null)
  const [marcaId,         setMarcaId]         = useState<number | null>(null)
  const [categorias,      setCategorias]      = useState<FiltroOpcion[]>([])
  const [marcas,          setMarcas]          = useState<FiltroOpcion[]>([])
  const [modalDetalle,    setModalDetalle]    = useState<ProductoFila | null>(null)
  const [modalPrediccion, setModalPrediccion] = useState<ProductoFila | null>(null)
  const [verTop,          setVerTop]          = useState(false)

  // 1. Carga inicial de filtros (Categorías y Marcas)
  useEffect(() => {
    fetch('/api/categorias').then(r => r.json()).then(setCategorias).catch(() => [])
    fetch('/api/marcas').then(r => r.json()).then(setMarcas).catch(() => [])
  }, [])

  // 2. Carga de productos (Fusionado y optimizado)
useEffect(() => {
  let activo = true

  const fetchProductos = async () => {
    try {
      if (activo) setLoading(true)

      const params = new URLSearchParams()
      if (categoriaId) params.set('categoria_id', String(categoriaId))
      if (marcaId)     params.set('marca_id', String(marcaId))

      const res = await fetch(`/api/admin/proyeccion/productos?${params}`)
      const d = await res.json()

      if (activo) {
        setProductos(d)
        setLoading(false)
      }
    } catch {
      if (activo) setLoading(false)
    }
  }

  fetchProductos()

  return () => { activo = false }
}, [categoriaId, marcaId])
  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Predicción de Ventas</h1>
      </div>

      <FiltrosProyeccion
        busqueda={busqueda}
        categoriaId={categoriaId}
        marcaId={marcaId}
        categorias={categorias}
        marcas={marcas}
        onBusqueda={setBusqueda}
        onCategoria={setCategoriaId}
        onMarca={setMarcaId}
        onLimpiar={() => { setCategoriaId(null); setMarcaId(null); setBusqueda('') }}
      />

      {!loading && productos.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setVerTop(v => !v)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors text-gray-700 dark:text-gray-300"
          >
            <span>🏆</span>
            <span>{verTop ? 'Ocultar' : 'Ver'} productos más vendidos</span>
            <span className={`transition-transform inline-block ${verTop ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {verTop && <TopProductos productos={productos} />}
        </div>
      )}

      <TablaProductos
        productos={productosFiltrados}
        loading={loading}
        onDetalle={setModalDetalle}
        onPredecir={setModalPrediccion}
      />

      {modalDetalle    && <ModalDetalle    producto={modalDetalle}    onClose={() => setModalDetalle(null)} />}
      {modalPrediccion && <ModalPrediccion producto={modalPrediccion} onClose={() => setModalPrediccion(null)} />}
    </div>
  )
}