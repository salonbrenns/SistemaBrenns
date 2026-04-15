"use client"
// src/app/(frontend)/aviso-privacidad/page.tsx

import Link from "next/link"
import { ShieldCheck, ArrowLeft, ChevronRight, Mail } from "lucide-react"
import { useSiteConfig } from "@/hooks/useSiteConfig"

const secciones = [
  {
    numero: "1",
    titulo: "Identidad y domicilio del responsable",
    contenido: `Academia, Distribuidora y Salón Brenn's ("Brenn's"), con domicilio en calle Juan Mogica Ugalde, colonia Capitán Antonio Reyes, municipio Huejutla de Reyes, Hgo., C.P. 43000, en la entidad de Hidalgo, México, y portal de internet: salonbrenns11@gmail.com, es el responsable del tratamiento y protección de sus datos personales.

Brenn's se compromete a cumplir con los principios de Licitud, Consentimiento, Información, Calidad, Finalidad, Lealtad, Proporcionalidad y Responsabilidad establecidos en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.`,
  },
  {
    numero: "2",
    titulo: "Datos personales recabados",
    listas: [
      {
        subtitulo: "Datos de Identificación y Contacto",
        items: ["Nombre completo", "Domicilio", "Teléfono celular", "Correo electrónico"],
      },
      {
        subtitulo: "Datos Académicos y de Servicios",
        items: [
          "Historial de citas agendadas",
          "Servicios contratados",
          "Historial de compras",
          "Cursos inscritos",
          "Progreso académico",
        ],
      },
      {
        subtitulo: "Transacciones y Financieros",
        items: [
          "Últimos 4 dígitos de tarjeta",
          "Referencias de pago",
          "Brenn's NO almacena CVV ni números completos.",
        ],
      },
    ],
  },
  {
    numero: "3",
    titulo: "Finalidades del tratamiento",
    subsecciones: [
      {
        letra: "A",
        subtitulo: "Finalidades Primarias",
        intro: "Sus datos personales son necesarios para:",
        items: [
          "Gestión de Citas y Salón",
          "Administración de Cursos y Certificaciones",
          "Procesamiento de Pedidos E-commerce",
          "Atención al Cliente Personalizada",
          "Notificaciones Críticas del Servicio",
        ],
      },
      {
        letra: "B",
        subtitulo: "Finalidades Secundarias",
        intro: "Adicionalmente, utilizaremos su información para:",
        items: [
          "Promociones, Ofertas y Marketing",
          "Estudios de mercado y calidad",
        ],
        nota: "Si no desea que sus datos se usen para fines secundarios, envíe un correo a salonbrennsdudas@gmail.com. Esto no afectará su acceso a los servicios principales.",
      },
    ],
  },
  {
    numero: "4",
    titulo: "Transferencias de datos",
    contenido: `Sus datos podrán ser transferidos sin requerir consentimiento en los siguientes casos:

• Pasarelas de Pago: Para la validación de transacciones.
• Proveedores Cloud: Para almacenamiento seguro y soporte técnico.

Cualquier otra transferencia requerirá su autorización expresa.`,
  },
  {
    numero: "5",
    titulo: "Derechos ARCO",
    contenido: `Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse (Derechos ARCO) al tratamiento de su información.`,
    subsecciones: [
      {
        subtitulo: "Procedimiento de Solicitud",
        intro: "Envíe un correo a salonbrennsdudas@gmail.com con:",
        items: [
          "Nombre y correo electrónico",
          "Derecho que desea ejercer",
          "Identificación oficial adjunta",
        ],
        nota: "Plazo de respuesta: 20 días hábiles. La entrega de información será vía PDF.",
      },
    ],
  },
  {
    numero: "6",
    titulo: "Uso de Cookies",
    contenido: `Utilizamos cookies para mejorar su experiencia, recordar sus preferencias y analizar el tráfico.

Puede gestionar o desactivar las cookies directamente en la configuración de su navegador. Tenga en cuenta que esto podría limitar algunas funciones del sitio.`,
  },
  {
    numero: "7",
    titulo: "Limitación y Quejas",
    contenido: `Si considera vulnerado su derecho, puede acudir al INAI (www.inai.org.mx).

También puede inscribirse al REUS de la CONDUSEF para limitar la publicidad comercial.`,
  },
  {
    numero: "8",
    titulo: "Cambios al Aviso",
    contenido: `Este aviso puede actualizarse por reformas legales o necesidades del negocio. Notificaremos cambios sustanciales vía correo electrónico.`,
  },
]

