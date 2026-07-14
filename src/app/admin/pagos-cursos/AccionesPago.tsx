"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"

export default function AccionesPago({ pagoId }: { pagoId: number }) {
  const router = useRouter()
  const [cargando, setCargando] = useState<"PAGADO" | "RECHAZADO" | "">("")
  const [error, setError]       = useState("")

  const cambiar = async (estado: "PAGADO" | "RECHAZADO") => {
    setCargando(estado)
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

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <button
          onClick={() => cambiar("PAGADO")}
          disabled={!!cargando}
          title="Confirmar pago"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition disabled:opacity-50"
        >
          {cargando === "PAGADO"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <CheckCircle2 className="w-3.5 h-3.5" />}
          Confirmar
        </button>
        <button
          onClick={() => cambiar("RECHAZADO")}
          disabled={!!cargando}
          title="Rechazar pago"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/50 transition disabled:opacity-50"
        >
          {cargando === "RECHAZADO"
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <XCircle className="w-3.5 h-3.5" />}
          Rechazar
        </button>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <AlertCircle className="w-3 h-3 shrink-0" /> {error}
        </p>
      )}
    </div>
  )
}
