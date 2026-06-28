// src/hooks/useFavoritosServicios.ts
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface FavoritoServicioItem {
  id:          number
  servicio_id: number
  servicio: {
    id:         number
    nombre:     string
    imagen:     unknown
    categoria:  string | null
    precio_min: number
    disponible: boolean
  }
}

let cache: FavoritoServicioItem[] | null = null
let fetchPromise: Promise<void> | null   = null
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(fn => fn())
}

async function fetchFavoritos() {
  if (fetchPromise) return fetchPromise
  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/favoritos-servicios')
      if (res.ok) {
        cache = await res.json()
        notifyListeners()
      }
    } finally {
      fetchPromise = null
    }
  })()
  return fetchPromise
}

function invalidateCache() {
  cache = null
}

export function useFavoritosServicios() {
  const { status } = useSession()
  const [favoritos, setFavoritos] = useState<FavoritoServicioItem[]>(cache ?? [])
  const [cargando, setCargando]   = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const update = () => {
      if (mountedRef.current && cache) setFavoritos([...cache])
    }
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    if (cache) { const cached = cache; setTimeout(() => { if (mountedRef.current) setFavoritos([...cached]) }, 0); return }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true)
    fetchFavoritos().finally(() => {
      if (mountedRef.current) setCargando(false)
    })
  }, [status])

  const cargar = useCallback(async () => {
    invalidateCache()
    setCargando(true)
    await fetchFavoritos()
    if (mountedRef.current) setCargando(false)
  }, [])

  const toggle = useCallback(async (servicio_id: number) => {
    const res = await fetch('/api/favoritos-servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servicio_id }),
    })
    if (res.ok) await cargar()
    return res.ok
  }, [cargar])

  const esFavorito = useCallback(
    (servicio_id: number) => favoritos.some(f => f.servicio_id === servicio_id),
    [favoritos]
  )

  return { favoritos, cargando, cargar, toggle, esFavorito }
}
