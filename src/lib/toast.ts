// src/lib/toast.ts
// Singleton toast system — dispatches custom DOM events picked up by ToastContainer

type ToastType = 'success' | 'error' | 'warning' | 'info'

function dispatch(message: string, type: ToastType) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('app-toast', {
      detail: { id: Date.now() + Math.random(), message, type },
    })
  )
}

export const toast = {
  success: (msg: string) => dispatch(msg, 'success'),
  error:   (msg: string) => dispatch(msg, 'error'),
  warning: (msg: string) => dispatch(msg, 'warning'),
  info:    (msg: string) => dispatch(msg, 'info'),
}
