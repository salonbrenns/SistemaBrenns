"use client"
// Barra que avisa cuando el usuario se queda sin internet

import { useEffect, useState, useSyncExternalStore } from "react"
import { RefreshCw, WifiOff } from "lucide-react"

// Se suscribe a los eventos online/offline del navegador
function suscribir(callback: () => void) {
  window.addEventListener("online", callback)
  window.addEventListener("offline", callback)
  return () => {
    window.removeEventListener("online", callback)
    window.removeEventListener("offline", callback)
  }
}

export default function AvisoConexion() {
  const enLinea = useSyncExternalStore(
    suscribir,
    () => navigator.onLine, // valor en el navegador
    () => true              // en el servidor siempre asumimos que hay red
  )

  // Mensaje temporal cuando RegistrarSW termina de sincronizar al reconectar
  const [sincronizado, setSincronizado] = useState<string | null>(null)

  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout>
    const alSincronizar = (e: Event) => {
      const { guardadas, total } = (e as CustomEvent<{ guardadas: number; total: number }>).detail
      setSincronizado(`Conexión restablecida: contenido actualizado (${guardadas}/${total})`)
      clearTimeout(temporizador)
      temporizador = setTimeout(() => setSincronizado(null), 4000)
    }
    window.addEventListener("pwa:sincronizado", alSincronizar)
    return () => {
      window.removeEventListener("pwa:sincronizado", alSincronizar)
      clearTimeout(temporizador)
    }
  }, [])

  if (enLinea && sincronizado) {
    return (
      <div
        role="status"
        className="fixed bottom-4 left-1/2 z-[9998] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-emerald-600"
      >
        <RefreshCw className="h-4 w-4 text-emerald-400" />
        {sincronizado}
      </div>
    )
  }

  if (enLinea) return null

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-[9998] flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg ring-1 ring-pink-700"
    >
      <WifiOff className="h-4 w-4 text-pink-400" />
      Sin conexión: estás viendo la última versión guardada
    </div>
  )
}
