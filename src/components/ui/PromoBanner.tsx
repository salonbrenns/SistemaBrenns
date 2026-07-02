"use client"

import { Tag, Sparkles, Gift } from "lucide-react"
import { useEffect, useState } from "react"

interface Promocion {
  id: number
  nombre: string
  tipo: string
  descuento: number
  codigo: string | null
}

const ICONO = {
  SERVICIO: <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />,
  PRODUCTO: <Tag className="w-3.5 h-3.5 flex-shrink-0" />,
  CODIGO:   <Gift className="w-3.5 h-3.5 flex-shrink-0" />,
}

function textoPromo(p: Promocion) {
  if (p.tipo === "CODIGO")
    return `${p.descuento}% de descuento con código ${p.codigo}`
  if (p.tipo === "PRODUCTO")
    return `${p.descuento}% de descuento en productos — ${p.nombre}`
  return `${p.descuento}% de descuento en servicios — ${p.nombre}`
}

// Mensajes estáticos de respaldo
const FALLBACK = [
  { id: -1, label: "Envío gratis en compras mayores a $150",     icono: <Tag className="w-3.5 h-3.5" /> },
  { id: -2, label: "Nuevos cursos disponibles — ¡Inscríbete!",   icono: <Sparkles className="w-3.5 h-3.5" /> },
]

export default function PromoBanner() {
  const [promos, setPromos] = useState<Promocion[]>([])

  useEffect(() => {
    fetch("/api/promociones")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPromos(data) })
      .catch(() => {})
  }, [])

  // Combina promociones reales + fallback
  const items = [
    ...promos.map(p => ({
      id: p.id,
      label: textoPromo(p),
      icono: ICONO[p.tipo as keyof typeof ICONO] ?? <Tag className="w-3.5 h-3.5" />,
    })),
    ...FALLBACK,
  ]

  // Triplicar para el marquee continuo
  const repetidos = [...items, ...items, ...items]

  return (
    <div className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-pink-500 text-white py-2.5 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap inline-block">
        {repetidos.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide mx-8">
            {item.icono}
            {item.label}
            <span className="mx-4 opacity-40">•</span>
          </span>
        ))}
      </div>
      <style>{`
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}