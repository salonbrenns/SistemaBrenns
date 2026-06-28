'use client'
// src/app/(frontend)/nosotros/page.tsx

import Link from "next/link"
import { MapPin, Clock, Users, Award, Heart, ChevronRight, ArrowLeft, Sparkles } from "lucide-react"
import { useSiteConfig } from "@/hooks/useSiteConfig"

const iconosValores = [Users, Award, Heart, Sparkles]

const pilares = [
  {
    titulo: "Academia",
    desc: "Cursos y talleres presenciales de alta calidad para estilistas de todos los niveles. Formamos profesionales que transforman su pasión por la belleza en un negocio rentable.",
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18 9.246 18 10.832 18.477 12 19.253zm0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18 14.754 18 13.168 18.477 12 19.253z"
      />
    ),
  },
  {
    titulo: "Distribuidora",
    desc: "Insumos profesionales de la más alta calidad a precios accesibles. Solo vendemos productos que nosotros mismos utilizamos en nuestro salón.",
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    ),
  },
  {
    titulo: "Salón de Belleza",
    desc: "Servicios premium de uñas, cabello, manicura, pedicura y bienestar. Un espacio elegante donde cada clienta vive una experiencia única y relajante.",
    svg: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2"
      />
    ),
  },
]

const secciones = [
  { id: "mision-vision", label: "Misión y Visión" },
  { id: "valores",       label: "Nuestros Valores" },
  { id: "pilares",       label: "Tres Pilares" },
  { id: "ubicacion",     label: "Ubicación" },
]

