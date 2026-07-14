"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2, XCircle, GraduationCap, ExternalLink,
  Loader2, ChevronDown, AlertCircle,
} from "lucide-react"

type Pago = {
  id:          number
  monto:       number
  metodo_pago: string | null
  estado:      string
}

type Props = {
  inscripcionId: number
  estadoInscripcion: string
  pagos: Pago[]
  cursoId?: number
}

export default function AccionesInscrito({
  inscripcionId,
  estadoInscripcion,
  pagos,
}: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState<string>("")
  const [open, setOpen]         = useState(false)
  const [error, setError]       = useState("")

  const cambiarEstadoPago = async (pagoId: number, estado: "PAGADO" | "RECHAZADO") => {
    setCargando(`pago-${pagoId}-${estado}`)
    setError("")
    try {
      const res = await fetch(`/api/admin/cursos/pagos/${pagoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al actualizar")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setCargando("")
    }
  }

  const cambiarEstadoInscripcion = async (estado: "COMPLETADO" | "CANCELADO" | "ACTIVO") => {
    if (estado === "CANCELADO" && !confirm("¿Cancelar esta inscripción?")) return
    setCargando(`insc-${estado}`)
    setError("")
    try {
      const res = await fetch(`/api/admin/cursos/inscripciones/${inscripcionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Error al actualizar")
      }
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally {
      setCargando("")
    }
  }

  const pagosPendientes = pagos.filter(p => p.estado === "PENDIENTE")
  const completado = estadoInscripcion === "COMPLETADO"
  const cancelado  = estadoInscripcion === "CANCELADO"

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(o => !o); setError("") }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition"
      >
        Acciones <ChevronDown className="w-3 h-3" />
      </button>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400 whitespace-nowrap">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-8 z-20 w-64 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">

            {pagosPendientes.length > 0 && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Confirmar pagos
                </p>
                {pagosPendientes.map(pago => (
                  <div key={pago.id} className="flex items-center justify-between gap-2 py-1.5">
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      ${pago.monto.toLocaleString("es-MX")} MXN — {pago.metodo_pago}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => cambiarEstadoPago(pago.id, "PAGADO")}
                        disabled={!!cargando}
                        title="Confirmar pago"
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition disabled:opacity-50"
                      >
                        {cargando === `pago-${pago.id}-PAGADO`
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => cambiarEstadoPago(pago.id, "RECHAZADO")}
                        disabled={!!cargando}
                        title="Rechazar pago"
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {cargando === `pago-${pago.id}-RECHAZADO`
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <XCircle className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-2 space-y-0.5">
              {!completado && !cancelado && (
                <button
                  onClick={() => { setOpen(false); cambiarEstadoInscripcion("COMPLETADO") }}
                  disabled={!!cargando}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition disabled:opacity-50"
                >
                  {cargando === "insc-COMPLETADO"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <GraduationCap className="w-4 h-4" />}
                  Marcar como completado
                </button>
              )}

              {(completado || cancelado) && (
                <button
                  onClick={() => { setOpen(false); cambiarEstadoInscripcion("ACTIVO") }}
                  disabled={!!cargando}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-blue-50 dark:hover:bg-blue-950/20 text-gray-700 dark:text-gray-300 hover:text-blue-600 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Reactivar inscripción
                </button>
              )}

              {completado && (
                <a
                  href={`/certificado/${inscripcionId}`}
                  target="_blank"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-pink-50 dark:hover:bg-pink-950/20 text-gray-700 dark:text-gray-300 hover:text-pink-600 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver / imprimir certificado
                </a>
              )}

              {!cancelado && (
                <button
                  onClick={() => { setOpen(false); cambiarEstadoInscripcion("CANCELADO") }}
                  disabled={!!cargando}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-700 dark:text-gray-300 hover:text-red-600 transition disabled:opacity-50"
                >
                  {cargando === "insc-CANCELADO"
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <XCircle className="w-4 h-4" />}
                  Cancelar inscripción
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
