"use client"

import { useState } from "react"
import { confirmDialog } from "@/lib/confirm"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, GraduationCap, ExternalLink, Loader2, AlertCircle } from "lucide-react"
import DropdownAcciones, { DropdownItem, DropdownSeparator } from "@/components/ui/DropdownAcciones"

type Pago = { id: number; monto: number; metodo_pago: string | null; estado: string }
type Props = { inscripcionId: number; estadoInscripcion: string; pagos: Pago[]; cursoId?: number }

export default function AccionesInscrito({ inscripcionId, estadoInscripcion, pagos }: Props) {
  const router = useRouter()
  const [cargando, setCargando] = useState("")
  const [error,    setError]    = useState("")

  const cambiarEstadoPago = async (pagoId: number, estado: "PAGADO" | "RECHAZADO") => {
    setCargando(`pago-${pagoId}-${estado}`); setError("")
    try {
      const res = await fetch(`/api/admin/cursos/pagos/${pagoId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error")
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally { setCargando("") }
  }

  const cambiarEstado = async (estado: "COMPLETADO" | "CANCELADO" | "ACTIVO") => {
    if (estado === "CANCELADO" && !(await confirmDialog(
      "¿Cancelar esta inscripción? La alumna perderá su lugar.",
      { danger: true, title: "Cancelar inscripción", confirmLabel: "Cancelar inscripción" }
    ))) return
    setCargando(`insc-${estado}`); setError("")
    try {
      const res = await fetch(`/api/admin/cursos/inscripciones/${inscripcionId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error")
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado")
    } finally { setCargando("") }
  }

  const pagosPendientes = pagos.filter(p => p.estado === "PENDIENTE")
  const completado = estadoInscripcion === "COMPLETADO"
  const cancelado  = estadoInscripcion === "CANCELADO"

  return (
    <div>
      <DropdownAcciones>
        {/* Pagos pendientes */}
        {pagosPendientes.map(pago => (
          <div key={pago.id} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1.5">
              Pago pendiente — ${pago.monto.toLocaleString("es-MX")} MXN
            </p>
            <div className="flex gap-1.5">
              <button onClick={() => cambiarEstadoPago(pago.id, "PAGADO")} disabled={!!cargando}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition disabled:opacity-50">
                {cargando === `pago-${pago.id}-PAGADO` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Confirmar
              </button>
              <button onClick={() => cambiarEstadoPago(pago.id, "RECHAZADO")} disabled={!!cargando}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition disabled:opacity-50">
                {cargando === `pago-${pago.id}-RECHAZADO` ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                Rechazar
              </button>
            </div>
          </div>
        ))}

        {/* Acciones inscripción */}
        {!completado && !cancelado && (
          <DropdownItem onClick={() => cambiarEstado("COMPLETADO")} disabled={!!cargando}
            icon={cargando === "insc-COMPLETADO" ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
            label="Marcar como completado" />
        )}
        {(completado || cancelado) && (
          <DropdownItem onClick={() => cambiarEstado("ACTIVO")} disabled={!!cargando}
            icon={<CheckCircle2 className="w-4 h-4" />} label="Reactivar inscripción" />
        )}
        {completado && (
          <>
            <DropdownSeparator />
            <a href={`/certificado/${inscripcionId}`} target="_blank"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:text-pink-700 transition">
              <ExternalLink className="w-4 h-4" /> Ver / imprimir certificado
            </a>
          </>
        )}
        {!cancelado && <DropdownSeparator />}
        {!cancelado && (
          <DropdownItem onClick={() => cambiarEstado("CANCELADO")} disabled={!!cargando} danger
            icon={cargando === "insc-CANCELADO" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            label="Cancelar inscripción" />
        )}
      </DropdownAcciones>

      {error && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-red-500">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  )
}
