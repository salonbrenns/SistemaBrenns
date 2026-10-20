"use client"
// Usa el GPS del dispositivo para calcular la distancia al salón y abrir la ruta

import { useState } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"

// Coordenadas del salón (Huejutla de Reyes). Verifícalas en Google Maps:
// clic derecho sobre el local → copiar las coordenadas
const SALON = { lat: 21.139, lng: -98.419 }

// Distancia en km entre dos puntos (fórmula de Haversine)
function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

type Estado =
  | { tipo: "inicial" }
  | { tipo: "buscando" }
  | { tipo: "listo"; km: number; lat: number; lng: number }
  | { tipo: "error"; mensaje: string }

export default function ComoLlegar() {
  const [estado, setEstado] = useState<Estado>({ tipo: "inicial" })

  const obtenerUbicacion = () => {
    if (!("geolocation" in navigator)) {
      setEstado({ tipo: "error", mensaje: "Tu navegador no permite usar la ubicación." })
      return
    }
    setEstado({ tipo: "buscando" })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setEstado({
          tipo: "listo",
          km: distanciaKm(latitude, longitude, SALON.lat, SALON.lng),
          lat: latitude,
          lng: longitude,
        })
      },
      (err) => {
        const mensajes: Record<number, string> = {
          1: "No diste permiso para usar tu ubicación. Actívalo en el candado de la barra de direcciones.",
          2: "No se pudo detectar tu ubicación. Revisa que el GPS esté encendido.",
          3: "Se tardó demasiado en encontrar tu ubicación. Intenta de nuevo.",
        }
        setEstado({ tipo: "error", mensaje: mensajes[err.code] ?? "Ocurrió un error al leer tu ubicación." })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const urlRuta =
    estado.tipo === "listo"
      ? `https://www.google.com/maps/dir/?api=1&origin=${estado.lat},${estado.lng}&destination=${SALON.lat},${SALON.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${SALON.lat},${SALON.lng}`

  return (
    <div className="rounded-[2.5rem] border border-pink-100 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
      <MapPin className="mb-4 h-8 w-8 text-pink-500" />
      <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">¿Qué tan lejos estás?</h3>
      <p className="mb-6 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Usamos tu ubicación solo para calcular la distancia al salón. No se guarda.
      </p>

      {estado.tipo === "listo" && (
        <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
          Estás a <span className="font-black text-pink-600 dark:text-pink-400">
            {estado.km < 1 ? `${Math.round(estado.km * 1000)} m` : `${estado.km.toFixed(1)} km`}
          </span> del salón.
        </p>
      )}

      {estado.tipo === "error" && (
        <p className="mb-4 text-xs text-red-500">{estado.mensaje}</p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={obtenerUbicacion}
          disabled={estado.tipo === "buscando"}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pink-500 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-pink-400 disabled:opacity-60"
        >
          {estado.tipo === "buscando" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Buscando…</>
          ) : (
            <><Navigation className="h-4 w-4" /> Usar mi ubicación</>
          )}
        </button>

        <a
          href={urlRuta}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-2xl border border-pink-300 py-3 text-[11px] font-black uppercase tracking-widest text-pink-600 transition-all hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 dark:hover:bg-gray-700"
        >
          Ver ruta en Google Maps
        </a>
      </div>
    </div>
  )
}
