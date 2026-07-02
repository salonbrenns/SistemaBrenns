import { useEffect, useState } from "react"

interface Promocion {
  id: number
  tipo: string
  descuento: number
  codigo: string | null
  nombre: string
  producto_ids: number[]
}

export function usePromociones() {
  const [promos, setPromos] = useState<Promocion[]>([])

  useEffect(() => {
    fetch("/api/promociones")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPromos(data) })
      .catch(() => {})
  }, [])

  // Descuento aplicable a un producto específico
  const descuentoParaProducto = (productoId: number): number => {
    const aplicables = promos.filter(
      p => p.tipo === "PRODUCTO" && p.producto_ids.includes(productoId)
    )
    return aplicables.reduce((max, p) => Math.max(max, p.descuento), 0)
  }

  const precioConDescuento = (precio: number, productoId: number): number | null => {
    const descuento = descuentoParaProducto(productoId)
    if (!descuento) return null
    return precio * (1 - descuento / 100)
  }

  return { promos, descuentoParaProducto, precioConDescuento }
}