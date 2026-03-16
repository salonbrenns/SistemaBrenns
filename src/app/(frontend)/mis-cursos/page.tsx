// src/app/(frontend)/mis-cursos/page.tsx
"use client"
import React from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import AuthGuard from "@/components/ui/AuthGuard"
import {
  Calendar, Clock, ShoppingBag, Package,
  CheckCircle, Truck, XCircle, Loader2, Scissors
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
const pedidoEstado: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDIENTE:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700", icon: Clock },
  PAGADO:     { label: "Pagado",     color: "bg-blue-100 text-blue-700",     icon: CheckCircle },
  ENVIADO:    { label: "Enviado",    color: "bg-purple-100 text-purple-700", icon: Truck },
  ENTREGADO:  { label: "Entregado",  color: "bg-green-100 text-green-700",   icon: CheckCircle },
  CANCELADO:  { label: "Cancelado",  color: "bg-red-100 text-red-700",       icon: XCircle },
}
const citaEstado: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: "Pendiente",  color: "bg-yellow-100 text-yellow-700" },
  CONFIRMADA: { label: "Confirmada", color: "bg-blue-100 text-blue-700"     },
  COMPLETADA: { label: "Completada", color: "bg-green-100 text-green-700"   },
  CANCELADA:  { label: "Cancelada",  color: "bg-red-100 text-red-700"       },
}

export default function MisCursosPage() {
  const { data: session }                   = useSession()
  const [pestana, setPestana]               = useState("compras")
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [citas, setCitas]                   = useState<Cita[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(true)
  const [loadingCitas, setLoadingCitas]     = useState(true)

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

  const tabs = [
    { key: "compras", label: "Mis Compras", icon: ShoppingBag, count: pedidos.length },
    { key: "citas",   label: "Mis Citas",   icon: Scissors,    count: citas.length   },
    { key: "cursos",  label: "Mis Cursos",  icon: Clock,       count: 0              },
  ]

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <header className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-pink-600">Mi Historial</h1>
            <p className="text-gray-600 mt-3 text-lg">Todo lo que has hecho en Brenn&apos;s está aquí ♡</p>
          </header>

          {/* Pestañas */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {tabs.map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => setPestana(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-base transition ${
                  pestana === key ? "bg-pink-600 text-white shadow-lg" : "bg-white text-gray-700 border-2 border-pink-200 hover:bg-pink-50"
                }`}>
                <Icon className="w-5 h-5" />
                {label}
                {count > 0 && (
                  <span className={`text-xs rounded-full px-2 py-0.5 font-bold ${
                    pestana === key ? "bg-white/20 text-white" : "bg-pink-100 text-pink-600"
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
                <div className="text-center py-20 bg-white rounded-3xl shadow border border-pink-100">
                  <ShoppingBag className="w-16 h-16 mx-auto text-pink-200 mb-4" />
                  <p className="text-xl font-semibold text-gray-600 mb-6">Aún no tienes compras</p>
                  <Link href="/catalogo" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                    Ir al catálogo
                  </Link>
                </div>
              ) : pedidos.map(pedido => {
                const cfg  = pedidoEstado[pedido.estado] || pedidoEstado.PENDIENTE
                const Icon = cfg.icon
                const fecha = new Date(pedido.fecha_pedido).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                return (
                  <div key={pedido.id} className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-pink-50 border-b border-pink-100">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="font-bold text-gray-800">Pedido #{pedido.id}</p>
                          <p className="text-xs text-gray-500">{fecha}</p>
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
                            <p className="font-medium text-gray-800">{d.nombre_producto}</p>
                            <p className="text-gray-500">Cantidad: {d.cantidad} × ${Number(d.precio_unitario).toFixed(2)}</p>
                          </div>
                          <p className="font-bold text-pink-600">${Number(d.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 border-t border-gray-100 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${Number(pedido.subtotal).toFixed(2)}</span></div>
                      <div className="flex justify-between text-gray-600"><span>Envío</span><span>{Number(pedido.costo_envio) === 0 ? "Gratis" : `$${Number(pedido.costo_envio).toFixed(2)}`}</span></div>
                      <div className="flex justify-between font-bold text-base text-gray-800 pt-2 border-t border-gray-100">
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
                <div className="text-center py-20 bg-white rounded-3xl shadow border border-pink-100">
                  <Scissors className="w-16 h-16 mx-auto text-pink-200 mb-4" />
                  <p className="text-xl font-semibold text-gray-600 mb-2">Aún no tienes citas</p>
                  <p className="text-gray-400 mb-6">Agenda tu primera cita en el salón</p>
                  <Link href="/servicios" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                    Ver servicios
                  </Link>
                </div>
              ) : citas.map(cita => {
                const cfg   = citaEstado[cita.estado] || citaEstado.PENDIENTE
                const fecha = new Date(cita.fecha).toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })
                return (
                  <div key={cita.id} className="bg-white rounded-3xl shadow-lg border border-pink-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-pink-50 border-b border-pink-100">
                      <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-pink-500" />
                        <p className="font-bold text-gray-800">{cita.servicio.nombre}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="px-6 py-4 flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-pink-400" />{fecha}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-pink-400" />{cita.hora}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-pink-600">
                        ${Number(cita.servicio.precio).toLocaleString()} MXN
                      </div>
                    </div>
                    {cita.notas && (
                      <div className="px-6 pb-4 text-sm text-gray-500 italic">&quot;{cita.notas}&quot;</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── CURSOS ───────────────────────────────────── */}
          {pestana === "cursos" && (
            <div className="text-center py-20 bg-white rounded-3xl shadow border border-pink-100">
              <Clock className="w-16 h-16 mx-auto text-pink-200 mb-4" />
              <p className="text-xl font-semibold text-gray-600 mb-2">Aún no tienes cursos inscritos</p>
              <p className="text-gray-400 mb-6">Explora nuestros cursos de belleza</p>
              <Link href="/cursos" className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-3 rounded-full transition inline-block">
                Ver cursos
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <p className="text-gray-500">
              ¡Gracias por ser parte de la familia Brenn&apos;s, {session?.user?.name?.split(" ")[0]}! ♡
            </p>
          </div>
        </div>
      </main>
    </AuthGuard>
  )
}