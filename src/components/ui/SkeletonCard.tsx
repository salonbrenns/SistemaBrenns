// src/components/ui/SkeletonCard.tsx
// Skeletons de carga para todas las páginas

const P = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full"
const B = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"

// ── Catálogo: Servicios ───────────────────────────────────────────────────────
export function SkeletonServicioCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-rose-50 dark:border-gray-700 overflow-hidden">
      <div className={`h-60 ${B} rounded-none`} />
      <div className="p-5 space-y-3">
        <div className={`h-3 w-20 ${P}`} />
        <div className={`h-5 w-3/4 ${P}`} />
        <div className={`h-4 w-1/2 ${P}`} />
        <div className={`h-10 w-full ${P} mt-4`} />
      </div>
    </div>
  )
}

// ── Catálogo: Cursos ──────────────────────────────────────────────────────────
export function SkeletonCursoCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-pink-50 dark:border-gray-700 overflow-hidden">
      <div className={`h-52 ${B} rounded-none`} />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className={`h-5 w-16 ${P}`} />
          <div className={`h-5 w-20 ${P}`} />
        </div>
        <div className={`h-5 w-4/5 ${P}`} />
        <div className={`h-4 w-full ${P}`} />
        <div className={`h-4 w-2/3 ${P}`} />
        <div className="flex justify-between items-center pt-2">
          <div className={`h-6 w-20 ${P}`} />
          <div className={`h-9 w-28 ${P}`} />
        </div>
      </div>
    </div>
  )
}

// ── Catálogo: Productos ───────────────────────────────────────────────────────
export function SkeletonProductoCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-rose-50 dark:border-gray-700 overflow-hidden">
      <div className={`h-56 ${B} rounded-none`} />
      <div className="p-5 space-y-3">
        <div className={`h-3 w-16 ${P}`} />
        <div className={`h-5 w-3/4 ${P}`} />
        <div className="flex items-center justify-between pt-1">
          <div className={`h-6 w-20 ${P}`} />
          <div className={`h-9 w-9 ${P}`} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ tipo, cantidad = 8 }: { tipo: "servicio" | "curso" | "producto"; cantidad?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: cantidad }).map((_, i) =>
        tipo === "servicio"
          ? <SkeletonServicioCard key={i} />
          : tipo === "producto"
          ? <SkeletonProductoCard key={i} />
          : <SkeletonCursoCard key={i} />
      )}
    </div>
  )
}

// ── Mis citas ─────────────────────────────────────────────────────────────────
export function SkeletonCitaCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className={`h-5 w-40 ${P}`} />
          <div className={`h-4 w-24 ${P}`} />
        </div>
        <div className={`h-6 w-24 ${P}`} />
      </div>
      <div className="flex gap-4">
        <div className={`h-4 w-28 ${P}`} />
        <div className={`h-4 w-16 ${P}`} />
      </div>
      <div className={`h-9 w-36 ${P}`} />
    </div>
  )
}

export function SkeletonMisCitas({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className={`h-8 w-8 ${B}`} />
          <div className={`h-8 w-48 ${P}`} />
        </div>
        {Array.from({ length: cantidad }).map((_, i) => (
          <SkeletonCitaCard key={i} />
        ))}
      </div>
    </div>
  )
}

// ── Mis pedidos ───────────────────────────────────────────────────────────────
export function SkeletonPedidoCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`h-5 w-32 ${P}`} />
        <div className={`h-6 w-20 ${P}`} />
      </div>
      <div className="flex gap-4">
        <div className={`h-4 w-24 ${P}`} />
        <div className={`h-4 w-20 ${P}`} />
      </div>
      <div className="flex gap-2 pt-1">
        <div className={`h-9 w-32 ${P}`} />
        <div className={`h-9 w-28 ${P}`} />
      </div>
    </div>
  )
}

export function SkeletonMisPedidos({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-4">
        <div className="flex items-center gap-3 mb-8">
          <div className={`h-8 w-8 ${B}`} />
          <div className={`h-8 w-44 ${P}`} />
        </div>
        {Array.from({ length: cantidad }).map((_, i) => (
          <SkeletonPedidoCard key={i} />
        ))}
      </div>
    </div>
  )
}

// ── Mis cursos (inscritos) ────────────────────────────────────────────────────
export function SkeletonMiCursoItem() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col sm:flex-row">
      <div className={`h-40 sm:h-auto sm:w-40 flex-shrink-0 ${B} rounded-none`} />
      <div className="p-5 flex-1 space-y-3">
        <div className={`h-5 w-3/4 ${P}`} />
        <div className={`h-4 w-1/2 ${P}`} />
        <div className={`h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full`} />
        <div className="flex gap-2 pt-1">
          <div className={`h-8 w-28 ${P}`} />
          <div className={`h-8 w-24 ${P}`} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonMisCursos({ cantidad = 3 }: { cantidad?: number }) {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-4">
        <div className="flex items-center gap-3 mb-8">
          <div className={`h-8 w-8 ${B}`} />
          <div className={`h-8 w-40 ${P}`} />
        </div>
        {Array.from({ length: cantidad }).map((_, i) => (
          <SkeletonMiCursoItem key={i} />
        ))}
      </div>
    </div>
  )
}

