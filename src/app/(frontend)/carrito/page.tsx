'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus, Loader2, ShoppingCart } from 'lucide-react'
import { useCarrito } from '@/hooks/useCarrito'
import AuthGuard from '@/components/ui/AuthGuard'

const ENVIO_GRATIS_DESDE = 1500
const COSTO_ENVIO        = 100

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0] as string
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

export default function CarritoPage() {
  return (
    <AuthGuard>
      <CarritoContenido />
    </AuthGuard>
  )
}

function CarritoContenido() {
  const { items, cargando, total, totalItems, actualizarCantidad, eliminar, vaciar } = useCarrito()
  const envio      = total >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const totalFinal = total + envio

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <ShoppingCart className="w-8 h-8 text-rose-600" />
          <h1 className="text-3xl font-black text-gray-900">
            Tu Carrito{' '}
            <span className="ml-2 text-lg font-semibold text-gray-400">
              ({totalItems} artículo{totalItems === 1 ? '' : 's'})
            </span>
          </h1>
        </div>

        {/* Contenido: carrito con items o vacío */}
        {items.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Lista de items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const foto      = getImagen(item.producto.imagen)
                const subtotal  = item.precio_venta * item.cantidad
                const atributos = [item.tono, item.presentacion].filter(Boolean).join(' / ')
                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-rose-50 overflow-hidden">
                    <div className="p-5 flex gap-4">

                      {/* Imagen */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0 border border-rose-100">
                        {foto ? (
                          <Image src={foto} alt={item.producto.nombre} fill sizes="96px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-rose-200" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              href={`/producto/${item.producto.id}`}
                              className="font-bold text-gray-900 hover:text-rose-600 transition-colors line-clamp-1">
                              {item.producto.nombre}
                            </Link>
                            {atributos && (
                              <p className="text-xs text-rose-500 font-semibold mt-0.5">{atributos}</p>
                            )}
                            {item.producto.marca && (
                              <p className="text-xs text-gray-400 mt-0.5">{item.producto.marca}</p>
                            )}
                          </div>
                          <button
                            onClick={() => eliminar(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Selector cantidad */}
                          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                              className="p-2 hover:bg-gray-100 rounded-full transition">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 font-bold text-sm">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                              disabled={item.cantidad >= item.stock}
                              className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-40">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-black text-gray-900 text-lg">
                            ${subtotal.toLocaleString('es-MX')}
                            <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )
              })}

              {/* Vaciar carrito */}
              <div className="flex justify-end">
                <button
                  onClick={vaciar}
                  className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Vaciar carrito
                </button>
              </div>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-rose-100 sticky top-6 space-y-4">
                <h2 className="text-xl font-black text-gray-900">Resumen del pedido</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({totalItems} art.)</span>
                    <span className="font-bold">${total.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    {envio === 0
                      ? <span className="font-bold text-green-600">GRATIS</span>
                      : <span className="font-bold">${envio.toLocaleString('es-MX')}</span>
                    }
                  </div>
                  {total < ENVIO_GRATIS_DESDE && total > 0 && (
                    <p className="text-xs text-gray-400 bg-rose-50 rounded-lg px-3 py-2">
                      Te faltan ${(ENVIO_GRATIS_DESDE - total).toLocaleString('es-MX')} MXN para envío gratis
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-rose-700">
                      ${totalFinal.toLocaleString('es-MX')}
                      <span className="text-sm font-normal text-gray-400 ml-1">MXN</span>
                    </span>
                  </div>
                </div>
                <Link href="/checkout">
                  <button className="w-full mt-2 bg-gray-900 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-base uppercase tracking-wide">
                    Proceder al pago
                  </button>
                </Link>
                <Link href="/catalogo" className="block text-center text-sm text-gray-400 hover:text-rose-600 transition-colors font-medium">
                  ← Seguir comprando
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <ShoppingBag className="w-20 h-20 text-rose-200 mx-auto mb-6" />
            <p className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</p>
            <p className="text-gray-500 mb-8">Explora el catálogo y agrega productos</p>
            <Link href="/catalogo">
              <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
                Ir al catálogo
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}