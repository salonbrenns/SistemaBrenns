'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface FavoritoItem {
  id:          number
  producto_id: number
  producto: {
    id:        number
    nombre:    string
    imagen:    unknown
    marca:     string | null
    categoria: string | null
    precio_min: number
    en_stock:   boolean
  }
}

export function useFavoritos() {
  const { status } = useSession()
  const [favoritos, setFavoritos] = useState<FavoritoItem[]>([])
  const [cargando, setCargando]   = useState(false)

  const cargar = useCallback(async () => {
    if (status !== 'authenticated') return
    setCargando(true)
    try {
      const res = await fetch('/api/favoritos')
      if (res.ok) setFavoritos(await res.json())
    } finally {
      setCargando(false)
    }
  }, [status])

  useEffect(() => { cargar() }, [cargar])

  // Toggle: agrega si no está, elimina si ya está
  const toggle = useCallback(async (producto_id: number) => {
    const res = await fetch('/api/favoritos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ producto_id }),
    })
    if (res.ok) await cargar()
    return res.ok
  }, [cargar])

  const esFavorito = useCallback(
    (producto_id: number) => favoritos.some(f => f.producto_id === producto_id),
    [favoritos]
  )

  return { favoritos, cargando, toggle, esFavorito }
}