// ── Carrito ───────────────────────────────────────────────────────────────────
export function SkeletonCarritoItem() {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
      <div className={`w-20 h-20 flex-shrink-0 ${B}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-4 w-3/4 ${P}`} />
        <div className={`h-3 w-1/2 ${P}`} />
        <div className="flex items-center justify-between pt-2">
          <div className={`h-8 w-24 ${P}`} />
          <div className={`h-5 w-16 ${P}`} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCarrito() {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className={`h-8 w-32 ${P} mb-8`} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-1">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCarritoItem key={i} />)}
          </div>
          <div className="space-y-4">
            <div className={`h-6 w-32 ${P}`} />
            <div className={`h-4 w-full ${P}`} />
            <div className={`h-4 w-3/4 ${P}`} />
            <div className={`h-12 w-full ${P} mt-4`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Favoritos ─────────────────────────────────────────────────────────────────
export function SkeletonFavoritoCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className={`h-48 ${B} rounded-none`} />
      <div className="p-4 space-y-2">
        <div className={`h-4 w-3/4 ${P}`} />
        <div className={`h-3 w-1/2 ${P}`} />
        <div className={`h-8 w-full ${P} mt-2`} />
      </div>
    </div>
  )
}

export function SkeletonFavoritos() {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className={`h-8 w-40 ${P} mb-8`} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonFavoritoCard key={i} />)}
        </div>
      </div>
    </div>
  )
}

