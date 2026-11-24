"use client"
// Tarjeta de Mi perfil para activar las notificaciones del sistema.
// Con el permiso concedido, avisa de las citas que faltan menos de 24 horas.

import { useEffect, useState, useSyncExternalStore } from "react"
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react"
import { estadoPermiso, notificar, pedirPermiso, type EstadoPermiso } from "./notificaciones"

type CitaProxima = { id: number; servicio: string; fecha: string; hora: string }

const CLAVE_AVISADAS = "pwa-citas-notificadas"

function suscribir(callback: () => void) {
  window.addEventListener("pwa:permiso", callback)
  window.addEventListener("focus", callback) // por si lo cambian desde el candado del navegador
  return () => {
    window.removeEventListener("pwa:permiso", callback)
    window.removeEventListener("focus", callback)
  }
}

// Une la fecha de la cita con su hora ("17:00") en la zona horaria del dispositivo
function momentoDeLaCita(cita: CitaProxima) {
  return new Date(`${cita.fecha.slice(0, 10)}T${cita.hora}:00`)
}

async function avisarCitasProximas() {
  const res = await fetch("/api/usuario/recordatorios")
  if (!res.ok) return
  const { citasProximas = [] } = (await res.json()) as { citasProximas?: CitaProxima[] }

  let avisadas: number[] = []
  try { avisadas = JSON.parse(localStorage.getItem(CLAVE_AVISADAS) ?? "[]") } catch {}

  const ahora = Date.now()
  for (const cita of citasProximas) {
    const faltan = momentoDeLaCita(cita).getTime() - ahora
    if (faltan <= 0 || faltan > 24 * 60 * 60 * 1000 || avisadas.includes(cita.id)) continue

    const dia = momentoDeLaCita(cita).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    const enviada = await notificar("Recordatorio de tu cita", {
      cuerpo: `${cita.servicio} · ${dia} a las ${cita.hora}. Llega 10 minutos antes.`,
      url: "/mis-citas",
      etiqueta: `cita-${cita.id}`,
    })
    if (enviada) avisadas.push(cita.id)
  }
  // Guardamos las que ya se avisaron para no repetirlas cada vez que entra al perfil
  try { localStorage.setItem(CLAVE_AVISADAS, JSON.stringify(avisadas)) } catch {}
}

export default function ActivarNotificaciones() {
  const permiso = useSyncExternalStore<EstadoPermiso>(suscribir, estadoPermiso, () => "no-soportado")
  const [pidiendo, setPidiendo] = useState(false)

  useEffect(() => {
    if (permiso === "granted") avisarCitasProximas().catch(() => {})
  }, [permiso])

  const activar = async () => {
    setPidiendo(true)
    const resultado = await pedirPermiso()
    setPidiendo(false)
    if (resultado === "granted") {
      await notificar("Notificaciones activadas", {
        cuerpo: "Te avisaremos de tus citas próximas y cuando se actualice el contenido guardado.",
        url: "/perfil",
        etiqueta: "pwa-bienvenida",
      })
    }
  }

  const probar = () =>
    notificar("Salón Brenn's", {
      cuerpo: "Así se verán tus recordatorios de citas.",
      url: "/mis-citas",
      etiqueta: "pwa-prueba",
    })

  if (permiso === "no-soportado") return null

  return (
    <div className="bg-white dark:bg-gray-800 border border-[#ffd6e3] dark:border-gray-700 rounded-[1.5rem] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
          {permiso === "granted" ? <BellRing className="w-4 h-4 text-rose-500" />
            : permiso === "denied" ? <BellOff className="w-4 h-4 text-gray-400" />
            : <Bell className="w-4 h-4 text-rose-500" />}
        </div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-500">Notificaciones</h3>
      </div>

      {permiso === "default" && (
        <>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Recibe en tu dispositivo un aviso cuando tengas una cita en las próximas 24 horas.
          </p>
          <button
            type="button"
            onClick={activar}
            disabled={pidiendo}
            className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest py-3 rounded-2xl transition disabled:opacity-60"
          >
            {pidiendo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
            Activar notificaciones
          </button>
        </>
      )}

      {permiso === "granted" && (
        <>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-4">
            Activadas: te avisaremos de tus citas próximas.
          </p>
          <button
            type="button"
            onClick={probar}
            className="w-full border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-black uppercase tracking-widest py-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-gray-700 transition"
          >
            Enviar notificación de prueba
          </button>
        </>
      )}

      {permiso === "denied" && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Las notificaciones están bloqueadas. Actívalas desde el candado de la barra de direcciones y vuelve a esta página.
        </p>
      )}
    </div>
  )
}
