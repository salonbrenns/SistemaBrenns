"use client"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

interface Props {
  paginaActual: number
  totalPaginas: number
}

export default function PaginacionURL({ paginaActual, totalPaginas }: Props) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  if (totalPaginas <= 1) return null

  const buildHref = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (p === 1) params.delete("page")
    else params.set("page", String(p))
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const pages: (number | "...")[] = []
  const start = Math.max(1, paginaActual - 2)
  const end   = Math.min(totalPaginas, paginaActual + 2)

  if (start > 1) { pages.push(1); if (start > 2) pages.push("...") }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPaginas) { if (end < totalPaginas - 1) pages.push("..."); pages.push(totalPaginas) }

  const btnBase = "px-3 py-1.5 rounded-xl border text-sm font-semibold transition-colors"

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      <Link
        href={buildHref(paginaActual - 1)}
        aria-disabled={paginaActual <= 1}
        className={`${btnBase} ${paginaActual <= 1 ? "pointer-events-none opacity-40" : "hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300"}`}
      >
        ← Anterior
      </Link>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${
              paginaActual === page
                ? "bg-rose-700 text-white border-rose-700 shadow-md"
                : "hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:border-gray-600"
            }`}
          >
            {page}
          </Link>
        )
      )}

      <Link
        href={buildHref(paginaActual + 1)}
        aria-disabled={paginaActual >= totalPaginas}
        className={`${btnBase} ${paginaActual >= totalPaginas ? "pointer-events-none opacity-40" : "hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300"}`}
      >
        Siguiente →
      </Link>
    </div>
  )
}
