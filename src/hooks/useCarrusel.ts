// src/hooks/useCarrusel.ts
// Hook compartido para la paginación de los carruseles de la página principal.
import { useState } from "react"

export function useCarrusel<T>(items: T[], porPagina = 3) {
  const [idx, setIdx] = useState(0)
  const total = items.length > 0 ? Math.ceil(items.length / porPagina) : 1

  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)
  const goTo = (i: number) => setIdx(i)
  const slice = items.slice(idx * porPagina, idx * porPagina + porPagina)

  return { idx, total, prev, next, goTo, slice }
}
