"use client"

import { useRef } from "react"
import Image from "next/image"
import { Printer, Award } from "lucide-react"

type Props = {
  alumno:   { nombre: string; foto: string | null }
  curso:    { titulo: string; nivel: string | null; fecha_inicio: string | null; fecha_fin: string | null }
  plantilla: string | null
  fecha:    string
  demo?:    boolean
}

function formatFecha(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
}

export default function CertificadoClient({ alumno, curso, plantilla, fecha, demo }: Props) {
  const certRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 print:bg-white print:min-h-0">

      {/* Barra de acción — se oculta al imprimir */}
      <div className="print:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-pink-500" />
          <span className="font-bold text-gray-800 dark:text-white">Certificado de Participación</span>
          {demo && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">DEMO</span>}
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2.5 rounded-full transition text-sm"
        >
          <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Certificado */}
      <div className="flex justify-center py-10 px-4 print:py-0 print:px-0">
        <div
          ref={certRef}
          className="relative w-full max-w-[900px] print:max-w-none print:w-full"
          style={{ aspectRatio: "1240/877" }}
        >
          {/* Plantilla de fondo */}
          {plantilla ? (
            <Image
              src={plantilla}
              alt="Plantilla certificado"
              fill
              className="object-cover rounded-2xl print:rounded-none"
              priority
            />
          ) : (
            /* Diseño predeterminado si no hay plantilla */
            <DefaultTemplate />
          )}

          {/* Contenido superpuesto */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 print:px-12">

            {/* Foto del alumno */}
            {alumno.foto && (
              <div className="relative w-[10%] aspect-square rounded-full overflow-hidden border-4 border-white shadow-lg mb-[2%]">
                <Image src={alumno.foto} alt={alumno.nombre} fill className="object-cover" />
              </div>
            )}

            {/* Nombre del alumno */}
            <p
              className="text-center font-black text-gray-900 leading-tight"
              style={{ fontSize: "clamp(1.2rem, 3.5vw, 2.8rem)", letterSpacing: "0.02em" }}
            >
              {alumno.nombre}
            </p>

            {/* Descripción */}
            <p
              className="text-center text-gray-600 mt-[1%]"
              style={{ fontSize: "clamp(0.65rem, 1.5vw, 1.1rem)" }}
            >
              ha concluido satisfactoriamente el curso
            </p>

            {/* Nombre del curso */}
            <p
              className="text-center font-bold text-gray-800 mt-[1%] max-w-[70%]"
              style={{ fontSize: "clamp(0.9rem, 2.2vw, 1.6rem)" }}
            >
              {curso.titulo}
            </p>

            {/* Nivel */}
            {curso.nivel && (
              <p
                className="text-center text-gray-500 mt-[0.5%]"
                style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.95rem)" }}
              >
                Nivel {curso.nivel}
              </p>
            )}

            {/* Fechas */}
            <p
              className="text-center text-gray-400 mt-[1.5%]"
              style={{ fontSize: "clamp(0.55rem, 1.1vw, 0.85rem)" }}
            >
              {formatFecha(curso.fecha_inicio)} — {formatFecha(curso.fecha_fin)}
            </p>

            {/* Fecha de expedición */}
            <p
              className="text-center text-gray-400 mt-[0.5%]"
              style={{ fontSize: "clamp(0.5rem, 1vw, 0.8rem)" }}
            >
              Expedido el {formatFecha(fecha)}
            </p>
          </div>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          body { margin: 0; padding: 0; }
          @page { size: landscape; margin: 0; }
        }
      `}</style>
    </div>
  )
}

/* Diseño predeterminado cuando no hay plantilla cargada */
function DefaultTemplate() {
  return (
    <div className="absolute inset-0 rounded-2xl print:rounded-none overflow-hidden bg-white">
      {/* Borde decorativo externo */}
      <div className="absolute inset-3 border-4 border-double border-pink-300 rounded-xl pointer-events-none" />
      <div className="absolute inset-5 border border-pink-100 rounded-lg pointer-events-none" />

      {/* Gradiente superior */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-rose-500 to-pink-400" />

      {/* Encabezado */}
      <div className="absolute top-[8%] left-0 right-0 flex flex-col items-center">
        <Award
          className="text-pink-400"
          style={{ width: "clamp(1.5rem, 5vw, 4rem)", height: "clamp(1.5rem, 5vw, 4rem)" }}
        />
        <p
          className="font-black text-pink-600 tracking-[0.3em] uppercase mt-[1%]"
          style={{ fontSize: "clamp(0.5rem, 1.5vw, 1.1rem)" }}
        >
          Academia Brenn&apos;s
        </p>
        <p
          className="text-gray-400 tracking-widest uppercase mt-[0.5%]"
          style={{ fontSize: "clamp(0.4rem, 1vw, 0.75rem)" }}
        >
          Certificado de Participación
        </p>
        <div className="w-[30%] h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent mt-[2%]" />
      </div>

      {/* Pie */}
      <div className="absolute bottom-[8%] left-0 right-0 flex justify-center gap-[10%]">
        {["Directora Académica", "Coordinación Educativa"].map(rol => (
          <div key={rol} className="flex flex-col items-center">
            <div className="w-[8vw] max-w-[80px] h-px bg-gray-300 mb-1" />
            <p className="text-gray-400" style={{ fontSize: "clamp(0.4rem, 0.9vw, 0.7rem)" }}>
              {rol}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
