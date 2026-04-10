"use client"
import { Tag, Sparkles } from "lucide-react"

export default function PromoBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-rose-600 via-pink-600 to-pink-500 text-white py-2.5 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[1, 2, 3].map(i => (
          <span key={i} className="inline-flex items-center gap-10 mx-6">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              20% de descuento en Material de Uñas
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              Nuevos cursos disponibles — ¡Inscríbete ahora!
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide">
              <Tag className="w-3.5 h-3.5 flex-shrink-0" />
              Envío gratis en compras mayores a $150
            </span>
          </span>
        ))}
      </div>
      <style>{`
        .animate-marquee {
          display: inline-block;
          animation: marquee 28s linear infinite;
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}