export default function NosotrosPage() {
  const config = useSiteConfig()

  const valores = config.nosotros_valores
    .split(",")
    .map((v: string) => v.trim())
    .filter(Boolean)

  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-gray-950 scroll-smooth">

      {/* ── HEADER ── */}
      <div className="relative bg-gradient-to-r from-gray-900 via-pink-900 to-pink-800 py-10 px-6 overflow-hidden border-b border-white/10">
        <div className="relative max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Regresar al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit">
                <Heart className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">
                  {config.eslogan}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {config.nosotros_titulo}
              </h1>
            </div>

            <div className="flex items-center gap-4 bg-black/20 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="text-left">
                <p className="text-pink-100 text-[10px] font-medium leading-none mb-1 max-w-[220px]">
                  {config.nosotros_descripcion}
                </p>
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Nuestra esencia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* ── SIDEBAR STICKY ── */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-12 space-y-8">

              {/* Índice */}
              <div className="bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">
                  Conoce Brenn&apos;s
                </p>
                <nav className="flex flex-col gap-1">
                  {secciones.map((s, i) => (
                    <a
                      key={i}
                      href={`#${s.id}`}
                      className="group flex items-center justify-between text-sm text-gray-400 dark:text-gray-300 hover:text-pink-400 py-3 transition-all border-b border-gray-50 dark:border-gray-700 last:border-0"
                    >
                      <span className="flex items-center gap-4">
                        <span className="text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                          {(i + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-pink-700">{s.label}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-pink-500" />
                    </a>
                  ))}
                </nav>
              </div>

              {/* Contacto rápido */}
              <div className="bg-pink-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <Heart className="w-10 h-10 mb-6 text-pink-400" />
                  <h3 className="text-xl font-bold mb-3">¿Hablamos?</h3>
                  <p className="text-xs text-pink-200/70 mb-8 leading-relaxed">
                    Escríbenos por WhatsApp o visítanos en el salón. Con gusto te atendemos.
                  </p>
                  {config.red_whatsapp && (
                    <a
                      href={config.red_whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-pink-500 hover:bg-pink-400 text-white py-4 rounded-2xl text-[10px] font-black transition-all tracking-widest uppercase"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Escribir a WhatsApp
                    </a>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-800 rounded-full -mb-10 -mr-10 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              </div>
            </div>
          </aside>

          {/* ── SECCIONES ── */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-10">

            {/* 01 — Misión + Visión */}
            <section id="mision-vision" className="scroll-mt-12 rounded-[3rem] border bg-white dark:bg-gray-800 border-pink-50 dark:border-gray-700 shadow-sm">
              <div className="p-10 md:p-14">
                <span className="text-pink-500 text-xs font-black uppercase tracking-widest mb-2 block">Sección 01</span>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-10">Misión y Visión</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Misión */}
                  <div className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FF5BA8] rounded-xl flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-black text-gray-800 dark:text-white text-lg">Misión</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                      {config.nosotros_mision}
                    </p>
                  </div>

                  {/* Visión */}
                  <div className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-8 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#FF5BA8]" />
                      </div>
                      <span className="font-black text-gray-800 dark:text-white text-lg">Visión</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-[15px]">
                      {config.nosotros_vision}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 02 — Valores */}
            {valores.length > 0 && (
              <section id="valores" className="scroll-mt-12 rounded-[3rem] border bg-white dark:bg-gray-800 border-pink-50 dark:border-gray-700 shadow-sm">
                <div className="p-10 md:p-14">
                  <span className="text-pink-500 text-xs font-black uppercase tracking-widest mb-2 block">Sección 02</span>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-10">Nuestros Valores</h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {valores.map((v: string, i: number) => {
                      const Icon = iconosValores[i % iconosValores.length]
                      return (
                        <div
                          key={i}
                          className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-6 flex items-center gap-4 group"
                        >
                          <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center group-hover:bg-[#FF5BA8] transition-colors flex-shrink-0">
                            <Icon className="w-5 h-5 text-[#FF5BA8] group-hover:text-white transition-colors" />
                          </div>
                          <span className="font-bold text-gray-700 dark:text-gray-300 text-[15px]">{v}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 03 — Tres Pilares */}
            <section id="pilares" className="scroll-mt-12 rounded-[3rem] border bg-white dark:bg-gray-800 border-pink-50 dark:border-gray-700 shadow-sm">
              <div className="p-10 md:p-14">
                <span className="text-pink-500 text-xs font-black uppercase tracking-widest mb-2 block">Sección 03</span>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-4">Tres pilares, una pasión</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-[15px]">Todo lo que hacemos gira en torno a tres ejes fundamentales.</p>

                <div className="grid md:grid-cols-3 gap-6">
                  {pilares.map((p, i) => (
                    <div
                      key={i}
                      className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-8 flex flex-col gap-5 group"
                    >
                      <div className="w-12 h-12 bg-[#FF5BA8] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          {p.svg}
                        </svg>
                      </div>
                      <div>
                        <p className="font-black text-gray-800 dark:text-white text-lg mb-2">{p.titulo}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 04 — Ubicación */}
            <section id="ubicacion" className="scroll-mt-12 rounded-[3rem] border bg-white dark:bg-gray-800 border-pink-50 dark:border-gray-700 shadow-sm">
              <div className="p-10 md:p-14">
                <span className="text-pink-500 text-xs font-black uppercase tracking-widest mb-2 block">Sección 04</span>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-10">Encuéntranos</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {/* Dirección */}
                  <div className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#FF5BA8]" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 dark:text-white text-sm uppercase tracking-widest mb-1">Dirección</p>
                      <p className="text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed">
                        {config.ubicacion_calle}<br />
                        ({config.ubicacion_detalle})<br />
                        <span className="font-bold">{config.ubicacion_ciudad}</span>
                      </p>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="bg-pink-50/50 dark:bg-gray-800/60 rounded-2xl border border-pink-100/50 dark:border-gray-700 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#FF5BA8]" />
                    </div>
                    <div>
                      <p className="font-black text-gray-800 dark:text-white text-sm uppercase tracking-widest mb-1">Horarios</p>
                      <p className="text-gray-600 dark:text-gray-400 text-[14px] leading-relaxed">
                        {config.horario_semana}<br />
                        {config.horario_sabado}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mapa */}
                <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 h-[380px]">
                  <iframe
                    src={config.mapa_url}
                    className="w-full h-full border-none"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </section>


          </div>
        </div>
      </div>
    </main>
  )
}