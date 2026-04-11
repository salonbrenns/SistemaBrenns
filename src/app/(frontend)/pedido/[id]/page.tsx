'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, CreditCard, Building2, Banknote, Package, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/ui/AuthGuard'

interface Detalle {
  id: number
  nombre_producto: string
  descripcion_variante: string | null
  precio_unitario: number
  cantidad: number
  subtotal: number
}

interface Pedido {
  id: number
  estado: string
  total: number
  costo_envio: number
  subtotal: number
  nombre_cliente: string
  correo_cliente: string
  fecha_pedido: string
  detalles: Detalle[]
}

const ICONO_METODO: Record<string, React.ReactNode> = {
  tarjeta:       <CreditCard className="w-5 h-5" />,
  transferencia: <Building2  className="w-5 h-5" />,
  efectivo:      <Banknote   className="w-5 h-5" />,
}

const LABEL_METODO: Record<string, string> = {
  tarjeta:       'Tarjeta de crédito / débito',
  transferencia: 'Transferencia bancaria',
  efectivo:      'Pago en tienda / efectivo',
}

// Referencia simulada para transferencia
function generarReferencia(id: number) {
  const array = new Uint32Array(1);
  globalThis.crypto.getRandomValues(array);
  const randomNum = Math.floor((array[0] / (0xffffffff + 1)) * 9000 + 1000);
  return `BRN-${String(id).padStart(6, '0')}-${randomNum}`;
}

export default function ConfirmacionPedido() {
  return (
    <AuthGuard>
      <ConfirmacionContenido />
    </AuthGuard>
  )
}

function ConfirmacionContenido() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const pedidoId     = Number(params.id)
  const metodo       = searchParams.get('metodo') ?? 'tarjeta'

  const [pedido,   setPedido]   = useState<Pedido | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then((pedidos: Pedido[]) => {
        const encontrado = pedidos.find(p => p.id === pedidoId)
        setPedido(encontrado ?? null)
      })
      .finally(() => setCargando(false))
  }, [pedidoId])

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center text-gray-500">
        Pedido no encontrado.
      </div>
    )
  }

  const referencia = metodo === 'transferencia' ? generarReferencia(pedido.id) : null

  return (
    <div className="min-h-screen bg-[#fffafa] py-16">
      <div className="max-w-2xl mx-auto px-6 space-y-8">

        {/* Header éxito */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">¡Pedido confirmado!</h1>
          <p className="text-gray-500">
            Gracias, <span className="font-semibold text-gray-700">{pedido.nombre_cliente}</span>.
            Recibirás un correo en <span className="text-rose-600">{pedido.correo_cliente}</span>
          </p>
        </div>

        {/* Número de pedido */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 text-center">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Número de pedido</p>
          <p className="text-4xl font-black text-rose-700">#{String(pedido.id).padStart(6, '0')}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-amber-600">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Estado: {pedido.estado}</span>
          </div>
        </div>

        {/* Método de pago */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">Método de pago</h2>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              {ICONO_METODO[metodo] ?? <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-gray-800">{LABEL_METODO[metodo] ?? metodo}</p>
              {metodo === 'transferencia' && referencia && (
                <p className="text-xs text-blue-600 font-semibold mt-0.5">
                  Referencia: <span className="font-black">{referencia}</span>
                </p>
              )}
              {metodo === 'efectivo' && (
                <p className="text-xs text-green-600 font-semibold mt-0.5">
                  Presenta este número en sucursal. Válido 48 horas.
                </p>
              )}
              {metodo === 'tarjeta' && (
                <p className="text-xs text-gray-400 mt-0.5">Pago simulado aprobado ✓</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalle de productos */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Productos
          </h2>
          <div className="space-y-3">
            {pedido.detalles.map(d => (
              <div key={d.id} className="flex justify-between items-start text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{d.nombre_producto}</p>
                  {d.descripcion_variante && (
                    <p className="text-xs text-rose-500 font-semibold">{d.descripcion_variante}</p>
                  )}
                  <p className="text-xs text-gray-400">×{d.cantidad} · ${d.precio_unitario.toLocaleString('es-MX')} c/u</p>
                </div>
                <p className="font-black text-gray-900 whitespace-nowrap">
                  ${d.subtotal.toLocaleString('es-MX')}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span><span>${pedido.subtotal.toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío</span>
              {pedido.costo_envio === 0
                ? <span className="text-green-600 font-bold">GRATIS</span>
                : <span>${pedido.costo_envio.toLocaleString('es-MX')}</span>
              }
            </div>
            <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-rose-700">${pedido.total.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-4">
          <Link href="/mis-pedidos" className="flex-1">
            <button className="w-full bg-gray-900 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg text-sm uppercase tracking-wide">
              Ver mis pedidos
            </button>
          </Link>
          <Link href="/catalogo" className="flex-1">
            <button className="w-full border-2 border-rose-200 text-rose-700 hover:bg-rose-50 font-black py-4 rounded-2xl transition-all text-sm uppercase tracking-wide">
              Seguir comprando
            </button>
          </Link>
        </div>

      </div>
    </div>
  )
}