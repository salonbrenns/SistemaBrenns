// src/hooks/usePermisos.ts
import { useSession } from "next-auth/react"
import { useEffect, useState, useCallback } from "react"

export function usePermisos() {
  const { data: session } = useSession()
  const [permisos, setPermisos] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  const cargarPermisos = useCallback(async () => {
    if (!session?.user) {
      setCargando(false)
      return
    }

    try {
      const res = await fetch("/api/auth/mis-permisos")
      const data = await res.json()
      setPermisos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error cargando permisos:", error)
      setPermisos([])
    } finally {
      setCargando(false)
    }
  }, [session])

  useEffect(() => {
    cargarPermisos()
  }, [cargarPermisos])

  const puede = (key: string): boolean => {
    const user = session?.user

    // Admin siempre tiene todos los permisos
    if (user?.role === "ADMIN") return true

    // Soporte para "rol" si existe en algún lugar (tipo seguro)
    if ((user as { rol?: string })?.rol === "ADMIN") {
      return true
    }

    return permisos.includes(key)
  }

  return { 
    puede, 
    cargando, 
    permisos 
  }
}