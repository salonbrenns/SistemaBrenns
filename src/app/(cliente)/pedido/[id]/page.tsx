'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2, Clock, CreditCard, Building2, Banknote, Package,
  Upload, ImageIcon, Loader2, CheckCheck, ExternalLink,
} from 'lucide-react'
import AuthGuard from '@/components/ui/AuthGuard'
import PageLoader from '@/components/ui/PageLoader'
import { toast } from '@/lib/toast'

function SpinnerPage() {
  return <PageLoader className="min-h-screen bg-[#fffafa] dark:bg-gray-950" />
}

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
  metodo_pago: string | null
  comprobante_url: string | null
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

export default function ConfirmacionPedido() {
  return (
    <AuthGuard>
      <Suspense fallback={<SpinnerPage />}>
        <ConfirmacionContenido />
      </Suspense>
    </AuthGuard>
  )
}

function ConfirmacionContenido() {
  const params       = useParams()
  const searchParams = useSearchParams()
  const pedidoId     = Number(params.id)
  const metodoUrl    = searchParams.get('metodo') ?? 'tarjeta'

  const [pedido,      setPedido]      = useState<Pedido | null>(null)
  const [cargando,    setCargando]    = useState(true)
  const [archivo,     setArchivo]     = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [subiendo,    setSubiendo]    = useState(false)
  const [comprob,     setComprob]     = useState<string | null>(null)
  const [errorUpload, setErrorUpload] = useState<string | null>(null)
  const [dragOver,    setDragOver]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [bancoCfg, setBancoCfg] = useState({
    banco:   'BBVA',
    titular: 'Ruth Barrientos Angeles',
    cuenta:  '154 792 8563',
    clabe:   '012 290 01547928563 4',
  })

  useEffect(() => {
    fetch('/api/config-sitio')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return
        setBancoCfg({
          banco:   data.banco_banco   || 'BBVA',
          titular: data.banco_titular || 'Ruth Barrientos Angeles',
          cuenta:  data.banco_cuenta  || '154 792 8563',
          clabe:   data.banco_clabe   || '012 290 01547928563 4',
        })
      })
      .catch(() => {/* usar defaults */})
  }, [])

  useEffect(() => {
    fetch('/api/pedidos')
      .then(r => r.json())
      .then((pedidos: Pedido[]) => {
        const encontrado = pedidos.find(p => p.id === pedidoId)
        if (encontrado) {
          setPedido(encontrado)
          if (encontrado.comprobante_url) setComprob(encontrado.comprobante_url)
        }
      })
      .finally(() => setCargando(false))
  }, [pedidoId])

  const manejarArchivo = (f: File) => {
    setArchivo(f)
    setErrorUpload(null)
    setPreview(URL.createObjectURL(f))
  }

  const subirComprobante = async () => {
    if (!archivo || !pedido) return
    setSubiendo(true)
    setErrorUpload(null)
    try {
      const form = new FormData()
      form.append('file', archivo)
      const res  = await fetch(`/api/pedidos/${pedido.id}/comprobante`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al subir')
      setComprob(data.url)
      setArchivo(null)
      setPreview(null)
      toast.success("Comprobante enviado correctamente")
    } catch (e: unknown) {
      setErrorUpload(e instanceof Error ? e.message : 'Error al subir comprobante')
    } finally {
      setSubiendo(false)
    }
  }

  if (cargando) return <SpinnerPage />

  if (!pedido) {
    return (
      <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Pedido no encontrado.
      </div>
    )
  }

  const metodo          = pedido.metodo_pago || metodoUrl
  const esTransferencia = metodo === 'transferencia'

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-14">
      <div className={`mx-auto px-6 space-y-8 ${esTransferencia ? 'max-w-5xl' : 'max-w-2xl'}`}>

        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">¡Pedido confirmado!</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gracias, <span className="font-semibold text-gray-700 dark:text-gray-300">{pedido.nombre_cliente}</span>.
            {' '}Recibirás un correo en <span className="text-rose-600">{pedido.correo_cliente}</span>
          </p>
        </div>

        {/* Grid: 2 cols si transferencia */}
        <div className={esTransferencia ? 'grid lg:grid-cols-5 gap-6' : 'space-y-6'}>

          {/* ── Columna izquierda: resumen ── */}
          <div className={`space-y-5 ${esTransferencia ? 'lg:col-span-3' : ''}`}>

            {/* Número de pedido */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-sm p-6 text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Número de pedido</p>
              <p className="text-4xl font-black text-rose-700">#{String(pedido.id).padStart(6, '0')}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">Estado: {pedido.estado}</span>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Método de pago</h2>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-xl">
                  {ICONO_METODO[metodo] ?? <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">{LABEL_METODO[metodo] ?? metodo}</p>
                  {metodo === 'efectivo' && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold mt-0.5">
                      Presenta este número en sucursal. Válido 48 horas.
                    </p>
                  )}
                  {metodo === 'tarjeta' && (
                    <p className="text-xs text-gray-400 mt-0.5">Pago con tarjeta registrado ✓</p>
                  )}
                </div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Productos
              </h2>
              <div className="space-y-3">
                {pedido.detalles.map(d => (
                  <div key={d.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">{d.nombre_producto}</p>
                      {d.descripcion_variante && (
                        <p className="text-xs text-rose-500 font-semibold">{d.descripcion_variante}</p>
                      )}
                      <p className="text-xs text-gray-400">×{d.cantidad} · ${d.precio_unitario.toLocaleString('es-MX')} c/u</p>
                    </div>
                    <p className="font-black text-gray-900 dark:text-white whitespace-nowrap">
                      ${d.subtotal.toLocaleString('es-MX')}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span><span>${pedido.subtotal.toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Envío</span>
                  {pedido.costo_envio === 0
                    ? <span className="text-green-600 font-bold">GRATIS</span>
                    : <span>${pedido.costo_envio.toLocaleString('es-MX')}</span>
                  }
                </div>
                <div className="flex justify-between font-black text-gray-900 dark:text-white text-base pt-1 border-t border-gray-100 dark:border-gray-700">
                  <span>Total</span>
                  <span className="text-rose-700">${pedido.total.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>
            </div>

            {/* Acciones (solo cuando NO es transferencia) */}
            {!esTransferencia && (
              <div className="flex gap-4">
                <Link href="/mis-pedidos" className="flex-1">
                  <button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg text-sm uppercase tracking-wide">
                    Ver mis pedidos
                  </button>
                </Link>
                <Link href="/catalogo" className="flex-1">
                  <button className="w-full border-2 border-rose-700 text-rose-700 dark:border-rose-500 dark:text-rose-400 font-black py-4 rounded-2xl hover:bg-rose-700 hover:text-white transition-all text-sm uppercase tracking-wide">
                    Seguir comprando
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* ── Columna derecha: comprobante (solo transferencia) ── */}
          {esTransferencia && (
            <div className="lg:col-span-2 space-y-5">

              {/* Datos bancarios */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg">
                <p className="text-xs font-black uppercase tracking-widest text-blue-100 mb-4">Datos para transferir</p>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Banco</span>
                    <span className="font-bold">{bancoCfg.banco}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Titular</span>
                    <span className="font-bold">{bancoCfg.titular}</span>
                  </div>
                  <div className="border-t border-blue-500/40 pt-3 mt-1 space-y-2">
                    <div>
                      <p className="text-blue-200 text-xs">Cuenta</p>
                      <p className="font-black text-lg tracking-wider">{bancoCfg.cuenta}</p>
                    </div>
                    <div>
                      <p className="text-blue-200 text-xs">CLABE interbancaria</p>
                      <p className="font-black tracking-wider">{bancoCfg.clabe}</p>
                    </div>
                  </div>
                  <div className="border-t border-blue-500/40 pt-3">
                    <p className="text-blue-200 text-xs mb-1">Referencia / concepto</p>
                    <p className="font-black text-rose-200">PEDIDO #{String(pedido.id).padStart(6, '0')}</p>
                  </div>
                  <div className="bg-blue-500/30 rounded-xl p-3 text-center mt-1">
                    <p className="text-2xl font-black">${pedido.total.toLocaleString('es-MX')} MXN</p>
                    <p className="text-xs text-blue-200 mt-0.5">Monto exacto a transferir</p>
                  </div>
                </div>
              </div>

              {/* Upload / Éxito */}
              {comprob ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-green-200 dark:border-green-800 shadow-sm p-6 text-center space-y-3">
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-black text-gray-900 dark:text-white">¡Comprobante enviado!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Verificaremos tu pago en breve.</p>
                  <a href={comprob} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    <ExternalLink className="w-4 h-4" /> Ver comprobante
                  </a>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-rose-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">Sube tu comprobante</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Una foto o captura de tu transferencia. Al subirlo tu pedido queda confirmado automáticamente.
                    </p>
                  </div>

                  <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) manejarArchivo(f) }}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-[160px] ${
                      dragOver
                        ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                        : preview
                          ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) manejarArchivo(f) }}
                    />
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="Comprobante" className="max-h-36 rounded-xl object-contain" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-rose-400" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            <span className="text-rose-600 dark:text-rose-400">Haz clic</span> o arrastra aquí
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG o PDF · máx. 10 MB</p>
                        </div>
                      </>
                    )}
                  </div>

                  {archivo && (
                    <p className="text-xs text-gray-500 text-center truncate">{archivo.name}</p>
                  )}

                  {errorUpload && (
                    <p className="text-xs text-red-500 text-center">{errorUpload}</p>
                  )}

                  <button
                    onClick={subirComprobante}
                    disabled={!archivo || subiendo}
                    className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-3 rounded-2xl transition-all shadow-sm"
                  >
                    {subiendo ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Enviar comprobante</>
                    )}
                  </button>
                </div>
              )}

              {/* Acciones */}
              <div className="flex flex-col gap-3">
                <Link href="/mis-pedidos">
                  <button className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-rose-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg text-sm uppercase tracking-wide">
                    Ver mis pedidos
                  </button>
                </Link>
                <Link href="/catalogo">
                  <button className="w-full border-2 border-rose-700 text-rose-700 dark:border-rose-500 dark:text-rose-400 font-black py-3.5 rounded-2xl hover:bg-rose-700 hover:text-white transition-all text-sm uppercase tracking-wide">
                    Seguir comprando
                  </button>
                </Link>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )

  function manejarArchivo(f: File) {
    setArchivo(f)
    setErrorUpload(null)
    setPreview(URL.createObjectURL(f))
  }
}
