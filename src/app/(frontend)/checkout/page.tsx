'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CreditCard, Banknote, Building2, Lock,
  ChevronRight, Loader2, ShoppingBag, CheckCircle2
} from 'lucide-react'
import AuthGuard from '@/components/ui/AuthGuard'
import { useCarrito, type CartItem } from '@/hooks/useCarrito'

// ─── Constantes ───────────────────────────────────────────────────────────────
const COSTO_ENVIO        = 100
const ENVIO_GRATIS_DESDE = 1500

// ─── Métodos de pago simulados ────────────────────────────────────────────────
const METODOS = [
  {
    id:    'tarjeta',
    label: 'Tarjeta de crédito / débito',
    icon:  CreditCard,
    desc:  'Simulación — no se realizará ningún cargo real',
  },
  {
    id:    'transferencia',
    label: 'Transferencia bancaria',
    icon:  Building2,
    desc:  'Se generará una referencia de pago simulada',
  },
  {
    id:    'efectivo',
    label: 'Pago en tienda / efectivo',
    icon:  Banknote,
    desc:  'Paga al recoger tu pedido en sucursal',
  },
]

function getImagen(imagen: unknown): string | null {
  if (Array.isArray(imagen) && imagen.length > 0) return imagen[0] as string
  if (typeof imagen === 'string' && imagen.startsWith('http')) return imagen
  return null
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutContenido />
    </AuthGuard>
  )
}

