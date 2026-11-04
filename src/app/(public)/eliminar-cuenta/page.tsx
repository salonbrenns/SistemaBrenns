// src/app/(public)/eliminar-cuenta/page.tsx
import Link from "next/link"
import { Trash2, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export const metadata = {
  title: "Solicitar eliminación de cuenta — Salón Brenn's",
}

const CORREO = "salonbrenns11@gmail.com"
const ASUNTO = "Solicitud de eliminación de cuenta"
const CUERPO = `Hola, quiero solicitar la eliminación de mi cuenta de Salón Brenn's.

Nombre completo:
Correo registrado en la cuenta:

Gracias.`

const MAILTO = `mailto:${CORREO}?subject=${encodeURIComponent(ASUNTO)}&body=${encodeURIComponent(CUERPO)}`

const pasos = [
  `Envía un correo a ${CORREO} con el asunto "${ASUNTO}".`,
  "Indica tu nombre completo y el correo electrónico asociado a tu cuenta.",
  "La persona encargada revisará tu solicitud y te indicará cómo verificar tu identidad de forma segura.",
  "Una vez verificada tu identidad, se eliminará la cuenta y los datos personales que corresponda suprimir.",
  "Recibirás una respuesta informando el resultado de tu solicitud.",
]

const seEliminan = [
  "Datos de cuenta y acceso (correo, credenciales y sesiones)",
  "Datos de perfil (nombre completo y teléfono)",
  "Historial de citas y reservaciones",
  "Inscripciones a cursos",
  "Historial de pedidos",
  "Comprobantes de transferencia cargados por ti",
]

const seConservan = [
  "Registros de operaciones comerciales y de pago que deban conservarse por obligaciones legales o fiscales.",
  "Registros necesarios por seguridad o prevención de fraude.",
]

export default function EliminarCuentaPage() {
  return (
    <main className="min-h-screen bg-[#fffafa] dark:bg-gray-950">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-900 via-pink-800 to-rose-700 py-10 px-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-pink-200 hover:text-white mb-6 transition-all text-xs font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Regresar al Inicio
          </Link>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full w-fit mb-3">
            <Trash2 className="w-3.5 h-3.5 text-pink-300" />
            <span className="text-white text-[9px] font-black uppercase tracking-[0.15em]">Salón Brenn&apos;s</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
            Solicitar <span className="text-pink-300">eliminación de cuenta</span>
          </h1>
          <p className="text-pink-100/80 text-sm mt-2">
            Aplicación móvil y sitio web de Salón Brenn&apos;s
          </p>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        {/* Introducción + botón */}
        <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-pink-50 dark:border-gray-700 shadow-sm p-8 md:p-12">
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-4">
            Si deseas eliminar tu cuenta de Salón Brenn&apos;s y los datos personales asociados, puedes
            solicitarlo por correo electrónico. No necesitas tener instalada la aplicación móvil ni
            iniciar sesión para hacerlo.
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8">
            <strong className="text-gray-800 dark:text-gray-100">Responsable: </strong>
            Brenda Hernandez Garcia, titular de Academia, Distribuidora y Salón Brenn&apos;s.
          </p>

          <a
            href={MAILTO}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white px-8 py-4 rounded-2xl text-sm font-black transition-colors"
          >
            <Mail className="w-4 h-4" /> Solicitar eliminación por correo
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
            El botón abre un borrador en tu aplicación de correo. La solicitud solo se envía cuando
            tú presionas &quot;Enviar&quot;. Si no se abre, escribe directamente a{" "}
            <a href={`mailto:${CORREO}`} className="text-pink-600 dark:text-pink-400 underline">
              {CORREO}
            </a>.
          </p>
        </section>

        {/* Procedimiento */}
        <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-pink-50 dark:border-gray-700 shadow-sm p-8 md:p-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Procedimiento</h2>
          <ol className="space-y-4">
            {pasos.map((paso, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 text-xs font-black w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-600 dark:text-gray-300 text-base leading-relaxed pt-1">{paso}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Qué se elimina / qué se conserva */}
        <section className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-pink-50 dark:border-gray-700 shadow-sm p-8 md:p-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Qué datos se eliminan y cuáles se conservan</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-pink-50/40 dark:bg-gray-900/60 border border-pink-100/50 dark:border-gray-700 rounded-[1.5rem] p-6">
              <p className="text-xs font-black text-pink-700 dark:text-pink-300 uppercase tracking-[0.1em] mb-4">
                Se eliminan
              </p>
              <ul className="space-y-3">
                {seEliminan.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-3 items-start leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] p-6">
              <p className="text-xs font-black text-gray-700 dark:text-gray-200 uppercase tracking-[0.1em] mb-4">
                Se pueden conservar
              </p>
              <ul className="space-y-3">
                {seConservan.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex gap-3 items-start leading-snug">
                    <span className="text-gray-400 font-bold">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 leading-relaxed">
            Los datos que deban conservarse únicamente se mantendrán durante el periodo que corresponda
            y para las finalidades justificadas por la ley. Después se suprimen.
          </p>
        </section>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Más información en nuestro{" "}
          <Link href="/privacidad-movil" className="text-pink-600 dark:text-pink-400 underline">
            Aviso de Privacidad de la App Móvil
          </Link>.
        </p>
      </div>
    </main>
  )
}