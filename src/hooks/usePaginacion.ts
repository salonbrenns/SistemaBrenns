import { useState } from "react"

export function usePaginacion<T>(items: T[], porPagina = 10) {
  const [pagina, setPagina] = useState(1)

  const totalPaginas  = Math.max(1, Math.ceil(items.length / porPagina))
  const paginaValida  = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio        = (paginaValida - 1) * porPagina
  const itemsPagina   = items.slice(inicio, inicio + porPagina)

  return { pagina: paginaValida, setPagina, totalPaginas, itemsPagina }
}