// ── Checkout ──────────────────────────────────────────────────────────────────
export function SkeletonCheckout() {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className={`h-8 w-48 ${P} mb-8`} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-3 space-y-5">
            <div className={`h-6 w-40 ${P}`} />
            <div className={`h-12 w-full ${B}`} />
            <div className="grid grid-cols-2 gap-4">
              <div className={`h-12 ${B}`} />
              <div className={`h-12 ${B}`} />
            </div>
            <div className={`h-12 w-full ${B}`} />
            <div className={`h-6 w-32 ${P} mt-4`} />
            {[1,2].map(i => (
              <div key={i} className={`h-14 w-full ${B}`} />
            ))}
          </div>
          {/* Resumen */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`h-6 w-32 ${P}`} />
            {[1,2].map(i => (
              <div key={i} className="flex gap-3">
                <div className={`w-16 h-16 flex-shrink-0 ${B}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-3/4 ${P}`} />
                  <div className={`h-3 w-1/2 ${P}`} />
                  <div className={`h-4 w-1/4 ${P}`} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div className={`h-4 w-full ${P}`} />
              <div className={`h-5 w-3/4 ${P}`} />
            </div>
            <div className={`h-12 w-full ${P}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Pedido detalle ────────────────────────────────────────────────────────────
export function SkeletonPedidoDetalle() {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-6">
        <div className={`h-8 w-56 ${P}`} />
        <div className={`h-6 w-32 ${P}`} />
        {/* Productos */}
        {[1,2].map(i => (
          <div key={i} className="flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className={`w-20 h-20 flex-shrink-0 ${B}`} />
            <div className="flex-1 space-y-2">
              <div className={`h-4 w-3/4 ${P}`} />
              <div className={`h-3 w-1/3 ${P}`} />
              <div className={`h-4 w-1/4 ${P}`} />
            </div>
          </div>
        ))}
        {/* Totales */}
        <div className="space-y-2 pt-2">
          <div className={`h-4 w-48 ${P}`} />
          <div className={`h-5 w-36 ${P}`} />
        </div>
        {/* Comprobante */}
        <div className={`h-24 w-full ${B}`} />
      </div>
    </div>
  )
}

// ── Perfil ────────────────────────────────────────────────────────────────────
export function SkeletonPerfil() {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-6">
          <div className={`w-24 h-24 rounded-full ${B}`} />
          <div className="space-y-3">
            <div className={`h-7 w-48 ${P}`} />
            <div className={`h-4 w-36 ${P}`} />
            <div className={`h-8 w-32 ${P}`} />
          </div>
        </div>
        {/* Secciones */}
        {[1,2,3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <div className={`h-5 w-40 ${P}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`h-12 ${B}`} />
              <div className={`h-12 ${B}`} />
            </div>
            <div className={`h-10 w-32 ${P}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mensajes / Notificaciones (cliente) ───────────────────────────────────────
export function SkeletonMensajeItem() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${B}`} />
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-3/4 ${P}`} />
          <div className={`h-3 w-1/2 ${P}`} />
          <div className={`h-3 w-1/4 ${P}`} />
        </div>
      </div>
    </div>
  )
}

export function SkeletonMensajes({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6 space-y-4">
        <div className="flex items-center gap-3 mb-8">
          <div className={`h-8 w-8 ${B}`} />
          <div className={`h-8 w-44 ${P}`} />
        </div>
        {Array.from({ length: cantidad }).map((_, i) => (
          <SkeletonMensajeItem key={i} />
        ))}
      </div>
    </div>
  )
}

// ── Admin: Filas de tabla ─────────────────────────────────────────────────────
export function SkeletonTablaFila({ columnas = 5 }: { columnas?: number }) {
  const anchos = ["w-32","w-40","w-24","w-20","w-28"]
  return (
    <tr>
      {Array.from({ length: columnas }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className={`h-4 ${anchos[i % anchos.length]} ${P}`} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTabla({ filas = 6, columnas = 5, headers }: { filas?: number; columnas?: number; headers?: string[] }) {
  const cols = headers?.length ?? columnas
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
        <thead className="bg-rose-900 dark:bg-rose-950">
          <tr>
            {(headers ?? Array.from({ length: cols }, (_, i) => String(i))).map((h, i) => (
              <th key={i} className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                {headers ? h : <div className={`h-3 w-20 bg-rose-700 rounded-full`} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: filas }).map((_, i) => (
            <SkeletonTablaFila key={i} columnas={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Admin: Lista de cards (pedidos, promociones, etc.) ────────────────────────
export function SkeletonAdminCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`h-5 w-36 ${P}`} />
        <div className={`h-6 w-20 ${P}`} />
      </div>
      <div className="flex gap-4">
        <div className={`h-4 w-28 ${P}`} />
        <div className={`h-4 w-20 ${P}`} />
      </div>
      <div className={`h-4 w-48 ${P}`} />
    </div>
  )
}

export function SkeletonAdminCardList({ cantidad = 5 }: { cantidad?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonAdminCard key={i} />
      ))}
    </div>
  )
}

// ── Admin: KPI cards ──────────────────────────────────────────────────────────
export function SkeletonKpiCard() {
  return (
    <div className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`h-4 w-28 bg-gray-300 dark:bg-gray-600 rounded-full`} />
        <div className={`w-9 h-9 bg-gray-300 dark:bg-gray-600 rounded-xl`} />
      </div>
      <div className={`h-10 w-20 bg-gray-300 dark:bg-gray-600 rounded-full`} />
    </div>
  )
}

export function SkeletonKpis({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonKpiCard key={i} />
      ))}
    </div>
  )
}

// ── Admin: Reportes ───────────────────────────────────────────────────────────
export function SkeletonReportes() {
  return (
    <div className="space-y-8 py-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <SkeletonKpiCard key={i} />)}
      </div>
      {/* Gráficas */}
      {[1,2].map(i => (
        <div key={i} className={`h-64 w-full ${B}`} />
      ))}
      {/* Listas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1,2].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 space-y-3">
            <div className={`h-5 w-40 ${P}`} />
            {[1,2,3].map(j => (
              <div key={j} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${B}`} />
                <div className="flex-1 space-y-1">
                  <div className={`h-4 w-3/4 ${P}`} />
                  <div className={`h-3 w-1/2 ${P}`} />
                </div>
                <div className={`h-5 w-16 ${P}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Admin: Horarios ───────────────────────────────────────────────────────────
export function SkeletonHorarios() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex gap-2">
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className={`h-9 w-24 ${P}`} />
        ))}
      </div>
      <div className="space-y-3">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-5 w-16 ${P}`} />
              <div className={`h-4 w-24 ${P}`} />
            </div>
            <div className={`h-7 w-20 ${P}`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Admin/Empleado: Notificaciones ────────────────────────────────────────────
export function SkeletonNotificacionItem() {
  return (
    <div className="border-l-4 border-gray-200 dark:border-gray-700 animate-pulse rounded-xl p-4 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className={`h-4 w-3/4 ${P}`} />
          <div className={`h-3 w-1/2 ${P}`} />
          <div className={`h-3 w-1/3 ${P}`} />
        </div>
        <div className={`h-6 w-20 ${P}`} />
      </div>
    </div>
  )
}

export function SkeletonNotificaciones({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: cantidad }).map((_, i) => (
        <SkeletonNotificacionItem key={i} />
      ))}
    </div>
  )
}

// ── Admin: Dashboard KPI inline (reemplaza "...") ────────────────────────────
export function SkeletonKpiValor() {
  return <div className="h-10 w-16 bg-white/30 animate-pulse rounded-xl inline-block" />
}
