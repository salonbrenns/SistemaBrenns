"use client"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Calendar, BookOpen } from "lucide-react"

interface BotonAccionProps {
  tipo: "agendar" | "inscribirse"
  href: string
  textoLogueado: string
  textoNoLogueado: string
}

export default function BotonAccion({ tipo, href, textoLogueado, textoNoLogueado }: BotonAccionProps) {
  const { data: session, status } = useSession()

  if (status === "loading") return (
    <div className="w-full h-16 bg-pink-100 rounded-full animate-pulse" />
  )

  const Icon = tipo === "agendar" ? Calendar : BookOpen

  if (session) {
    return (
      <Link href={href} className="block">
        <button className="w-full h-16 text-xl font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-full shadow-2xl transition-all flex items-center justify-center gap-4">
          <Icon className="w-6 h-6" />
          {textoLogueado}
        </button>
      </Link>
    )
  }

  return (
    <Link href={`/login?next=${encodeURIComponent(href)}`} className="block">
      <button className="w-full h-16 text-xl font-bold text-white bg-gray-700 hover:bg-gray-800 rounded-full shadow-2xl transition-all flex items-center justify-center gap-4">
        <Icon className="w-6 h-6" />
        {textoNoLogueado}
      </button>
    </Link>
  )
}