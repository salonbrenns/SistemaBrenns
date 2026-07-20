"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function ClienteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Cliente Error]", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-10 shadow-sm max-w-md w-full">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {error.message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold transition"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Home className="w-4 h-4" />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
