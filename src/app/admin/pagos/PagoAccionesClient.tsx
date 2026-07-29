'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PagoAccionesClientProps {
  citaId: number
}

export default function PagoAccionesClient({ citaId }: PagoAccionesClientProps) {
  const router = useRouter()
  const [cargando, setCargando]         = useState<'confirmar' | 'rechazar' | null>(null)
  const [mostrarMotivo, setMostrarMotivo] = useState(false)
  const [motivo, setMotivo]             = useState('')

  async function confirmar() {
    if (cargando) return
    if (!confirm('¿Confirmar el comprobante y aprobar la cita?')) return
    setCargando('confirmar')
    try {
      const res = await fetch(`/api/admin/citas/${citaId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accion: 'confirmar' }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Ocurrió un error')
        return
      }
      router.refresh()
    } catch {
      alert('Error de conexión')
    } finally {
      setCargando(null)
    }
  }

  async function rechazar() {
    if (cargando) return
    setCargando('rechazar')
    try {
      const res = await fetch(`/api/admin/citas/${citaId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accion: 'rechazar', motivo: motivo.trim() || null }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Ocurrió un error')
        return
      }
      setMostrarMotivo(false)
      setMotivo('')
      router.refresh()
    } catch {
      alert('Error de conexión')
    } finally {
      setCargando(null)
    }
  }

  if (mostrarMotivo) {
    return (
      <div className="mt-2 p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 space-y-2">
        <p className="text-xs font-semibold text-red-700 dark:text-red-400">
          Motivo del rechazo (opcional)
        </p>
        <textarea
          value={motivo}
          onChange={e => setMotivo(e.target.value)}
          placeholder="Ej: La imagen está borrosa, el monto no coincide..."
          rows={2}
          maxLength={300}
          className="w-full text-xs rounded-lg border border-red-200 dark:border-red-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
        />
        <div className="flex gap-1.5">
          <button
            onClick={rechazar}
            disabled={!!cargando}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {cargando === 'rechazar'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <XCircle className="w-3.5 h-3.5" />}
            Confirmar rechazo
          </button>
          <button
            onClick={() => { setMostrarMotivo(false); setMotivo('') }}
            disabled={!!cargando}
            className="px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <button
        onClick={confirmar}
        disabled={!!cargando}
        title="Comprobante válido — aprobar cita"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 disabled:opacity-50 transition-colors"
      >
        {cargando === 'confirmar'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <CheckCircle className="w-3.5 h-3.5" />}
        Confirmar
      </button>
      <button
        onClick={() => setMostrarMotivo(true)}
        disabled={!!cargando}
        title="Rechazar comprobante — la clienta podrá reenviar uno correcto"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 transition-colors"
      >
        <XCircle className="w-3.5 h-3.5" />
        Rechazar
      </button>
    </div>
  )
}
