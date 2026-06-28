'use client'

import { useEffect } from 'react'
import Link from 'next/link'

function Illustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56 sm:w-72 sm:h-72">
      {/* Lámpara UV — minimalista */}
      {/* Cuerpo */}
      <rect x="50" y="70" width="100" height="80" rx="18" fill="#f9a8c9"/>
      {/* Panel interior */}
      <rect x="62" y="82" width="76" height="52" rx="10" fill="#e879f9" opacity="0.5"/>
      {/* Líneas de luz */}
      <rect x="72"  y="90" width="4" height="36" rx="2" fill="white" opacity="0.6"/>
      <rect x="84"  y="90" width="4" height="36" rx="2" fill="white" opacity="0.6"/>
      <rect x="96"  y="90" width="4" height="36" rx="2" fill="white" opacity="0.6"/>
      <rect x="108" y="90" width="4" height="36" rx="2" fill="white" opacity="0.6"/>
      <rect x="120" y="90" width="4" height="36" rx="2" fill="white" opacity="0.6"/>
      {/* Base */}
      <rect x="80" y="148" width="40" height="28" rx="6" fill="#f0abfc"/>
      <rect x="70" y="172" width="60" height="10" rx="5" fill="#f9a8c9"/>
      {/* Cable */}
      <path d="M100 70 Q120 45 100 28" stroke="#f0abfc" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Cara triste */}
      <circle cx="82" cy="66" r="4" fill="#ec4899"/>
      <circle cx="118" cy="66" r="4" fill="#ec4899"/>
      <path d="M86 60 Q100 54 114 60" stroke="#ec4899" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-6 text-center
                    bg-white dark:bg-gray-950 transition-colors">

      <Illustration />

      <p className="text-xs font-bold text-pink-300 dark:text-pink-600 uppercase tracking-[0.3em] mt-6 mb-3">
        Error 500
      </p>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
        Algo salió mal
      </h1>

      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mb-10">
        El servidor tuvo un problema. Nuestro equipo ya está trabajando en ello.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="border border-pink-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm font-semibold px-8 py-3 rounded-full hover:border-pink-400 dark:hover:border-pink-600 transition-all text-center"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
