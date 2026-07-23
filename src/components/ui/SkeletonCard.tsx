// src/components/ui/SkeletonCard.tsx
// Skeleton que imita la forma de ServicioCard / CursoCard mientras cargan los datos

export function SkeletonServicioCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-rose-50 dark:border-gray-700 overflow-hidden">
      {/* Imagen */}
      <div className="h-60 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      {/* Contenido */}
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse mt-4" />
      </div>
    </div>
  )
}

export function SkeletonCursoCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-pink-50 dark:border-gray-700 overflow-hidden">
      {/* Imagen */}
      <div className="h-52 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      {/* Contenido */}
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
        <div className="h-5 w-4/5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonGrid({ tipo, cantidad = 8 }: { tipo: "servicio" | "curso"; cantidad?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: cantidad }).map((_, i) =>
        tipo === "servicio"
          ? <SkeletonServicioCard key={i} />
          : <SkeletonCursoCard key={i} />
      )}
    </div>
  )
}
