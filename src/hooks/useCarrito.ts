'use client'

/**
 * useCarrito — hook global para carrito desde BD.
 * Emite 'cart-updated' al modificar para que el Header actualice su contador.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from 'next-auth/react'

export interface CartItem {
  id:           number   // id del CarritoItem en BD
  cantidad:     number
  variante_id:  number
  tono:         string | null
  presentacion: string | null
  precio_venta: number
  stock:        number
  producto: {
    id:        number
    nombre:    string
    imagen:    unknown   // JsonValue — se normaliza en el componente
    marca:     string | null
    categoria: string | null
  }
}

function emitirActualizacion() {
  // Corregido: Preferir globalThis sobre window
  globalThis.dispatchEvent(new Event('cart-updated'))
}

export function useCarrito() {
  const { status } = useSession()
  const [items, setItems]     = useState<CartItem[]>([])
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    if (status !== 'authenticated') return
    setCargando(true)
    try {
      const res = await fetch('/api/carrito')
      if (res.ok) setItems(await res.json())
    } finally {
      setCargando(false)
    }
  }, [status])

  useEffect(() => { 
    cargar() 
  }, [cargar])

  // Agregar o incrementar variante
  const agregar = useCallback(async (variante_id: number, cantidad = 1) => {
    const res = await fetch('/api/carrito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variante_id, cantidad }),
    })
    if (res.ok) { 
      await cargar()
      emitirActualizacion() 
    }
    return res.ok
  }, [cargar])

  // Cambiar cantidad (0 = eliminar)
  const actualizarCantidad = useCallback(async (id: number, cantidad: number) => {
    const res = await fetch('/api/carrito', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, cantidad }),
    })
    if (res.ok) { 
      await cargar()
      emitirActualizacion() 
    }
  }, [cargar])

  // Eliminar item
  const eliminar = useCallback(async (id: number) => {
    const res = await fetch(`/api/carrito?id=${id}`, { method: 'DELETE' })
    if (res.ok) { 
      await cargar()
      emitirActualizacion() 
    }
  }, [cargar])

  
  const vaciar = useCallback(async () => {
    const res = await fetch('/api/carrito', { method: 'DELETE' })
    if (res.ok) { 
      setItems([])
      emitirActualizacion() 
    }
  }, [])

  // Optimización: Cálculos memorizados para evitar "Uncovered code" y renders innecesarios
  const total = useMemo(() => 
    items.reduce((s, i) => s + i.precio_venta * i.cantidad, 0), 
  [items])

  const totalItems = useMemo(() => 
    items.reduce((s, i) => s + i.cantidad, 0), 
  [items])

  return { items, cargando, total, totalItems, agregar, actualizarCantidad, eliminar, vaciar }
}