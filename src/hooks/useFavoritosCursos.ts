'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

let cache: number[] | null = null
let fetchPromise: Promise<void> | null = null
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((fn) => fn())
}

async function fetchFavoritos() {
  if (fetchPromise) return fetchPromise
  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/favoritos-cursos')
      if (res.ok) {
        const data = await res.json()
        cache = Array.isArray(data.favoritos) ? data.favoritos : []
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

export function useFavoritosCursos() {
  const { status } = useSession()
  const [favoritos, setFavoritos] = useState<number[]>(cache ?? [])
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
    if (cache) {
      const cached = cache
      setTimeout(() => { if (mountedRef.current) setFavoritos([...cached]) }, 0)
      return
    }
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

  const toggle = useCallback(
    async (cursoId: number) => {
      const res = await fetch('/api/favoritos-cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cursoId }),
      })
      if (res.ok) await cargar()
      return res.ok
    },
    [cargar]
  )

  const esFavorito = useCallback(
    (cursoId: number) => favoritos.includes(cursoId),
    [favoritos]
  )

  return { favoritos, cargando, cargar, toggle, esFavorito }
}
