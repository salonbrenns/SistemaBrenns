// src/app/(cliente)/perfil/page.tsx
"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  Calendar, Mail, Phone, Edit2, Heart,
  Clock, CreditCard, Loader2, Bell, Truck, AlertCircle
} from "lucide-react"
import Breadcrumb from "@/components/Breadcrumb"
import EditarPerfilModal from "@/components/ui/EditarPerfilModal"
import { useFavoritos } from "@/hooks/useFavoritos"
import Image from "next/image"
import Toast from "@/components/ui/Toast"

interface CustomUser {
  id?: number | string
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  telefono?: string | null
}

type PedidoDetalle = { nombre_producto: string; cantidad: number }
type Pedido = {
  id: number
  fecha_pedido: string
  estado: string
  total: number
  detalles: PedidoDetalle[]
}
type Cita = {
  fecha: string
  hora: string
  estado: string
  servicio: { nombre: string; precio: number }
}

const ESTADO_PEDIDO: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  PAGADO:    "bg-blue-100   text-blue-800",
  ENVIADO:   "bg-violet-100 text-violet-900",
  ENTREGADO: "bg-green-100  text-green-800",
  CANCELADO: "bg-red-100    text-red-800",
}


function fotoKey(userId?: number | string) {
  return `brenns_foto_perfil_${userId ?? "anon"}`
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [datosLocales, setDatosLocales] = useState<Partial<CustomUser>>({})
  const [totalPedidos, setTotalPedidos] = useState<number | null>(null)
  const [totalCitas,   setTotalCitas]   = useState<number | null>(null)
  const [totalCursos,  setTotalCursos]  = useState<number | null>(null)
  const { favoritos } = useFavoritos()
  const [fotoSubiendo, setFotoSubiendo] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null)
  const [fechaRegistro, setFechaRegistro] = useState<string | null>(null)

  const user = session?.user as CustomUser | undefined

  useEffect(() => {
    if (!user?.id) return
    const cached = localStorage.getItem(fotoKey(user.id))
    if (cached && !user.image) setDatosLocales(prev => ({ ...prev, image: cached }))
  }, [user?.id, user?.image])

  useEffect(() => {
    if (user?.image) setDatosLocales(prev => ({ ...prev, image: user.image ?? undefined }))
  }, [user?.image])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/pedidos").then(r => r.json())
      .then(d => setTotalPedidos(Array.isArray(d) ? d.length : 0))
      .catch(() => setTotalPedidos(0))
    fetch("/api/citas").then(r => r.json())
      .then(d => setTotalCitas(Array.isArray(d) ? d.length : 0))
      .catch(() => setTotalCitas(0))
    fetch("/api/mis-cursos").then(r => r.json())
      .then(d => setTotalCursos(Array.isArray(d.cursos) ? d.cursos.length : 0))
      .catch(() => setTotalCursos(0))
    fetch("/api/usuario/perfil").then(r => r.json())
      .then(d => d.fecha_registro && setFechaRegistro(d.fecha_registro))
      .catch(() => null)
  }, [status])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#fff8fa] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    )
  }

  if (!session?.user) return null

  const nombre     = datosLocales.name     ?? user?.name     ?? "Usuario"
  const correo     = datosLocales.email    ?? user?.email    ?? ""
  const telefono   = datosLocales.telefono ?? user?.telefono ?? null
  const fotoPerfil = datosLocales.image    ?? user?.image    ?? null
  const primerLetra = nombre.charAt(0).toUpperCase()
  const fechaReg = fechaRegistro
    ? new Date(fechaRegistro).toLocaleDateString("es-MX", { month: "long", year: "numeric" })
    : "—"

  const handleSubirFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoSubiendo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const resUpload = await fetch("/api/usuario/upload-foto", { method: "POST", body: formData })
      const uploadData = await resUpload.json()
      if (!resUpload.ok) throw new Error(uploadData.error || "Error")
      await fetch("/api/usuario/foto", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploadData.url }),
      })
      if (user?.id) localStorage.setItem(fotoKey(user.id), uploadData.url)
      setDatosLocales(prev => ({ ...prev, image: uploadData.url }))
      await update({ image: uploadData.url })
      setToast({ message: "Foto actualizada", type: "success" })
    } catch {
      setToast({ message: "Error al subir foto", type: "error" })
    } finally {
      setFotoSubiendo(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8fa] dark:bg-gray-950 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Mi Perfil", href: "#", active: true }]} />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[2rem] p-8 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-md ring-2 ring-rose-100 dark:ring-rose-900 bg-rose-50 dark:bg-gray-700">
                {fotoPerfil ? (
                  <Image src={fotoPerfil} alt="Perfil" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-rose-500 text-4xl font-bold">{primerLetra}</div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 border border-rose-200 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition">
                <Edit2 className="w-3.5 h-3.5 text-rose-500" />
                <input type="file" className="hidden" onChange={handleSubirFoto} disabled={fotoSubiendo} />
              </label>
              {fotoSubiendo && (
                <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black text-[#3d0020] dark:text-white">{nombre}</h1>
              <p className="text-rose-500 text-xs font-black uppercase tracking-[0.2em] mt-1">
                {user?.role === "ADMIN" ? "ADMINISTRADOR" : user?.role === "DOCENTE" ? "DOCENTE" : "MIEMBRO"}
              </p>
              <p className="text-gray-400 text-sm mt-1">Miembro desde {fechaReg}</p>
            </div>
          </div>
          <button
            onClick={() => setModalAbierto(true)}
            className="bg-[#0f172a] hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-full transition-all flex items-center gap-2 text-sm shadow-lg shadow-gray-200 dark:shadow-gray-900"
          >
            <Edit2 className="w-4 h-4" /> Editar perfil
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Columna izquierda */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-500 mb-6">Informacion Personal</h3>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Correo</p>
                    <p className="text-sm font-bold text-[#3d0020] dark:text-rose-200 truncate">{correo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Telefono</p>
                    <p className={`text-sm font-bold ${telefono ? "text-[#3d0020] dark:text-rose-200" : "text-gray-300 dark:text-gray-600 italic"}`}>
                      {telefono ?? "No disponible"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/favoritos" className="block bg-[#fff0f5] dark:bg-gray-800 border border-[#ffd0e0] dark:border-gray-700 rounded-[1.5rem] p-8 text-center group hover:scale-[1.02] transition-transform">
              <Heart className="w-8 h-8 text-rose-500 mx-auto mb-3 fill-rose-500" />
              <p className="text-5xl font-black text-rose-600 leading-none">{favoritos.length}</p>
              <p className="text-xs font-black uppercase tracking-widest text-rose-400 mt-2">Favoritos</p>
            </Link>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Link href="/mis-cursos" className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 text-center shadow-sm hover:bg-rose-50 dark:hover:bg-gray-700 transition group">
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition">
                  <Calendar className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-3xl font-black text-[#3d0020] dark:text-white">{totalCursos ?? "0"}</p>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Cursos</p>
              </Link>
              <Link href="/mis-citas" className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 text-center shadow-sm hover:bg-rose-50 dark:hover:bg-gray-700 transition group">
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-3xl font-black text-[#3d0020] dark:text-white">{totalCitas ?? "0"}</p>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Mis Citas</p>
              </Link>
              <Link href="/mis-pedidos" className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 text-center shadow-sm hover:bg-rose-50 dark:hover:bg-gray-700 transition group">
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white dark:group-hover:bg-gray-600 transition">
                  <CreditCard className="w-5 h-5 text-rose-400" />
                </div>
                <p className="text-3xl font-black text-[#3d0020] dark:text-white">{totalPedidos ?? "0"}</p>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Compras</p>
              </Link>
            </div>

            <RecordatoriosSection />
            <UltimaCompraSection />
            <UltimaCitaSection />
          </div>
        </div>
      </div>

      {modalAbierto && <EditarPerfilModal onClose={() => setModalAbierto(false)} onActualizado={setDatosLocales} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  )
}

// ── Tipos para recordatorios ──────────────────────────────────────────────────
type CitaProxima    = { id: number; servicio: string; fecha: string; hora: string; estado: string }
type PedidoTransito = { id: number; estado: string; total: number; fecha_pedido: string; productos: string }

function RecordatoriosSection() {
  const [citas,   setCitas]   = useState<CitaProxima[]>([])
  const [pedidos, setPedidos] = useState<PedidoTransito[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/usuario/recordatorios")
      .then(r => r.json())
      .then(d => {
        setCitas(d.citasProximas    ?? [])
        setPedidos(d.pedidosEnTransito ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  const total = citas.length + pedidos.length
  if (!loading && total === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-[1.5rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber-500" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Recordatorios</h3>
        {!loading && total > 0 && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full">{total}</span>
        )}
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-amber-200 mx-auto py-4" />
      ) : (
        <div className="space-y-3">
          {citas.map(c => (
            <div key={`cita-${c.id}`} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Cita proxima — {c.servicio}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {new Date(c.fecha).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })} - {c.hora}
                </p>
                <span className={`inline-block text-[9px] font-black px-2 py-0.5 rounded-full mt-1 ${
                  c.estado === "CONFIRMADA" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>{c.estado}</span>
              </div>
              <Link href="/mis-citas" className="text-xs text-rose-500 font-bold hover:underline shrink-0">Ver</Link>
            </div>
          ))}

          {pedidos.map(p => (
            <div key={`pedido-${p.id}`} className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl px-4 py-3">
              <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Pedido #{String(p.id).padStart(6, "0")} — {p.estado === "ENVIADO" ? "En camino" : "Pagado, preparando"}
                </p>
                <p className="text-xs text-blue-700 mt-0.5 truncate">{p.productos}</p>
                <p className="text-xs text-gray-400 mt-0.5">${p.total.toLocaleString("es-MX")} MXN</p>
              </div>
              <Link href="/mis-pedidos" className="text-xs text-rose-500 font-bold hover:underline shrink-0">Ver</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function UltimaCompraSection() {
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/pedidos").then(r => r.json()).then(d => {
      setPedido(Array.isArray(d) && d.length > 0 ? d[0] : null)
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#3d0020] dark:text-rose-300">Mi Ultima Compra</h3>
        <Link href="/mis-pedidos" className="text-xs font-bold text-rose-500 hover:underline">Ver todas</Link>
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-rose-200 mx-auto py-4" />
      ) : pedido ? (
        <div className="bg-[#fff8fa] dark:bg-gray-900 border border-[#ffe4ef] dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-black text-[#3d0020] dark:text-white">Pedido #{String(pedido.id).padStart(6, "0")}</p>
            <p className="text-xs text-[#b06080] dark:text-rose-300 mt-1">
              {pedido.detalles?.map(d => `${d.nombre_producto} x${d.cantidad}`).join(" / ")}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">{new Date(pedido.fecha_pedido).toLocaleDateString("es-MX")}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-[9px] font-black px-3 py-1 rounded-full ${ESTADO_PEDIDO[pedido.estado]}`}>{pedido.estado}</span>
            <p className="text-lg font-black text-[#3d0020] dark:text-white mt-1">${pedido.total.toLocaleString("es-MX")} MXN</p>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 italic">No hay compras recientes.</p>
      )}
    </div>
  )
}

function UltimaCitaSection() {
  const [cita, setCita] = useState<Cita | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/citas").then(r => r.json()).then(d => {
      setCita(Array.isArray(d) && d.length > 0 ? d[0] : null)
      setLoading(false)
    })
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#3d0020] dark:text-rose-300">Mi Ultima Cita</h3>
        <Link href="/mis-citas" className="text-xs font-bold text-rose-500 hover:underline">Ver todas</Link>
      </div>
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-rose-200 mx-auto py-4" />
      ) : cita ? (
        <div className="bg-[#fff8fa] dark:bg-gray-900 border border-[#ffe4ef] dark:border-gray-700 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-black text-[#3d0020] dark:text-white">{cita.servicio.nombre}</p>
            <p className="text-xs text-[#b06080] dark:text-rose-300 mt-1">{new Date(cita.fecha).toLocaleDateString("es-MX")} - {cita.hora}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              cita.estado === 'CONFIRMADA' ? 'bg-green-100 text-green-700' :
              cita.estado === 'PENDIENTE'  ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {cita.estado}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No tienes citas próximas</p>
      )}
    </div>
  )
}