function CheckoutContenido() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, cargando, total, totalItems } = useCarrito()

  const [metodoPago, setMetodoPago] = useState('tarjeta')
  const [procesando, setProcesando] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre:   '',
    apellido: '',
    correo:   '',
    telefono: '',
  })

  // Pre-llenar con datos de sesión
  useEffect(() => {
    if (!session?.user) return
    const partes = (session.user.name ?? '').split(' ')
    setForm({
      nombre:   partes[0] ?? '',
      apellido: partes.slice(1).join(' '),
      correo:   session.user.email ?? '',
      telefono: (session.user as { telefono?: string }).telefono ?? '',
    })
  }, [session])

  const envio      = total >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const totalFinal = total + envio

  // ── Tipo nativo del DOM en lugar de FormEvent de React (deprecado) ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!form.nombre.trim() || !form.correo.trim()) {
      setError('Nombre y correo son obligatorios')
      return
    }

    setProcesando(true)
    try {
      const res = await fetch('/api/pedidos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago:      metodoPago,
          nombre_cliente:   `${form.nombre} ${form.apellido}`.trim(),
          correo_cliente:   form.correo,
          telefono_cliente: form.telefono || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido')

      // Emitir evento para que el Header actualice el contador
      globalThis.dispatchEvent(new Event('cart-updated'))
      router.push(`/pedido/${data.pedido_id}?metodo=${metodoPago}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
      </div>
    )
  }

  if (!cargando && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-rose-200 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700 mb-6">Tu carrito está vacío</p>
          <Link href="/catalogo">
            <button className="px-8 py-3 bg-rose-700 text-white font-bold rounded-full hover:bg-rose-800 transition">
              Ir al catálogo
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/carrito" className="hover:text-rose-600 transition">Carrito</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700 font-semibold">Finalizar compra</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-10">Finalizar Compra</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-10">

            {/* ── Columna izquierda: datos + método ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Datos de contacto */}
              <div className="bg-white rounded-3xl shadow-sm border border-rose-50 p-8">
                <h2 className="text-lg font-black text-gray-900 mb-6">Datos de contacto</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="nombre" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Nombre *
                    </label>
                    <input
                      id="nombre"
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      placeholder="Ana Karen"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="apellido" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Apellido
                    </label>
                    <input
                      id="apellido"
                      value={form.apellido}
                      onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      placeholder="Gómez López"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="correo" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Correo *
                    </label>
                    <input
                      id="correo"
                      type="email"
                      value={form.correo}
                      onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      placeholder="ana@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="telefono" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </label>
                    <input
                      id="telefono"
                      value={form.telefono}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                      placeholder="961 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-white rounded-3xl shadow-sm border border-rose-50 p-8">
                <h2 className="text-lg font-black text-gray-900 mb-6">Método de pago</h2>
                <div className="space-y-3">
                  {METODOS.map(m => {
                    const Icon   = m.icon
                    const activo = metodoPago === m.id
                    return (
                      <label key={m.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          activo
                            ? 'border-rose-500 bg-rose-50'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}>
                        <input type="radio" name="metodo" value={m.id}
                          checked={activo} onChange={() => setMetodoPago(m.id)} className="sr-only" />
                        <div className={`p-2.5 rounded-xl ${activo ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${activo ? 'text-rose-700' : 'text-gray-700'}`}>{m.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                        </div>
                        {activo && <CheckCircle2 className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                      </label>
                    )
                  })}
                </div>

                {/* Campos adicionales por método */}
                {metodoPago === 'tarjeta' && (
                  <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-bold text-amber-700 mb-3 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Entorno de simulación — no ingreses datos reales
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input placeholder="Número de tarjeta (simulado)" maxLength={19}
                          className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                      </div>
                      <input placeholder="MM / AA" className="rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                      <input placeholder="CVV" maxLength={4} className="rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
                    </div>
                  </div>
                )}

                {metodoPago === 'transferencia' && (
                  <div className="mt-6 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-700 mb-2">Datos bancarios simulados</p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <p>Banco: BBVA Simulado</p>
                      <p>CLABE: 0000 0000 0000 0000 00</p>
                      <p>Referencia: se generará al confirmar</p>
                    </div>
                  </div>
                )}

                {metodoPago === 'efectivo' && (
                  <div className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-100">
                    <p className="text-xs font-bold text-green-700 mb-1">Pago en sucursal</p>
                    <p className="text-xs text-green-600">Presenta tu número de pedido al recoger. Tienes 48 horas para pagar.</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
                  {error}
                </div>
              )}
            </div>

            {/* ── Resumen ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm border border-rose-50 p-6 sticky top-6 space-y-4">
                <h2 className="text-lg font-black text-gray-900">
                  Resumen ({totalItems} art.)
                </h2>

                {/* Items */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {items.map((item: CartItem) => {
                    const foto      = getImagen(item.producto.imagen)
                    const atributos = [item.tono, item.presentacion].filter(Boolean).join(' / ')
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0 border border-rose-100">
                          {foto
                            ? <Image src={foto} alt={item.producto.nombre} fill sizes="56px" className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-5 h-5 text-rose-200" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.producto.nombre}</p>
                          {atributos && <p className="text-[10px] text-rose-500 font-semibold">{atributos}</p>}
                          <p className="text-xs text-gray-500 mt-0.5">×{item.cantidad}</p>
                        </div>
                        <p className="text-xs font-black text-gray-900 whitespace-nowrap">
                          ${(item.precio_venta * item.cantidad).toLocaleString('es-MX')}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Totales */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">${total.toLocaleString('es-MX')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Envío</span>
                    {envio === 0
                      ? <span className="font-bold text-green-600">GRATIS</span>
                      : <span className="font-bold">${envio.toLocaleString('es-MX')}</span>
                    }
                  </div>
                  {total < ENVIO_GRATIS_DESDE && total > 0 && (
                    <p className="text-[11px] text-gray-400 bg-rose-50 rounded-lg px-2 py-1.5">
                      Te faltan ${(ENVIO_GRATIS_DESDE - total).toLocaleString('es-MX')} MXN para envío gratis
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t-2 border-rose-100">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-rose-700">
                      ${totalFinal.toLocaleString('es-MX')}
                      <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                    </span>
                  </div>
                </div>

                <button type="submit" disabled={procesando || items.length === 0}
                  className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-sm uppercase tracking-wide flex items-center justify-center gap-2">
                  {procesando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                    : <><Lock className="w-4 h-4" /> Confirmar pedido</>
                  }
                </button>

                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Simulación — no se realizan cargos reales
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}