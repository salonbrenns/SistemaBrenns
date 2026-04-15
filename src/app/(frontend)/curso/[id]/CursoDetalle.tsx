// src/app/(frontend)/cursos/[id]/CursoDetalleClient.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
 
  Clock, 
  BarChart, 
  Calendar, 
  CheckCircle2, 
  LockKeyhole 
} from "lucide-react"

type Curso = {
  id: number
  titulo: string
  descripcion: string | null
  precio_total: number
  nivel: string | null
  duracion_horas: number | null
  cupo_maximo: number
  inscritos: number
  fecha_inicio: string | null
  fecha_fin: string | null
  imagenes: string[]
  docente?: { nombre: string; especialidad: string } | null
}

const nivelColor: Record<string, string> = {
  basico: "bg-emerald-50 text-emerald-600 border-emerald-100",
  intermedio: "bg-amber-50 text-amber-600 border-amber-100",
  avanzado: "bg-rose-50 text-rose-600 border-rose-100",
}

export default function CursoDetalleClient({ curso, isLoggedIn }: { curso: Curso; isLoggedIn: boolean }) {
  const [imagenActiva, setImagenActiva] = useState(curso.imagenes[0] || null)
  const [inscrito, setInscrito] = useState(false)
  const router = useRouter()

  const cupoDisponible = curso.cupo_maximo - curso.inscritos
  const porcentajeOcupado = Math.round((curso.inscritos / curso.cupo_maximo) * 100)
  const nivelKey = (curso.nivel || "").toLowerCase()

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Por definir"
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handleInscripcion = () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    // Aquí iría tu lógica de API para inscripción
    setInscrito(true)
  }

  return (
    <div className="min-h-screen bg-[#fffafa] py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navegación */}
        <Link
          href="/cursos"
          className="group inline-flex items-center gap-2 text-gray-500 mb-10 text-sm font-medium hover:text-rose-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al catálogo de cursos
        </Link>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: Visuales y Descripción */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Galería Principal */}
            <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-rose-100 bg-white border border-rose-50">
              {imagenActiva ? (
                <Image 
                  src={imagenActiva} 
                  alt={curso.titulo} 
                  fill 
                  className="object-cover"
                  priority 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50 text-8xl">🎓</div>
              )}
              
              {/* Badge de Nivel sobre la imagen */}
              {curso.nivel && (
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm ${nivelColor[nivelKey] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
                    {curso.nivel}
                  </span>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {curso.imagenes.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {curso.imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(img)}
                    className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 transition-all border-2 ${
                      imagenActiva === img ? "border-rose-500 scale-105 shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="Vista previa" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Acerca del curso */}
            <div className="bg-white rounded-[2rem] p-8 border border-rose-50 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                Acerca de este curso
                <div className="h-1 w-12 bg-rose-200 rounded-full" />
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                {curso.descripcion ? (
                  <p>{curso.descripcion}</p>
                ) : (
                  <p className="italic text-gray-400">No hay descripción disponible para este curso.</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Card de Compra/Inscripción */}
          <div className="lg:col-span-5 sticky top-12">
            <div className="bg-white rounded-[2.5rem] p-10 border border-rose-100 shadow-2xl shadow-rose-100/50">
              
              {/* Encabezado */}
              <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4 italic">
                  {curso.titulo}
                </h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-rose-600">
                    ${curso.precio_total.toLocaleString("es-MX")}
                  </span>
                  <span className="text-gray-400 font-medium tracking-tighter">MXN</span>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="mb-8 space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Disponibilidad</span>
                  <span className={`text-sm font-black ${cupoDisponible < 5 ? 'text-rose-500 animate-pulse' : 'text-gray-900'}`}>
                    {cupoDisponible > 0 ? `${cupoDisponible} lugares restantes` : 'Cupo agotado'}
                  </span>
                </div>
                <div className="h-3 w-full bg-rose-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out"
                    style={{ width: `${porcentajeOcupado}%` }}
                  />
                </div>
              </div>

              {/* Grid de Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <Clock className="w-5 h-5 text-rose-500 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Duración</p>
                  <p className="text-sm font-black text-gray-900">{curso.duracion_horas} Horas</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <BarChart className="w-5 h-5 text-rose-500 mb-2" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Nivel</p>
                  <p className="text-sm font-black text-gray-900 capitalize">{curso.nivel}</p>
                </div>
                <div className="col-span-2 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                  <Calendar className="w-5 h-5 text-rose-500 mb-2" />
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Inicia</p>
                      <p className="text-sm font-black text-gray-900">{formatDate(curso.fecha_inicio)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Termina</p>
                      <p className="text-sm font-black text-gray-900">{formatDate(curso.fecha_fin)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Acción */}
              <button
                onClick={handleInscripcion}
                disabled={cupoDisponible <= 0 && !inscrito}
                className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
                  inscrito 
                    ? "bg-emerald-500 text-white shadow-emerald-200" 
                    : cupoDisponible <= 0 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                    : "bg-gray-900 text-white hover:bg-rose-600 shadow-gray-200 hover:shadow-rose-200"
                }`}
              >
                {inscrito ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    ¡Ya estás inscrito!
                  </>
                ) : cupoDisponible <= 0 ? (
                  <>
                    <LockKeyhole className="w-6 h-6" />
                    Cupo Completo
                  </>
                ) : (
                  <>
                    {isLoggedIn ? "Inscribirme ahora" : "Inicia sesión para participar"}
                  </>
                )}
              </button>

              {cupoDisponible > 0 && cupoDisponible <= 5 && !inscrito && (
                <p className="text-center mt-4 text-xs font-bold text-rose-500 italic">
                  ✨ ¡Solo quedan {cupoDisponible} vacantes! No te lo pierdas.
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}