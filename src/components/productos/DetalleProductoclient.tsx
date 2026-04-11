'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, ShoppingBag, Tag, Layers, Package, Plus, Minus, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useCarrito } from '@/hooks/useCarrito'
import { useFavoritos } from '@/hooks/useFavoritos'

interface Variante {
  id: number
  tono: string | null
  presentacion: string | null
  precio_venta: number
  stock: number
  imagenes: string[]
}

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  imagenesPadre: string[]
  marca: { nombre: string } | null
  categoria: { nombre: string } | null
  variantes: Variante[]
}

export default function DetalleProductoClient({ producto }: Readonly<{ producto: Producto }>) {
  const { status } = useSession()
  const autenticado = status === 'authenticated'
  const { agregar } = useCarrito()
  const { toggle, esFavorito } = useFavoritos()
  const [varianteActiva, setVarianteActiva] = useState<Variante>(producto.variantes[0])
  const [imagenActivaIdx, setImagenActivaIdx] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [agregando, setAgregando] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const imagenes = varianteActiva.imagenes.length > 0 ? varianteActiva.imagenes : producto.imagenesPadre

  useEffect(() => {
    setImagenActivaIdx(0)
    setCantidad(1)
  }, [varianteActiva.id])

  const imagenPrincipal = imagenes[imagenActivaIdx] ?? null
  const imagenesMiniaturas = imagenes
  const sinStock = varianteActiva.stock === 0
  const maxCantidad = varianteActiva.stock
  const tonos = [...new Set(producto.variantes.map(v => v.tono).filter(Boolean))] as string[]
  const presentaciones = [...new Set(producto.variantes.map(v => v.presentacion).filter(Boolean))] as string[]
  const hayTonos = tonos.length > 0
  const hayPresentaciones = presentaciones.length > 0

  const [tonoSel, setTonoSel] = useState<string | null>(varianteActiva.tono)
  const [presentacionSel, setPresentacionSel] = useState<string | null>(varianteActiva.presentacion)

  useEffect(() => {
    const match = producto.variantes.find(v => {
      const okTono = !hayTonos || v.tono === tonoSel
      const okPres = !hayPresentaciones || v.presentacion === presentacionSel
      return okTono && okPres
    })
    if (match) setVarianteActiva(match)
  }, [tonoSel, presentacionSel, producto.variantes, hayTonos, hayPresentaciones])

  const mostrarToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  const handleAgregar = async () => {
    if (!autenticado) return
    setAgregando(true)
    const ok = await agregar(varianteActiva.id, cantidad)
    setAgregando(false)
    if (ok) mostrarToast(`¡${cantidad} × ${producto.nombre} agregado al carrito!`)
  }

  const handleFavorito = async () => {
    if (!autenticado) return
    await toggle(producto.id)
  }

  const esFav = autenticado && esFavorito(producto.id)

  // --- Lógica extraída para resolver advertencias de SonarQube ---

  const getStockStatus = () => {
    if (sinStock) return <span className="text-sm font-semibold text-red-500">Sin stock disponible</span>
    if (varianteActiva.stock <= 5) return <span className="text-sm font-semibold text-amber-600">¡Solo quedan {varianteActiva.stock} unidades!</span>
    return <span className="text-sm font-semibold text-green-600">En stock</span>
  }

  const getButtonContent = () => {
    if (agregando) return <><Loader2 className="w-5 h-5 animate-spin" /> Agregando...</>
    if (sinStock) return 'Producto agotado'
    return <><ShoppingBag className="w-5 h-5" /> Agregar al carrito</>
  }

  const getTonoClass = (tono: string, disponible: boolean) => {
    if (tonoSel === tono) return 'bg-rose-700 text-white border-rose-700 shadow-md'
    if (disponible) return 'bg-white text-gray-700 border-gray-300 hover:border-rose-400'
    return 'bg-gray-50 text-gray-400 border-gray-200 line-through cursor-not-allowed'
  }

  const getPresClass = (pres: string, disponible: boolean) => {
    if (presentacionSel === pres) return 'bg-rose-700 text-white border-rose-700 shadow-md'
    if (disponible) return 'bg-white text-gray-700 border-gray-300 hover:border-rose-400'
    return 'bg-gray-50 text-gray-400 border-gray-200 line-through cursor-not-allowed'
  }

  return (
    <div className="min-h-screen bg-[#fffafa]">
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white font-bold px-8 py-3 rounded-full shadow-2xl animate-fade-in-up text-sm">
          {toastMsg}
        </div>
      )}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <Link href="/catalogo" className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-800 font-semibold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-3 lg:sticky lg:top-8">
            <div className="relative rounded-3xl overflow-hidden bg-rose-50 shadow-xl aspect-square">
              {imagenPrincipal ? (
                <Image src={imagenPrincipal} alt={producto.nombre} fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-all duration-300" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-rose-200" />
                </div>
              )}
              {sinStock && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="bg-white text-gray-800 text-sm font-black px-6 py-3 rounded-full shadow-lg uppercase tracking-widest">Agotado</span>
                </div>
              )}
              <button
                onClick={handleFavorito}
                aria-label={esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-xl transition-all backdrop-blur-sm ${
                  esFav ? 'bg-rose-600 text-white' : 'bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${esFav ? 'fill-white' : ''}`} />
              </button>
            </div>
            {imagenesMiniaturas.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imagenesMiniaturas.map((url, i) => (
                  <button key={url} onClick={() => setImagenActivaIdx(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      imagenActivaIdx === i ? 'border-rose-500 shadow-md' : 'border-rose-100 hover:border-rose-300'
                    }`}>
                    <Image src={url} alt={`Vista ${i + 1}`} fill sizes="10vw" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              {producto.marca && (
                <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Tag className="w-3 h-3" /> {producto.marca.nombre}
                </span>
              )}
              {producto.categoria && (
                <span className="inline-flex items-center gap-1.5 bg-pink-100 text-pink-700 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  <Layers className="w-3 h-3" /> {producto.categoria.nombre}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              {producto.nombre}
            </h1>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <p className="text-4xl font-black text-gray-900">
                ${varianteActiva.precio_venta.toLocaleString('es-MX')}
                <span className="text-lg font-semibold text-gray-400 ml-2">MXN</span>
              </p>
            </div>

            {hayTonos && (
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Tono: <span className="font-semibold text-gray-700 normal-case">{tonoSel}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {tonos.map(tono => {
                    const disponible = producto.variantes.some(
                      v => v.tono === tono && (!hayPresentaciones || v.presentacion === presentacionSel) && v.stock > 0
                    )
                    return (
                      <button key={tono} onClick={() => setTonoSel(tono)} disabled={!disponible}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${getTonoClass(tono, disponible)}`}>
                        {tono}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {hayPresentaciones && (
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Presentación: <span className="font-semibold text-gray-700 normal-case">{presentacionSel}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {presentaciones.map(pres => {
                    const disponible = producto.variantes.some(
                      v => v.presentacion === pres && (!hayTonos || v.tono === tonoSel) && v.stock > 0
                    )
                    return (
                      <button key={pres} onClick={() => setPresentacionSel(pres)} disabled={!disponible}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${getPresClass(pres, disponible)}`}>
                        {pres}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {producto.descripcion && (
              <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
            )}

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              {getStockStatus()}
            </div>

            {!sinStock && autenticado && (
              <div className="flex items-center gap-4">
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Cantidad:</p>
                <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                  <button onClick={() => setCantidad(c => Math.max(1, c - 1))}
                    className="p-2.5 hover:bg-gray-100 rounded-full transition">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-base">{cantidad}</span>
                  <button onClick={() => setCantidad(c => Math.min(maxCantidad, c + 1))}
                    className="p-2.5 hover:bg-gray-100 rounded-full transition">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {autenticado ? (
              <button onClick={handleAgregar} disabled={sinStock || agregando}
                className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-base uppercase tracking-wide flex items-center justify-center gap-2">
                {getButtonContent()}
              </button>
            ) : (
              <Link href="/login">
                <button className="w-full bg-gray-900 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg text-base uppercase tracking-wide">
                  Inicia sesión para comprar
                </button>
              </Link>
            )}
            <Link href="/catalogo" className="block text-center text-sm text-gray-400 hover:text-rose-600 transition-colors font-medium">
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}