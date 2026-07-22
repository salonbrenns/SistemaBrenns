'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronDown, ChevronUp, ShoppingBag, CheckCircle2, Clock, Truck, Upload, ExternalLink } from 'lucide-react'
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
  metodo_pago: string | null
  comprobante_url: string | null
  detalles: Detalle[]
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE: 'bg-amber-100  text-amber-700',
  PAGADO:    'bg-blue-100   text-blue-700',
  ENVIADO:   'bg-purple-100 text-purple-700',
  ENTREGADO: 'bg-green-100  text-green-700',
  CANCELADO: 'bg-red-100    text-red-600',
}

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0] as string
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

// ── Timeline de seguimiento ───────────────────────────────────────────────────
const PASOS = [
  { key: 'PENDIENTE', label: 'Pedido recibido', Icon: Clock        },
  { key: 'PAGADO',    label: 'Pago confirmado', Icon: CheckCircle2 },
  { key: 'ENVIADO',   label: 'En camino',       Icon: Truck        },
  { key: 'ENTREGADO', label: 'Entregado',       Icon: Package      },
]

function TrackingTimeline({ estado }: { estado: string }) {
  if (estado === 'CANCELADO') {
    return (
      <p className="text-sm text-red-500 font-semibold py-3">Pedido cancelado</p>
    )
  }
  const idxActual = PASOS.findIndex(p => p.key === estado)
  return (
    <div className="relative flex items-start justify-between py-4 px-2">
      <div className="absolute top-[22px] left-6 right-6 h-0.5 bg-gray-200 z-0" />
      <div
        className="absolute top-[22px] left-6 h-0.5 bg-rose-400 z-0 transition-all duration-500"
        style={{ width: idxActual <= 0 ? '0%' : `calc(${(idxActual / (PASOS.length - 1)) * 100}% - 12px)` }}
      />
      {PASOS.map((paso, idx) => {
        const completado = idx <= idxActual
        const activo     = idx === idxActual
        const { Icon }   = paso
        return (
          <div key={paso.key} className="relative z-10 flex flex-col items-center gap-1 flex-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
              completado
                ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-100'
                : 'bg-white border-gray-200 dark:border-gray-700 text-gray-300'
            } ${activo ? 'ring-4 ring-rose-100 scale-110' : ''}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`text-[10px] text-center leading-tight font-bold ${completado ? 'text-rose-600' : 'text-gray-400'}`}>
              {paso.label}
            </span>
          </div>
        )
      })}
    </div>
  )
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
      <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">

        <div className="flex items-center gap-3 mb-10">
          <Package className="w-8 h-8 text-rose-600" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Mis Pedidos
            <span className="ml-2 text-lg font-semibold text-gray-400">({pedidos.length})</span>
          </h1>
        </div>

        {pedidos.length > 0 ? (
          <div className="space-y-4">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-rose-50 dark:border-gray-700 shadow-sm overflow-hidden">

                <button
                  onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-rose-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">
                        Pedido #{String(pedido.id).padStart(6, '0')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_STYLE[pedido.estado] ?? 'bg-gray-100 text-gray-600 dark:text-gray-400'}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-black text-gray-900 dark:text-white text-lg">
                      ${pedido.total.toLocaleString('es-MX')}
                      <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                    </span>
                    {abierto === pedido.id
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </button>

                {abierto === pedido.id && (
                  <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50 dark:bg-gray-900">

                    {/* Timeline */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-rose-50 dark:border-gray-700 px-4 pb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 pt-3 mb-1">Seguimiento</p>
                      <TrackingTimeline estado={pedido.estado} />
                    </div>

                    {/* Productos */}
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
                            <p className="text-xs text-gray-400">x{d.cantidad} · ${d.precio_unitario.toLocaleString('es-MX')} c/u</p>
                          </div>
                          <p className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">
                            ${d.subtotal.toLocaleString('es-MX')}
                          </p>
                        </div>
                      )
                    })}

                    {/* Totales */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 text-sm space-y-1">
                      <div className="flex justify-between text-gray-500 dark:text-gray-400">
                        <span>Envío</span>
                        {pedido.costo_envio === 0
                          ? <span className="text-green-600 font-bold">GRATIS</span>
                          : <span>${pedido.costo_envio.toLocaleString('es-MX')}</span>
                        }
                      </div>
                      <div className="flex justify-between font-black text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span className="text-rose-700">${pedido.total.toLocaleString('es-MX')} MXN</span>
                      </div>
                    </div>

                    {/* Comprobante de transferencia */}
                    {pedido.metodo_pago === 'transferencia' && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        {pedido.comprobante_url ? (
                          <a
                            href={pedido.comprobante_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> Ver comprobante enviado
                          </a>
                        ) : pedido.estado === 'PENDIENTE' ? (
                          <Link href={`/pedido/${pedido.id}?metodo=transferencia`}>
                            <button className="inline-flex items-center gap-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full transition-all shadow-sm">
                              <Upload className="w-3.5 h-3.5" /> Subir comprobante de pago
                            </button>
                          </Link>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] shadow-inner border-2 border-dashed border-rose-100">
            <ShoppingBag className="w-20 h-20 text-rose-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">Aún no tienes pedidos</p>
            <Link href="/catalogo">
              <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition shadow-xl">
                Explorar catálogo
              </button>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
