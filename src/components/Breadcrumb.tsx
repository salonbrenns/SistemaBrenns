import Link from "next/link"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

type BreadcrumbItem = {
  label: string
  href: string
  active?: boolean
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-4 mb-8">
      {/* Botón Volver */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold transition p-2 -ml-2"
        aria-label="Volver a la página anterior"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Volver</span>
      </button>

      {/* Separador */}
      <div className="text-gray-300">|</div>

      {/* Breadcrumb de navegación */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.active ? (
              <span className="text-gray-700 font-medium">{item.label}</span>
            ) : (
              <Link href={item.href} className="text-pink-600 hover:text-pink-700 font-medium transition">
                {item.label}
              </Link>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
