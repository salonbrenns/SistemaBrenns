"use client"
// src/app/(frontend)/politicas/page.tsx

import Link from "next/link"
import { ShieldCheck, RefreshCcw, ArrowLeft, Package, Clock, ChevronRight, Mail, AlertCircle } from "lucide-react"
import { useSiteConfig } from "@/hooks/useSiteConfig"

const secciones = [
  {
    id: "privacidad",
    titulo: "Privacidad de datos",
    icon: ShieldCheck,
    color: "text-pink-600",
    bg: "bg-pink-100",
    subtitulo: "Conforme a la LFPDPPP",
    contenido: [
      "Brenn's trata sus datos personales con estricta confidencialidad, apegándose a los principios de licitud, consentimiento e información.",
      "Sus datos son utilizados exclusivamente para la gestión de citas, administración de cursos, procesamiento de pedidos y comunicación esencial.",
      "No compartimos su información con terceros, salvo con pasarelas de pago y proveedores tecnológicos necesarios para operar.",
      "Nunca almacenamos datos financieros completos como números de tarjeta o CVV."
    ],
    footerLink: { text: "Leer Aviso de Privacidad completo", href: "/aviso-privacidad" }
  },
  {
    id: "devoluciones",
    titulo: "Devoluciones y cambios",
    icon: RefreshCcw,
    color: "text-amber-600",
    bg: "bg-amber-100",
    destacado: true,
    contenido: [
      "Brenn's no acepta devoluciones, cambios ni reembolsos por simple retracto o cambio de opinión una vez que el servicio ha sido consumado.",
      "La única excepción es la Garantía Legal por defectos de fabricación o vicios ocultos.",
      "Brenn's determinará si aplica reparación, reemplazo o reembolso conforme a la Ley Federal de Protección al Consumidor (LFPC).",
      "Si recibió un producto dañado, notifique inmediatamente a nuestro correo oficial."
    ]
  },
  {
    id: "cancelaciones",
    titulo: "Política de cancelaciones",
    icon: Clock,
    color: "text-rose-600",
    bg: "bg-rose-100",
    contenido: [
      "Las cancelaciones de citas son procedentes únicamente si se realizan con un mínimo de 24 horas de antelación.",
      "En caso de cancelación fuera del plazo o inasistencia, el anticipo pagado no será reembolsable.",
      "Para cancelaciones de cursos, aplican las condiciones específicas informadas al momento de la inscripción."
    ]
  },
  {
    id: "envios",
    titulo: "Política de envíos",
    icon: Package,
    color: "text-blue-500",
    bg: "bg-blue-50",
    contenido: [
      "El proceso de compra incluye: selección, cálculo de envío y confirmación final de la transacción.",
      "El tiempo estimado de entrega será informado al cliente al momento de confirmar la compra.",
      "Los precios exhibidos son finales e incluyen los impuestos aplicables (IVA).",
      "En caso de pedidos no entregados, el cliente debe reportarlo a soporte técnico."
    ]
  }
]

export default function PoliticasPage() {
  const config = useSiteConfig()

  const version     = config.legal_politicas_version || "1.0"
  const fechaUpdate = config.legal_politicas_fecha   || "26 de septiembre de 2025"

  return (
    <main className="min-h-screen bg-[#fffafa] scroll-smooth">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-pink-900 via-pink-800 to-rose-700 py-10 px-6 overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Regresar al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">Normativa Legal</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                Nuestras <span className="text-pink-300">Políticas</span>
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
                <p className="text-pink-400 text-[8px] font-black uppercase tracking-widest">Última actualización</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* SIDEBAR */}
          <aside className="lg:w-1/4">
            <div className="sticky top-12 space-y-8">
              <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Categorías</p>
                <nav className="flex flex-col gap-2">
                  {secciones.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="group flex items-center justify-between text-sm text-gray-500 hover:text-pink-700 py-3 transition-all border-b border-gray-50 last:border-0"
                    >
                      <span className="font-bold">{s.titulo}</span>
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-pink-500" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-pink-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                <Mail className="w-8 h-8 mb-4 text-pink-400" />
                <h3 className="text-lg font-bold mb-2">¿Necesitas ayuda?</h3>
                <p className="text-xs text-gray-400 mb-6 leading-relaxed">Para cualquier aclaración sobre reembolsos o envíos, contáctanos.</p>
                <a href="mailto:salonbrennsdudas@gmail.com" className="block w-full text-center bg-white text-gray-900 py-3 rounded-2xl text-[10px] font-black hover:bg-pink-100 transition-colors uppercase tracking-widest">
                  Escribir a Soporte
                </a>
              </div>
            </div>
          </aside>

          {/* CUERPO */}
          <div className="lg:w-3/4 space-y-10">
            {secciones.map((s) => {
              const Icon = s.icon
              return (
                <section
                  key={s.id}
                  id={s.id}
                  className={`scroll-mt-12 rounded-[3rem] border shadow-sm transition-all duration-500 hover:shadow-md overflow-hidden ${
                    s.destacado ? "bg-amber-50/50 border-amber-200" : "bg-white border-pink-50"
                  }`}
                >
                  <div className="p-10 md:p-14">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
                      <div className={`w-16 h-16 ${s.bg} rounded-2xl flex items-center justify-center shadow-inner`}>
                        <Icon className={`w-8 h-8 ${s.color}`} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{s.titulo}</h2>
                        {s.subtitulo && <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">{s.subtitulo}</p>}
                        {s.destacado && (
                          <div className="inline-flex items-center gap-1.5 bg-amber-200 text-amber-800 text-[10px] font-black px-3 py-1 rounded-full mt-2">
                            <AlertCircle className="w-3 h-3" /> ATENCIÓN AL CLIENTE
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      {s.contenido.map((parrafo, idx) => (
                        <div key={idx} className="flex gap-4">
                          <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${s.color} bg-current opacity-40`} />
                          <p className="text-gray-600 text-sm leading-relaxed">{parrafo}</p>
                        </div>
                      ))}
                    </div>

                    {s.footerLink && (
                      <div className="mt-10 pt-8 border-t border-pink-50">
                        <Link href={s.footerLink.href} className="text-xs font-black text-pink-600 hover:text-pink-800 flex items-center gap-2 group">
                          {s.footerLink.text}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              )
            })}

          
          </div>
        </div>
      </div>
    </main>
  )
}