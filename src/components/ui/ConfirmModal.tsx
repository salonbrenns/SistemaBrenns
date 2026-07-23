'use client'

import { useEffect, useState } from 'react'

type ConfirmDetail = {
  message:       string
  resolve:       (value: boolean) => void
  title?:        string
  confirmLabel?: string
  danger?:       boolean
}

export default function ConfirmModal() {
  const [current, setCurrent] = useState<ConfirmDetail | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ConfirmDetail>).detail
      setCurrent(detail)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }
    window.addEventListener('app-confirm', handler)
    return () => window.removeEventListener('app-confirm', handler)
  }, [])

  const answer = (value: boolean) => {
    setVisible(false)
    setTimeout(() => {
      current?.resolve(value)
      setCurrent(null)
    }, 200)
  }

  if (!current) return null

  const isDanger       = current.danger        ?? false
  const confirmLabel   = current.confirmLabel  ?? (isDanger ? 'Eliminar' : 'Confirmar')
  const title          = current.title         ?? (isDanger ? 'Confirmar eliminación' : 'Confirmar acción')
  const headerClass    = isDanger
    ? 'bg-gradient-to-r from-red-900 to-red-700'
    : 'bg-gradient-to-r from-rose-900 to-rose-700'
  const confirmBtnClass = isDanger
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-rose-700 hover:bg-rose-800'

  return (
    <div
      className={`fixed inset-0 z-[9998] flex items-center justify-center transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => answer(false)}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-transform duration-200 ${visible ? 'scale-100' : 'scale-95'}`}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center gap-3 ${headerClass}`}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-white font-semibold text-base">{title}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-line">
            {current.message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={() => answer(false)}
            className="px-5 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => answer(true)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
