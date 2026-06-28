// src/app/(frontend)/mis-cursos/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import AuthGuard from "@/components/ui/AuthGuard"
import {
  Calendar, Clock, ShoppingBag, Package,
  CheckCircle, Truck, XCircle, Loader2, Scissors,
  AlertTriangle, X, Ban,
} from "lucide-react"

// ── Tipos ─────────────────────────────────────────────────────
type DetallePedido = {
  id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}
type Pedido = {
  id: number
  estado: string
  subtotal: number
  costo_envio: number
  total: number
  fecha_pedido: string
  detalles: DetallePedido[]
}
type Cita = {
  id: number
  fecha: string
  hora: string
  estado: string
  notas: string | null
  servicio: { nombre: string; precio: number; imagen: string | null }
}

// ── Estado badge configs ───────────────────────────────────────
const pedidoEstado: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDIENTE:  { label: "Pendiente",  color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", icon: Clock },
  PAGADO:     { label: "Pagado",     color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",         icon: CheckCircle },
  ENVIADO:    { label: "Enviado",    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400", icon: Truck },
  ENTREGADO:  { label: "Entregado",  color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",     icon: CheckCircle },
  CANCELADO:  { label: "Cancelado",  color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",             icon: XCircle },
}
const citaEstado: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: "Pendiente",  color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
  CONFIRMADA: { label: "Confirmada", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"         },
  COMPLETADA: { label: "Completada", color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"     },
  CANCELADA:  { label: "Cancelada",  color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"             },
}

// Calcula las horas que faltan para la cita
function horasParaCita(fecha: string, hora: string): number {
  const d = new Date(fecha)
  const [h, m] = hora.split(":").map(Number)
  d.setHours(h, m, 0, 0)
  return (d.getTime() - Date.now()) / (1000 * 60 * 60)
}

export default function MisCursosPage() {
  const { data: session }                   = useSession()
  const [pestana, setPestana]               = useState("compras")
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [citas, setCitas]                   = useState<Cita[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)
  const [loadingCitas, setLoadingCitas]     = useState(true)
  // Cancelación
  const [citaACancelar, setCitaACancelar]   = useState<Cita | null>(null)
  const [cancelando, setCancelando]         = useState(false)
  const [cancelExito, setCancelExito]       = useState<number | null>(null) // id de cita cancelada

  useEffect(() => {
    fetch("/api/pedidos")
      .then(r => r.json())
      .then(d => { setPedidos(d.pedidos || []); setLoadingPedidos(false) })
      .catch(() => setLoadingPedidos(false))

    fetch("/api/citas")
      .then(r => r.json())
      .then(d => { setCitas(d.citas || []); setLoadingCitas(false) })
      .catch(() => setLoadingCitas(false))
  }, [])

  const confirmarCancelacion = async () => {
    if (!citaACancelar) return
    setCancelando(true)
    try {
      const res  = await fetch(`/api/citas/${citaACancelar.id}/cancelar`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setCitas(prev => prev.map(c => c.id === citaACancelar.id ? { ...c, estado: "CANCELADA" } : c))
        setCancelExito(citaACancelar.id)
        setTimeout(() => setCancelExito(null), 6000)
      } else {
        alert(data.error)
      }
    } finally {
      setCancelando(false)
      setCitaACancelar(null)
    }
  }

  const tabs = [
    { key: "compras", label: "Mis Compras", icon: ShoppingBag, count: pedidos.length },
    { key: "citas",   label: "Mis Citas",   icon: Scissors,    count: citas.length   },
    { key: "cursos",  label: "Mis Cursos",  icon: Clock,       count: 0              },
  ]

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-pink-600">Mi Historial</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg">Todo lo que has hecho en Brenn&apos;s está aquí ♡</p>
          </header>

          {/* Pestañas */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => setPestana(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition ${
                  pestana === key ? "bg-pink-600 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-pink-200 dark:border-gray-600 hover:bg-pink-50 dark:hover:bg-gray-700"
                }`}>
                <Icon className="w-5 h-5" />
                {label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                    pestana === key ? "bg-white/20 text-white" : "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300"
                  }`}>{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── COMPRAS ──────────────────────────────────── */}
          {pestana === "compras" && (
            <div className="space-y-4">
              {loadingPedidos ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-pink-400 animate-spin" /></div>
              ) : pedidos.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow border border-pink-100">
                  <ShoppingBag className="w-16 h-16 mx-auto text-pink-200 mb-4" />
                  <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-6">Aún no tienes compras</p>
                  <Link href="/catalogo" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                    Ir al catálogo
                  </Link>
                </div>
              ) : pedidos.map(pedido => {
                const cfg  = pedidoEstado[pedido.estado] || pedidoEstado.PENDIENTE
                const Icon = cfg.icon
                const fecha = new Date(pedido.fecha_pedido).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                return (
                  <div key={pedido.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-pink-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-pink-50 dark:bg-gray-900/40 border-b border-pink-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white">Pedido #{pedido.id}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{fecha}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>
                        <Icon className="w-4 h-4" />{cfg.label}
                      </span>
                    </div>
                    <div className="px-6 py-4 space-y-3">
                      {pedido.detalles.map(d => (
                        <div key={d.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{d.nombre_producto}</p>
                            <p className="text-gray-500 dark:text-gray-400">Cantidad: {d.cantidad} × ${Number(d.precio_unitario).toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-pink-600">${Number(d.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>${Number(pedido.subtotal).toFixed(2)}</span></div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Envío</span><span>{Number(pedido.costo_envio) === 0 ? "Gratis" : `$${Number(pedido.costo_envio).toFixed(2)}`}</span></div>
                      <div className="flex justify-between font-bold text-base text-gray-800 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span>Total</span>
                        <span className="text-pink-600">${Number(pedido.total).toFixed(2)} MXN</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── CITAS ─────────────────────────────────────── */}
          {pestana === "citas" && (
            <div className="space-y-4">
              {loadingCitas ? (
                <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-pink-400 animate-spin" /></div>
              ) : citas.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow border border-pink-100">
                  <Scissors className="w-16 h-16 mx-auto text-pink-200 mb-4" />
                  <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Aún no tienes citas</p>
                  <p className="text-gray-400 mb-6">Agenda tu primera cita en el salón</p>
                  <Link href="/servicios" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                    Ver servicios
                  </Link>
                </div>
              ) : citas.map(cita => {
                const cfg   = citaEstado[cita.estado] || citaEstado.PENDIENTE
                const fecha = new Date(cita.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                return (
                  <div key={cita.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-pink-100 dark:border-gray-700 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-pink-50 dark:bg-gray-900/40 border-b border-pink-100 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-pink-500" />
                        <p className="font-bold text-gray-800 dark:text-white">{cita.servicio.nombre}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="px-6 py-4 flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-pink-400" />{fecha}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-pink-400" />{cita.hora}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-pink-600">
                        ${Number(cita.servicio.precio).toLocaleString()} MXN
                      </div>
                    </div>
                    {cita.notas && (
                      <div className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 italic">&quot;{cita.notas}&quot;</div>
                    )}

                    {/* Aviso de éxito tras cancelar */}
                    {cancelExito === cita.id && (
                      <div className="mx-6 mb-4 flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>Cita cancelada. Si realizaste un pago anticipado, será reembolsado en <strong>3-5 días hábiles</strong>.</p>
                      </div>
                    )}

                    {/* Botón cancelar — solo para citas activas */}
                    {["PENDIENTE", "CONFIRMADA"].includes(cita.estado) && (() => {
                      const horas = horasParaCita(cita.fecha, cita.hora)
                      const puedeCancel = horas >= 24
                      return (
                        <div className="px-6 pb-4">
                          {puedeCancel ? (
                            <button
                              onClick={() => setCitaACancelar(cita)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold transition"
                            >
                              <Ban className="w-3.5 h-3.5" /> Cancelar cita
                            </button>
                          ) : (
                            <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                              <Ban className="w-3.5 h-3.5" />
                              No se puede cancelar — faltan menos de 24 horas
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── CURSOS ───────────────────────────────────── */}
          {pestana === "cursos" && (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow border border-pink-100">
              <Clock className="w-16 h-16 mx-auto text-pink-200 mb-4" />
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">Aún no tienes cursos inscritos</p>
              <p className="text-gray-400 mb-6">Explora nuestros cursos de belleza</p>
              <Link href="/cursos" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                Ver cursos
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-500 dark:text-gray-400">
              ¡Gracias por ser parte de la familia Brenn&apos;s, {session?.user?.name?.split(" ")[0]}! ♡
            </p>
          </div>
        </div>
      </main>

      {/* Modal de confirmación de cancelación */}
      {citaACancelar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Cancelar cita</h2>
              </div>
              <button onClick={() => setCitaACancelar(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-pink-50 dark:bg-gray-900/40 rounded-2xl p-4 mb-5 space-y-1 text-sm">
              <p className="font-semibold text-gray-800 dark:text-white">{citaACancelar.servicio.nombre}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {new Date(citaACancelar.fecha).toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} · {citaACancelar.hora}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl px-4 py-3 mb-5">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                💳 Reembolso: si realizaste un pago anticipado, será devuelto en 3-5 días hábiles tras la cancelación.
              </p>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              ¿Confirmas que deseas cancelar esta cita? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setCitaACancelar(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                No, conservar
              </button>
              <button
                onClick={confirmarCancelacion}
                disabled={cancelando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition disabled:opacity-60"
              >
                {cancelando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}