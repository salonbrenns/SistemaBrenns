interface PaginacionProps {
  paginaActual: number
  totalPaginas: number
  onChange: (pagina: number) => void
}

export default function Paginacion({ paginaActual, totalPaginas, onChange }: PaginacionProps) {
  if (totalPaginas <= 1) return null

  const pages: (number | '...')[] = []
  const start = Math.max(1, paginaActual - 2)
  const end   = Math.min(totalPaginas, paginaActual + 2)

  if (start > 1) { pages.push(1); if (start > 2) pages.push('...') }
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < totalPaginas) { if (end < totalPaginas - 1) pages.push('...'); pages.push(totalPaginas) }

  return (
    <div className="flex justify-center items-center gap-2 mt-12 flex-wrap">
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual <= 1}
        className="px-4 py-2 rounded-xl border text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 hover:border-rose-300 transition-colors"
      >
        ← Anterior
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`w-9 h-9 rounded-xl border text-sm font-bold transition-all ${
              paginaActual === page
                ? 'bg-rose-700 text-white border-rose-700 shadow-md'
                : 'hover:bg-rose-50 hover:border-rose-300'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual >= totalPaginas}
        className="px-4 py-2 rounded-xl border text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 hover:border-rose-300 transition-colors"
      >
        Siguiente →
      </button>
    </div>
  )
}