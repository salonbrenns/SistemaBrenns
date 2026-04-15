"use client"
// src/app/(frontend)/terminos/page.tsx

import Link from "next/link"
import { ScrollText, ArrowLeft, ChevronRight, AlertTriangle, Scale, Mail } from "lucide-react"
import { useSiteConfig } from "@/hooks/useSiteConfig"

const secciones = [
  {
    titulo: "Información general",
    contenido: `Se establecen los Términos y Condiciones ("T&C") que rigen el acceso y uso de la plataforma digital "Sistema Integral Multiplataforma Salón Brenn's". La Plataforma es propiedad y está operada por Distribuidora, Academia y Salón Brenn's.`,
    detalles: [
      "Giro: Salón de Belleza, Distribución y Academia",
      "Ubicación: Huejutla de Reyes, Hidalgo, México",
      "Contacto: salonbrennsdudas@gmail.com"
    ]
  },
  {
    titulo: "Aceptación de términos",
    contenido: `La utilización de cualquier servicio (citas, cursos o compra) implica la aceptación plena y sin reservas de estos T&C mediante el proceso de registro o transacción.`,
  },
  {
    titulo: "Proceso de compra y precios",
    contenido: `La Plataforma permite agendar servicios y puede requerir un anticipo. El precio exhibido es final e incluye impuestos (IVA).`,
    puntos: [
      "Anticipos requeridos para citas",
      "Pagos seguros con tarjeta",
      "Inscripción a cursos sujeta a cupo"
    ]
  },
  {
    titulo: "Envíos",
    contenido: `El proceso incluye selección, cálculo de costos y confirmación. Los tiempos de entrega se informan al momento de la compra.`,
  },
  {
    titulo: "Política de devoluciones",
    contenido: `La Empresa no acepta devoluciones, cambios ni reembolsos por retracto o cambio de opinión una vez consumado el servicio o entrega.`,
    destacado: true,
  },
  {
    titulo: "Cancelaciones",
    contenido: `Las cancelaciones son procedentes con un mínimo de 24 horas. Fuera de ese plazo, el anticipo no es reembolsable.`,
  },
  {
    titulo: "Garantías",
    contenido: `Se ofrece Garantía Legal por defectos de fabricación. Salón Brenn's determinará la reparación o reembolso según la LFPC.`,
  },
  {
    titulo: "Marco legal",
    contenido: `Estos T&C se rigen por la legislación mexicana y la Ley Federal de Protección al Consumidor (PROFECO).`,
  },
  {
    titulo: "Modificaciones",
    contenido: `Salón Brenn's podrá modificar estos T&C informando con 10 días de anticipación en La Plataforma.`,
  },
]

export default function TerminosPage() {
  const config = useSiteConfig()

  // Fallback a los valores hardcodeados mientras carga el config
  const version      = config.legal_terminos_version || "1.0"
  const fechaUpdate  = config.legal_terminos_fecha   || "26 de septiembre de 2025"

  return (
    <main className="min-h-screen bg-[#fffafa] scroll-smooth">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-gray-900 via-pink-900 to-pink-800 py-10 px-6 overflow-hidden border-b border-white/10">
        <div className="relative max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Regresar al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit">
                <ScrollText className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">Contrato de Usuario</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                Términos y <span className="text-pink-300">Condiciones</span>
              </h1>
            </div>

            {/* Versión y fecha — dinámicas desde admin */}
            <div className="flex items-center gap-4 bg-black/20 px-5 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="text-right border-r border-white/10 pr-4">
                <p className="text-white font-bold text-sm leading-none mb-1">v.{version}</p>
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Versión</p>
              </div>
              <div className="text-left">
                <p className="text-pink-100 text-[10px] font-medium leading-none mb-1">{fechaUpdate}</p>
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Actualización</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT — sin cambios */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* SIDEBAR */}
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="sticky top-12 space-y-8">
              <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Índice del Acuerdo</p>
                <nav className="flex flex-col gap-1">
                  {secciones.map((s, i) => (
                    <a
                      key={i}
                      href={`#seccion-tc-${i}`}
                      className="group flex items-center justify-between text-sm text-gray-400 hover:text-pink-700 py-3 transition-all border-b border-gray-50 last:border-0"
                    >
                      <span className="flex items-center gap-4">
                        <span className="text-[10px] font-bold opacity-30 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, "0")}</span>
                        <span className="font-bold text-gray-600 group-hover:text-pink-700">{s.titulo}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-pink-500" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-pink-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <Scale className="w-10 h-10 mb-6 text-pink-400" />
                  <h3 className="text-xl font-bold mb-3">¿Dudas Legales?</h3>
                  <p className="text-xs text-pink-200/70 mb-8 leading-relaxed">Nuestro equipo administrativo está disponible para aclarar cualquier punto de este contrato.</p>
                  <a href="mailto:salonbrennsdudas@gmail.com" className="flex items-center justify-center gap-2 w-full bg-pink-500 hover:bg-pink-400 text-white py-4 rounded-2xl text-[10px] font-black transition-all tracking-widest uppercase">
                    <Mail className="w-4 h-4" /> Escribir Correo
                  </a>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-800 rounded-full -mb-10 -mr-10 opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
              </div>
            </div>
          </aside>

          {/* SECCIONES */}
          <div className="lg:w-2/3 xl:w-3/4 space-y-10">
            {secciones.map((s, i) => (
              <section
                key={i}
                id={`seccion-tc-${i}`}
                className={`scroll-mt-12 rounded-[3rem] border transition-all duration-500 ${
                  s.destacado
                    ? "bg-amber-50/50 border-amber-200 shadow-amber-100/20 shadow-xl"
                    : "bg-white border-pink-50 shadow-sm"
                }`}
              >
                <div className="p-10 md:p-14">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <span className="text-pink-500 text-xs font-black uppercase tracking-widest mb-2 block">Sección {(i + 1).toString().padStart(2, "0")}</span>
                      <h2 className="text-3xl font-black text-gray-900 leading-none">{s.titulo}</h2>
                    </div>
                    {s.destacado && (
                      <div className="bg-amber-500 text-white p-3 rounded-2xl shadow-lg shadow-amber-500/20 animate-bounce">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 text-lg leading-relaxed mb-8">{s.contenido}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {s.detalles && (
                      <div className="col-span-full bg-white border border-pink-100 rounded-3xl p-8 space-y-3">
                        {s.detalles.map((d, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-gray-500">
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                            {d}
                          </div>
                        ))}
                      </div>
                    )}
                    {s.puntos && s.puntos.map((p, idx) => (
                      <div key={idx} className="bg-pink-50/50 rounded-2xl p-6 border border-pink-100/50 flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-pink-600 font-black group-hover:bg-pink-600 group-hover:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{p}</span>
                      </div>
                    ))}
                  </div>

                  {s.destacado && (
                    <div className="mt-8 bg-amber-100/50 border-l-4 border-amber-500 p-6 rounded-r-[2rem]">
                      <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">Cláusula de No Reembolso</p>
                      <p className="text-sm text-amber-900/70 italic leading-relaxed">
                        Es responsabilidad del cliente revisar los productos y detalles del servicio antes de finalizar la transacción.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}

            
          </div>
        </div>
      </div>
    </main>
  )
}