'use client'
import { useState, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useIdleTimeout } from '@/hooks/useIdleTimeout'
import { Clock, ShieldAlert } from 'lucide-react'

const IDLE_MS    = 5 * 60 * 1000  // 5 minutos total de inactividad
const WARNING_MS = 60 * 1000      // aviso 1 minuto antes

export default function IdleGuard() {
  const { status } = useSession()
  const [mostrarAviso, setMostrarAviso] = useState(false)
  const [segundos,     setSegundos]     = useState(WARNING_MS / 1000)
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const segundosRef   = useRef(WARNING_MS / 1000)

  const limpiarCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
  }

  const cerrarSesion = useCallback(async () => {
    limpiarCountdown()
    setMostrarAviso(false)
    await signOut({ callbackUrl: '/login?inactividad=1' })
  }, [])

  const mostrarModal = useCallback(() => {
    const total = WARNING_MS / 1000
    segundosRef.current = total
    setSegundos(total)
    setMostrarAviso(true)
    limpiarCountdown()

    // El countdown corre dentro del intervalo — sin useEffect
    countdownRef.current = setInterval(() => {
      segundosRef.current -= 1
      setSegundos(segundosRef.current)

      if (segundosRef.current <= 0) {
        limpiarCountdown()
        signOut({ callbackUrl: '/login?inactividad=1' })
      }
    }, 1000)
  }, [])

  const continuar = useCallback((resetIdle: () => void) => {
    limpiarCountdown()
    const total = WARNING_MS / 1000
    segundosRef.current = total
    setSegundos(total)
    setMostrarAviso(false)
    resetIdle()
  }, [])

  const resetIdle = useIdleTimeout(mostrarModal, cerrarSesion, IDLE_MS, WARNING_MS)

  if (status !== 'authenticated' || !mostrarAviso) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-8 h-8 text-amber-500" />
        </div>

        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          ¿Sigues ahí?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Tu sesión se cerrará por inactividad en
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-3xl font-black text-amber-600 tabular-nums w-10 text-center">
            {segundos}
          </span>
          <span className="text-gray-400 text-sm">segundos</span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => continuar(resetIdle)}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-full transition-all"
          >
            Continuar sesión
          </button>
          <button
            onClick={cerrarSesion}
            className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium transition-colors"
          >
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>
  )
}