export default function AvisoPrivacidadPage() {
  const config = useSiteConfig()

  const version     = config.legal_privacidad_version || "1.0"
  const fechaUpdate = config.legal_privacidad_fecha   || "26 de septiembre de 2025"

  return (
    <main className="min-h-screen bg-[#fffafa] scroll-smooth">

      {/* HEADER */}
      <div className="relative bg-gradient-to-r from-pink-900 via-pink-800 to-rose-700 py-10 px-6 overflow-hidden border-b border-white/10">
        <div className="relative max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Regresar al Inicio
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-300" />
                <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">Protección de Datos</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                Aviso de <span className="text-pink-300">Privacidad</span>
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

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* SIDEBAR */}
          <aside className="lg:w-1/4">
            <div className="sticky top-10 space-y-8">
              <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 shadow-sm">
                <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-6">Índice General</p>
                <nav className="flex flex-col gap-2">
                  {secciones.map(s => (
                    <a
                      key={s.numero}
                      href={`#seccion-${s.numero}`}
                      className="group flex items-center justify-between text-sm text-gray-500 hover:text-pink-700 py-2.5 transition-all border-b border-gray-50 last:border-0"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-pink-200 group-hover:text-pink-600 transition-colors">{s.numero.padStart(2, "0")}</span>
                        <span className="font-semibold">{s.titulo}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-pink-500" />
                    </a>
                  ))}
                </nav>
              </div>

              <div className="bg-gradient-to-tr from-pink-600 to-rose-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-pink-200/50 relative overflow-hidden group">
                <div className="relative z-10">
                  <Mail className="w-8 h-8 mb-4 text-pink-200" />
                  <p className="text-lg font-bold mb-2">¿Dudas Legales?</p>
                  <p className="text-sm text-pink-100 mb-6 opacity-90 leading-relaxed">Si deseas ejercer tus derechos ARCO, nuestro equipo jurídico está para ayudarte.</p>
                  <a href="mailto:salonbrennsdudas@gmail.com" className="flex items-center justify-center gap-2 w-full bg-white text-pink-700 py-3.5 rounded-2xl text-xs font-black hover:bg-pink-50 transition-colors shadow-lg shadow-black/5">
                    ENVIAR SOLICITUD
                  </a>
                </div>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </div>
          </aside>

          {/* CUERPO */}
          <div className="lg:w-3/4 space-y-12">
            {secciones.map(s => (
              <section
                key={s.numero}
                id={`seccion-${s.numero}`}
                className="scroll-mt-12 bg-white rounded-[3rem] border border-pink-50 shadow-sm transition-all duration-500 hover:shadow-md group/section"
              >
                <div className="p-8 md:p-14">
                  <div className="flex items-center gap-6 mb-10">
                    <span className="text-7xl font-black text-pink-500/5 group-hover/section:text-pink-500/10 transition-colors pointer-events-none select-none absolute">
                      {s.numero}
                    </span>
                    <h2 className="relative text-3xl font-black text-gray-900 leading-tight">{s.titulo}</h2>
                  </div>

                  {s.contenido && (
                    <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line mb-8">{s.contenido}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {s.listas?.map((l, i) => (
                      <div key={i} className="bg-pink-50/40 border border-pink-100/50 rounded-[2rem] p-8">
                        <p className="text-xs font-black text-pink-700 mb-4 uppercase tracking-[0.1em] flex items-center gap-2">
                          <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                          {l.subtitulo}
                        </p>
                        <ul className="space-y-3">
                          {l.items.map((item, j) => (
                            <li key={j} className="text-sm text-gray-600 flex gap-3 items-start leading-snug">
                              <span className="text-pink-400 font-bold">•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {s.subsecciones?.map((sub, i) => (
                    <div key={i} className="mt-8 bg-gray-50/80 rounded-[2.5rem] p-8 md:p-10 border border-gray-100">
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <span className="bg-pink-100 text-pink-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">APARTADO</span>
                        <h3 className="text-lg font-bold text-gray-800">{sub.subtitulo}</h3>
                      </div>
                      {sub.intro && <p className="text-sm text-gray-500 mb-6 italic leading-relaxed">{sub.intro}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
                        {sub.items.map((item, j) => (
                          <div key={j} className="text-sm text-gray-600 flex gap-3 items-center py-1">
                            <div className="w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-pink-600 text-[10px] font-bold">✓</span>
                            </div>
                            {item}
                          </div>
                        ))}
                      </div>
                      {sub.nota && (
                        <div className="mt-8 bg-white/60 rounded-2xl p-5 border-l-4 border-pink-400 shadow-sm">
                          <p className="text-xs text-gray-500 leading-relaxed italic">
                            <span className="font-bold text-pink-600 not-italic mr-1">Nota:</span>
                            {sub.nota}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}

           
          </div>
        </div>
      </div>
    </main>
  )
}