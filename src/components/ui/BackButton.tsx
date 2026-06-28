'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  fallbackHref: string
  label: string
  className?: string
}

/**
 * Regresa a la página anterior conservando paginación y filtros.
 * Si no hay historial (acceso directo), navega al fallbackHref.
 */
export default function BackButton({ fallbackHref, label, className }: BackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    // Si hay historial del navegador, regresar a él (conserva página y filtros)
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      onClick={handleBack}
      className={
        className ??
        'inline-flex items-center gap-1.5 text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-semibold text-sm transition-colors group'
      }
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      {label}
    </button>
  )
}
