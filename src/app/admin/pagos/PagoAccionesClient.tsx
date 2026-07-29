'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PagoAccionesClientProps {
  citaId: number
}

export default function PagoAccionesClient({ citaId }: PagoAccionesClientProps) {
  const router = useRouter()
  const [cargando, setCargando] = useState<'confirmar' | 'rechazar' | null>(null)

  async function accion(tipo: 'confirmar' | 'rechazar') {
    if (cargando) return
    const confirmMsg = tipo === 'confirmar'
      ? '¿Confirmar el comprobante y aprobar la cita?'
      : '¿Rechazar el comprobante? La clienta recibirá un correo para reenviar uno correcto.'
    if (!confirm(confirmMsg)) return

    setCargando(tipo)
    try {
      const res = await fetch(`/api/admin/citas/${citaId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accion: tipo }),
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

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => accion('confirmar')}
        disabled={!!cargando}
        title="Confirmar comprobante y aprobar cita"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60 disabled:opacity-50 transition-colors"
      >
        {cargando === 'confirmar'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <CheckCircle className="w-3.5 h-3.5" />}
        Confirmar
      </button>
      <button
        onClick={() => accion('rechazar')}
        disabled={!!cargando}
        title="Rechazar comprobante — la clienta deberá reenviar uno correcto"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50 transition-colors"
      >
        {cargando === 'rechazar'
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <XCircle className="w-3.5 h-3.5" />}
        Rechazar
      </button>
    </div>
  )
}
