"use client"
// Botón de micrófono para buscar productos hablando (Web Speech API).
// Chrome manda el audio a su servicio de voz, así que necesita internet.

import { useRef, useState, useSyncExternalStore } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"

// TypeScript no trae los tipos de SpeechRecognition, así que definimos lo que usamos
interface ResultadoVoz {
  isFinal: boolean
  0: { transcript: string }
}
interface EventoResultado {
  resultIndex: number
  results: ArrayLike<ResultadoVoz>
}
interface EventoError {
  error: string
}
interface Reconocedor {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onresult: ((e: EventoResultado) => void) | null
  onerror: ((e: EventoError) => void) | null
}
type ConstructorReconocedor = new () => Reconocedor

function obtenerReconocedor(): ConstructorReconocedor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as {
    SpeechRecognition?: ConstructorReconocedor
    webkitSpeechRecognition?: ConstructorReconocedor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

// El soporte no cambia, así que la suscripción no hace nada
const sinSuscripcion = () => () => {}

const MENSAJES_ERROR: Record<string, string> = {
  "not-allowed": "Activa el permiso del micrófono en el candado de la barra de direcciones.",
  "service-not-allowed": "Activa el permiso del micrófono en el candado de la barra de direcciones.",
  "no-speech": "No te escuché, intenta de nuevo.",
  "audio-capture": "No se encontró un micrófono conectado.",
  network: "La búsqueda por voz necesita internet.",
}

interface Props {
  onResultado: (texto: string) => void
}

export default function BusquedaPorVoz({ onResultado }: Props) {
  const soportado = useSyncExternalStore(sinSuscripcion, () => obtenerReconocedor() !== null, () => false)
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState("")
  const reconocedorRef = useRef<Reconocedor | null>(null)

  if (!soportado) return null

  const iniciar = () => {
    const Reconocedor = obtenerReconocedor()
    if (!Reconocedor) return

    if (!navigator.onLine) {
      setError(MENSAJES_ERROR.network)
      return
    }

    // Si ya está escuchando, el mismo botón lo detiene
    if (escuchando) {
      reconocedorRef.current?.stop()
      return
    }

    const rec = new Reconocedor()
    rec.lang = "es-MX"
    rec.interimResults = true // va escribiendo mientras hablas
    rec.continuous = false
    rec.maxAlternatives = 1

    rec.onstart = () => {
      setError("")
      setEscuchando(true)
    }
    rec.onresult = (e) => {
      let texto = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        texto += e.results[i][0].transcript
      }
      // Quitamos el punto final que a veces agrega el dictado
      onResultado(texto.trim().replace(/[.。]$/, "").toLowerCase())
    }
    rec.onerror = (e) => {
      if (e.error !== "aborted") setError(MENSAJES_ERROR[e.error] ?? "No se pudo usar el micrófono.")
    }
    rec.onend = () => setEscuchando(false)

    reconocedorRef.current = rec
    rec.start()
  }

  return (
    <>
      <button
        type="button"
        onClick={iniciar}
        aria-label={escuchando ? "Detener búsqueda por voz" : "Buscar por voz"}
        title={escuchando ? "Escuchando… toca para detener" : "Buscar por voz"}
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
          escuchando
            ? "bg-rose-600 text-white animate-pulse"
            : "text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-gray-700"
        }`}
      >
        {escuchando ? <Mic className="h-4 w-4" /> : error ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {(escuchando || error) && (
        <p
          role="status"
          className={`absolute left-0 top-full mt-1 flex items-center gap-1 text-xs ${
            error ? "text-red-500" : "text-rose-600 dark:text-rose-300"
          }`}
        >
          {escuchando && <Loader2 className="h-3 w-3 animate-spin" />}
          {escuchando ? "Escuchando… di el nombre del producto" : error}
        </p>
      )}
    </>
  )
}
