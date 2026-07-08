'use client'
import { useEffect, useRef, useCallback } from 'react'

const EVENTOS = [
  'mousemove', 'mousedown', 'keydown',
  'scroll', 'touchstart', 'click',
] as const

/**
 * Detecta inactividad del usuario.
 * @param onWarning  Se llama `warningMs` antes del timeout (para mostrar aviso)
 * @param onIdle     Se llama cuando expira el tiempo de inactividad
 * @param idleMs     Tiempo total de inactividad antes de cerrar sesión (ms)
 * @param warningMs  Cuánto antes del cierre se muestra el aviso (ms)
 */
export function useIdleTimeout(
  onWarning: () => void,
  onIdle: () => void,
  idleMs: number,
  warningMs: number,
) {
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const idleTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (idleTimer.current)    clearTimeout(idleTimer.current)

    warningTimer.current = setTimeout(onWarning, idleMs - warningMs)
    idleTimer.current    = setTimeout(onIdle,    idleMs)
  }, [onWarning, onIdle, idleMs, warningMs])

  useEffect(() => {
    reset()
    EVENTOS.forEach(e => window.addEventListener(e, reset, { passive: true }))
    return () => {
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (idleTimer.current)    clearTimeout(idleTimer.current)
      EVENTOS.forEach(e => window.removeEventListener(e, reset))
    }
  }, [reset])

  return reset // exponer reset para que el modal pueda cancelar el cierre
}
