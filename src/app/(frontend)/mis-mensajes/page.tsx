// src/app/(frontend)/mis-mensajes/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, Clock, CheckCheck, MessageSquare, Loader2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Mensaje = {
  id: number
  mensaje: string
  leido: boolean
  createdAt: string
  cita: {
    id: number
    hora: string
    fecha: string
    servicio: string
  }
}

export default function MisMensajesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mensajes,  setMensajes]  = useState<Mensaje[]>([])
  const [cargando,  setCargando]  = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/usuario/mensajes")
      .then(r => r.json())
      .then(data => { setMensajes(Array.isArray(data) ? data : []); setCargando(false) })
      .catch(() => setCargando(false))
  }, [status])

  const marcarLeido = async (id: number) => {
    setMensajes(prev => prev.map(m => m.id === id ? { ...m, leido: true } : m))
    await fetch("/api/usuario/mensajes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
  }

  const noLeidos = mensajes.filter(m => !m.leido).length

  if (status === "loading" || cargando) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-pink-500" /> Mis mensajes
          </h1>
          <p className="text-sm text-gray-500 mt-1">Avisos del equipo de Brenn&apos;s</p>
        </div>
        {noLeidos > 0 && (
          <span className="bg-pink-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {noLeidos} nuevo{noLeidos > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {mensajes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-pink-300" />
          </div>
          <p className="text-gray-400 font-medium">No tienes mensajes todavía</p>
          <p className="text-sm text-gray-300 mt-1">Aquí verás los avisos sobre tus citas</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mensajes.map(m => (
            <div
              key={m.id}
              onClick={() => { if (!m.leido) marcarLeido(m.id) }}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                m.leido
                  ? "border-gray-100 bg-white"
                  : "border-pink-200 bg-pink-50 shadow-sm"
              }`}
            >
              {/* Estado */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${m.leido ? "bg-gray-300" : "bg-pink-500"}`} />
                  <span className={`text-xs font-bold ${m.leido ? "text-gray-400" : "text-pink-600"}`}>
                    {m.leido ? "Leído" : "Nuevo"}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {format(parseISO(m.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                </span>
              </div>

              {/* Mensaje */}
              <p className={`text-sm font-medium mb-4 ${m.leido ? "text-gray-600" : "text-gray-800"}`}>
                {m.mensaje}
              </p>

              {/* Info de la cita */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="font-semibold text-pink-600">{m.cita.servicio}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(parseISO(m.cita.fecha), "d 'de' MMMM yyyy", { locale: es })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {m.cita.hora}
                </span>
              </div>

              {!m.leido && (
                <p className="text-xs text-pink-400 mt-3 flex items-center gap-1">
                  <CheckCheck className="w-3.5 h-3.5" /> Toca para marcar como leído
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}