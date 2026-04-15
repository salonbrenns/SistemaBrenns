"use client"
// src/components/ui/Hero.tsx

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
// Tipo del slide — mismo que en la página de configuración
type HeroSlide = {
  imagen:       string
  etiqueta:     string
  titulo:       string
  tituloAcento: string
  descripcion:  string
  ctaLabel:     string
  ctaHref:      string
}

// Slides por defecto (se usan mientras carga la config o si no hay datos en BD)
const SLIDES_DEFAULT: HeroSlide[] = [
  {
    imagen:       "/hero/salon.jpg",
    etiqueta:     "Salón de Belleza",
    titulo:       "Tu Belleza,",
    tituloAcento: "Nuestra Pasión",
    descripcion:  "Uñas, cabello, manicura y pedicura en un espacio diseñado para que te sientas especial.",
    ctaLabel:     "Agendar cita",
    ctaHref:      "/servicios",
  },
  {
    imagen:       "/hero/academia.jpg",
    etiqueta:     "Academia Brenn's",
    titulo:       "Aprende el Arte",
    tituloAcento: "de las Uñas",
    descripcion:  "Cursos presenciales para estilistas de todos los niveles. Conviértete en profesional.",
    ctaLabel:     "Ver cursos",
    ctaHref:      "/cursos",
  },
  {
    imagen:       "/hero/distribuidora.jpg",
    etiqueta:     "Distribuidora",
    titulo:       "Insumos",
    tituloAcento: "Profesionales",
    descripcion:  "Las mejores marcas del mercado al alcance de tu mano. Productos que usamos nosotras mismas.",
    ctaLabel:     "Ir a la tienda",
    ctaHref:      "/catalogo",
  },
]

const ACENTO = "#FF5BA8"

const OVERLAYS = [
  "from-pink-950/80 via-pink-900/60 to-transparent",
  "from-rose-950/85 via-rose-900/60 to-transparent",
  "from-gray-950/85 via-pink-950/50 to-transparent",
]

export default function Hero() {
  const [slides, setSlides]     = useState<HeroSlide[]>(SLIDES_DEFAULT)
  const [current, setCurrent]   = useState(0)
  const [animating, setAnimating] = useState(false)

  // Cargar slides desde la config de BD
 useEffect(() => {
  fetch("/api/config-sitio")
    .then(r => r.json())
    .then(data => {
      let heroSlides = data?.hero_slides
      if (typeof heroSlides === "string") {
        try { heroSlides = JSON.parse(heroSlides) } catch {}
      }
      if (Array.isArray(heroSlides) && heroSlides.length > 0) {
        setSlides(heroSlides)
      }
    })
    .catch(() => {})
}, [])

  const goTo = useCallback(
    (index: number) => {
      if (animating) return
      setAnimating(true)
      setTimeout(() => {
        setCurrent(index)
        setAnimating(false)
      }, 400)
    },
    [animating]
  )

  const prev = () => goTo((current - 1 + slides.length) % slides.length)
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length])

  // Autoplay cada 5s
  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  const slide   = slides[current]
  const overlay = OVERLAYS[current % OVERLAYS.length]

  return (
    <section className="relative w-full h-[70vh] min-h-[480px] max-h-[640px] overflow-hidden bg-gray-950">

      {/* Fondo con imagen + overlay */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${animating ? "opacity-0" : "opacity-100"}`}>
        <Image
  src={slide.imagen}
  alt=""
  fill
  priority
  className="object-cover object-center"
  sizes="100vw"
/>
        <div className={`absolute inset-0 bg-gradient-to-r ${overlay}`} />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Contenido */}
      <div className={`relative z-10 h-full flex items-center transition-all duration-500 ${
        animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-2xl">

            {/* Etiqueta */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="w-8 h-px" style={{ background: ACENTO }} />
              <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: ACENTO }}>
                {slide.etiqueta}
              </span>
            </div>

            {/* Título */}
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-5"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {slide.titulo}{" "}
              <span style={{ color: ACENTO }}>{slide.tituloAcento}</span>
            </h1>

            {/* Descripción */}
            <p className="text-white/75 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              {slide.descripcion}
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
                style={{ background: ACENTO }}
              >
                {slide.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Flecha derecha */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className="transition-all duration-300">
            <span className={`block rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2 bg-[#FF5BA8]"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`} />
          </button>
        ))}
      </div>

      {/* Contador */}
      <div className="absolute bottom-8 right-8 z-20 hidden sm:flex items-center gap-3">
        <span className="text-white/40 text-xs font-mono">
          {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>

    </section>
  )
}