// src/components/ui/AuthGuard.tsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router     = useRouter()
  const pathname   = usePathname()
  const params     = useSearchParams()

  useEffect(() => {
    if (status === "unauthenticated") {
      const ruta = pathname + (params.toString() ? `?${params.toString()}` : "")
      router.push(`/login?next=${encodeURIComponent(ruta)}`)
    }
  }, [status, router, pathname, params])

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

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  )
}