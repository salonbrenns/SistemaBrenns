// src/components/ui/PageLoader.tsx
// Spinner centralizado para estados de carga a nivel de página
import { Loader2 } from "lucide-react"

interface PageLoaderProps {
  /** Texto debajo del spinner. Default: "Cargando..." */
  text?: string
  /** Clases extra para el contenedor. Default aplica min-h-[40vh] */
  className?: string
}

export default function PageLoader({ text = "Cargando...", className }: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className ?? "min-h-[40vh]"}`}>
      <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
      <p className="text-sm text-gray-400 dark:text-gray-500">{text}</p>
    </div>
  )
}
