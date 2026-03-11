// src/components/ui/AuthGuard.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  // Extraemos únicamente 'status', que es lo que realmente usamos
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      const ruta = window.location.pathname
      router.push(`/login?next=${ruta}`)
    }
  }, [status, router])

  // Cargando sesión
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-pink-600 font-semibold text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  // No autenticado — no renderizar nada (el useEffect redirige)
  if (status === "unauthenticated") {
    return null
  }

  // Autenticado — mostrar contenido
  return <>{children}</>
}