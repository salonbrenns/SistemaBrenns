'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Loader2, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react'
import AuthGuard from '@/components/ui/AuthGuard'

interface Detalle {
  id: number
  nombre_producto: string
  descripcion_variante: string | null
  precio_unitario: number
  cantidad: number
  subtotal: number
  imagen: unknown
}

interface Pedido {
  id: number
  estado: string
  total: number
  subtotal: number
  costo_envio: number
  fecha_pedido: string
  detalles: Detalle[]
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-amber-100  text-amber-700',
  PAGADO:     'bg-blue-100   text-blue-700',
  ENVIADO:    'bg-purple-100 text-purple-700',
  ENTREGADO:  'bg-green-100  text-green-700',
  CANCELADO:  'bg-red-100    text-red-600',
}

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0] as string
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

export default function MisPedidosPage() {
  return <AuthGuard><MisPedidosContenido /></AuthGuard>
}

function MisPedidosContenido() {
  const [pedidos,  setPedidos]  = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)
  const [abierto,  setAbierto]  = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-12">
      <div className="max-w-3xl mx-auto px-6">

        <div className="flex items-center gap-3 mb-10">
          <Package className="w-8 h-8 text-rose-600" />
          <h1 className="text-3xl font-black text-gray-900">
            Mis Pedidos
            <span className="ml-2 text-lg font-semibold text-gray-400">({pedidos.length})</span>
          </h1>
        </div>

        {pedidos.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <ShoppingBag className="w-20 h-20 text-rose-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-700 mb-6">Aún no tienes pedidos</p>
            <Link href="/catalogo">
              <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
                Explorar catálogo
              </button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="bg-white rounded-2xl border border-rose-50 shadow-sm overflow-hidden">

              {/* Cabecera del pedido */}
              <button
                onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-black text-gray-900">
                      Pedido #{String(pedido.id).padStart(6, '0')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_STYLE[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {pedido.estado}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-900 text-lg">
                    ${pedido.total.toLocaleString('es-MX')}
                    <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                  </span>
                  {abierto === pedido.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </button>

              {/* Detalle expandible */}
              {abierto === pedido.id && (
                <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50">
                  {pedido.detalles.map(d => {
                    const foto = getImagen(d.imagen)
                    return (
                      <div key={d.id} className="flex gap-3 items-center">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-rose-50 border border-rose-100 flex-shrink-0">
                          {foto
                            ? <Image src={foto} alt={d.nombre_producto} fill sizes="48px" className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-rose-200" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{d.nombre_producto}</p>
                          {d.descripcion_variante && (
                            <p className="text-xs text-rose-500 font-semibold">{d.descripcion_variante}</p>
                          )}
                          <p className="text-xs text-gray-400">×{d.cantidad} · ${d.precio_unitario.toLocaleString('es-MX')} c/u</p>
                        </div>
                        <p className="text-sm font-black text-gray-900 whitespace-nowrap">
                          ${d.subtotal.toLocaleString('es-MX')}
                        </p>
                      </div>
                    )
                  })}

                  <div className="pt-3 border-t border-gray-200 text-sm space-y-1">
                    <div className="flex justify-between text-gray-500">
                      <span>Envío</span>
                      {pedido.costo_envio === 0
                        ? <span className="text-green-600 font-bold">GRATIS</span>
                        : <span>${pedido.costo_envio.toLocaleString('es-MX')}</span>
                      }
                    </div>
                    <div className="flex justify-between font-black text-gray-900">
                      <span>Total</span>
                      <span className="text-rose-700">${pedido.total.toLocaleString('es-MX')} MXN</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}