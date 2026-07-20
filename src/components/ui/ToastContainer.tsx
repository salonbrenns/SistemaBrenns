'use client'

// src/components/ui/ToastContainer.tsx
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
  visible: boolean
}

const CONFIG: Record<ToastType, { icon: typeof CheckCircle; bar: string; card: string; iconCls: string }> = {
  success: {
    icon:    CheckCircle,
    bar:     'bg-green-500',
    card:    'bg-white dark:bg-gray-800 border-l-4 border-green-500',
    iconCls: 'text-green-500',
  },
  error: {
    icon:    XCircle,
    bar:     'bg-red-500',
    card:    'bg-white dark:bg-gray-800 border-l-4 border-red-500',
    iconCls: 'text-red-500',
  },
  warning: {
    icon:    AlertTriangle,
    bar:     'bg-amber-500',
    card:    'bg-white dark:bg-gray-800 border-l-4 border-amber-500',
    iconCls: 'text-amber-500',
  },
  info: {
    icon:    Info,
    bar:     'bg-blue-500',
    card:    'bg-white dark:bg-gray-800 border-l-4 border-blue-500',
    iconCls: 'text-blue-500',
  },
}

const DURATION = 4000  // ms before auto-dismiss

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
  const cfg = CONFIG[item.type]
  const Icon = cfg.icon

  const handleClose = useCallback(() => {
    onRemove(item.id)
  }, [item.id, onRemove])

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg
        border border-gray-100 dark:border-gray-700
        max-w-sm w-full overflow-hidden
        transition-all duration-300 ease-out
        ${item.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${cfg.card}
      `}
    >
      {/* Icono */}
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconCls}`} />

      {/* Mensaje */}
      <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug">
        {item.message}
      </p>

      {/* Cerrar */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Barra de progreso */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} rounded-full`}
        style={{
          width: '100%',
          animation: `toast-shrink ${DURATION}ms linear forwards`,
        }}
      />
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: number) => {
    // Slide out first, then remove
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 300)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<ToastItem, 'visible'>
      const newToast: ToastItem = { ...detail, visible: false }

      setToasts(prev => [...prev, newToast])

      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setToasts(prev => prev.map(t => t.id === newToast.id ? { ...t, visible: true } : t))
        })
      })

      // Auto-dismiss
      setTimeout(() => remove(newToast.id), DURATION)
    }

    window.addEventListener('app-toast', handler)
    return () => window.removeEventListener('app-toast', handler)
  }, [remove])

  if (toasts.length === 0) return null

  return (
    <>
      {/* CSS keyframe para la barra de progreso */}
      <style>{`
        @keyframes toast-shrink {
          from { width: 100% }
          to   { width: 0% }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
        {toasts.map(item => (
          <div key={item.id} className="pointer-events-auto">
            <ToastItem item={item} onRemove={remove} />
          </div>
        ))}
      </div>
    </>
  )
}
