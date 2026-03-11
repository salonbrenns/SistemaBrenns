// src/app/admin/notificaciones/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, Clock, User, Phone, MessageSquare, CheckCircle, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { format, isToday, isTomorrow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type Cita = {
  id: number
  fecha: string
  hora: string
  estado: string
  notas: string | null
  nombre_contacto: string | null
  telefono_contacto: string | null
  metodo_pago: string | null
  servicio: { nombre: string; precio: number }
  usuario: { id: number; nombre: string; correo: string; telefono: string | null } | null
}

type Grupo = {
  label: string
  color: string
  citas: Cita[]
}

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE:   "bg-yellow-100 text-yellow-700",
  CONFIRMADA:  "bg-green-100 text-green-700",
  COMPLETADA:  "bg-blue-100 text-blue-700",
  CANCELADA:   "bg-red-100 text-red-700",
}

export default function NotificacionesPage() {
  const [citas,     setCitas]     = useState<Cita[]>([])
  const [cargando,  setCargando]  = useState(true)
  const [citaSel,   setCitaSel]   = useState<Cita | null>(null)
  const [mensaje,   setMensaje]   = useState("")
  const [enviando,  setEnviando]  = useState(false)
  const [enviado,   setEnviado]   = useState<number | null>(null)
  const [error,     setError]     = useState("")

  const cargarCitas = () => {
    setCargando(true)
    fetch("/api/admin/notificaciones")
      .then(r => r.json())
      .then(data => { setCitas(Array.isArray(data) ? data : []); setCargando(false) })
      .catch(() => setCargando(false))
  }

  useEffect(() => { cargarCitas() }, [])

  const hoy      = new Date()
  const manana   = new Date(hoy); manana.setDate(hoy.getDate() + 1)

  const grupos: Grupo[] = [
    {
      label: "📅 Hoy — " + format(hoy, "d 'de' MMMM", { locale: es }),
      color: "border-pink-400 bg-pink-50",
      citas: citas.filter(c => isToday(parseISO(c.fecha))),
    },
    {
      label: "🔔 Mañana — " + format(manana, "d 'de' MMMM", { locale: es }),
      color: "border-orange-300 bg-orange-50",
      citas: citas.filter(c => isTomorrow(parseISO(c.fecha))),
    },
    {
      label: "📆 Próximos 7 días",
      color: "border-blue-200 bg-blue-50",
      citas: citas.filter(c => {
        const f = parseISO(c.fecha)
        return !isToday(f) && !isTomorrow(f)
      }),
    },
  ]

  const handleEnviarMensaje = async () => {
    if (!citaSel || !mensaje.trim()) return
    setEnviando(true)
    setError("")
    try {
      const res = await fetch("/api/admin/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cita_id:    citaSel.id,
          usuario_id: citaSel.usuario?.id || null,
          mensaje:    mensaje.trim(),
        }),
      })
      if (!res.ok) throw new Error("Error al enviar")
      setEnviado(citaSel.id)
      setMensaje("")
      setCitaSel(null)
      setTimeout(() => setEnviado(null), 3000)
    } catch {
      setError("No se pudo enviar el mensaje")
    } finally {
      setEnviando(false)
    }
  }

  const nombreCliente = (c: Cita) => c.usuario?.nombre || c.nombre_contacto || "Cliente sin nombre"
  const telefonoCliente = (c: Cita) => c.usuario?.telefono || c.telefono_contacto || null

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-pink-500" /> Notificaciones
          </h1>
          <p className="text-sm text-gray-500 mt-1">Recordatorios de citas próximas</p>
        </div>
        <button onClick={cargarCitas}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 text-pink-600 rounded-xl hover:bg-pink-50 transition text-sm font-semibold">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Citas hoy",    count: grupos[0].citas.length, color: "bg-pink-500"   },
          { label: "Citas mañana", count: grupos[1].citas.length, color: "bg-orange-400" },
          { label: "Esta semana",  count: grupos[2].citas.length, color: "bg-blue-400"   },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
              {count}
            </div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Mensaje de éxito */}
      {enviado && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4" /> Mensaje enviado correctamente
        </div>
      )}

      {/* Grupos */}
      {cargando ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      ) : (
        grupos.map(grupo => (
          <div key={grupo.label}>
            <h2 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">{grupo.label}</h2>
            {grupo.citas.length === 0 ? (
              <div className={`border-l-4 ${grupo.color} rounded-xl p-4 text-sm text-gray-400`}>
                Sin citas programadas
              </div>
            ) : (
              <div className="space-y-3">
                {grupo.citas.map(cita => (
                  <div key={cita.id}
                    className={`border-l-4 ${grupo.color} rounded-xl p-4 shadow-sm`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Servicio y estado */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-800">{cita.servicio.nombre}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ESTADO_COLORS[cita.estado] || "bg-gray-100 text-gray-600"}`}>
                            {cita.estado}
                          </span>
                          {cita.metodo_pago && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              {cita.metodo_pago}
                            </span>
                          )}
                        </div>

                        {/* Fecha y hora */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(parseISO(cita.fecha), "EEEE d 'de' MMMM", { locale: es })}
                          </span>
                          <span className="flex items-center gap-1 text-pink-600 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            {cita.hora}
                          </span>
                        </div>

                        {/* Cliente */}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-pink-400" />
                            {nombreCliente(cita)}
                          </span>
                          {telefonoCliente(cita) && (
                            <span className="flex items-center gap-1 text-gray-400">
                              <Phone className="w-3.5 h-3.5" />
                              {telefonoCliente(cita)}
                            </span>
                          )}
                        </div>

                        {/* Notas */}
                        {cita.notas && (
                          <p className="text-xs text-gray-400 italic">"{cita.notas}"</p>
                        )}
                      </div>

                      {/* Botón mensaje */}
                      <button
                        onClick={() => { setCitaSel(cita); setMensaje(""); setError("") }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-pink-200 text-pink-600 rounded-xl hover:bg-pink-50 transition text-xs font-semibold whitespace-nowrap shadow-sm">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Enviar aviso
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal enviar mensaje */}
      {citaSel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Enviar aviso al cliente</h3>
              <p className="text-sm text-gray-500 mt-1">
                Para: <strong>{nombreCliente(citaSel)}</strong> — {citaSel.servicio.nombre} a las {citaSel.hora}
              </p>
            </div>

            {/* Mensajes rápidos */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Mensajes rápidos:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Tu cita ha sido confirmada ✅",
                  "Recordatorio: tienes cita mañana 🗓️",
                  "Por favor confirma tu asistencia",
                  "Lamentablemente debemos cancelar tu cita",
                  "¿Puedes cambiar el horario de tu cita?",
                ].map(m => (
                  <button key={m} onClick={() => setMensaje(m)}
                    className="text-xs bg-pink-50 border border-pink-100 text-pink-700 px-3 py-1.5 rounded-full hover:bg-pink-100 transition">
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <textarea value={mensaje} onChange={e => setMensaje(e.target.value)} rows={3}
              placeholder="Escribe el mensaje para el cliente..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none" />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </div>
            )}

            {!citaSel.usuario && (
              <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                ⚠️ Este cliente no tiene cuenta registrada. El mensaje quedará guardado en el sistema.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setCitaSel(null)}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-full hover:bg-gray-50 transition text-sm">
                Cancelar
              </button>
              <button onClick={handleEnviarMensaje} disabled={!mensaje.trim() || enviando}
                className="flex-1 bg-pink-600 text-white font-bold py-2.5 rounded-full hover:bg-pink-700 transition disabled:opacity-40 text-sm flex items-center justify-center gap-2">
                {enviando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><MessageSquare className="w-4 h-4" /> Enviar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}