// src/app/(frontend)/cursos/[id]/CursoDetalleClient.tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, BarChart, Calendar, CheckCircle2, LockKeyhole, Package } from "lucide-react"
import BackButton from "@/components/ui/BackButton"
import { FavoritoCursoBoton } from "@/components/ui/FavoritoCursoBoton"

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
  basico: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200",
  intermedio: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200",
  avanzado: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200",
}

export default function CursoDetalleClient({ curso, isLoggedIn }: { curso: Curso; isLoggedIn: boolean }) {
  const [imagenActiva, setImagenActiva] = useState(curso.imagenes[0] || null)
  const [inscrito, setInscrito] = useState(false)
  const router = useRouter()

  const cupoDisponible = curso.cupo_maximo - curso.inscritos
  const porcentajeOcupado = Math.round((curso.inscritos / curso.cupo_maximo) * 100)
  const nivelKey = (curso.nivel || "").toLowerCase()

  useEffect(() => {
    if (!isLoggedIn) return
    fetch(`/api/cursos/${curso.id}/estado`)
      .then((r) => r.json())
      .then((d) => { if (d.inscrito) setInscrito(true) })
      .catch(() => {})
  }, [curso.id, isLoggedIn])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Por definir"
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "numeric", month: "long", year: "numeric",
    })
  }

  const handleInscripcion = () => {
    if (!isLoggedIn) {
      router.push(`/login?next=/inscribirse?id=${curso.id}`)
      return
    }
    router.push(`/inscribirse?id=${curso.id}`)
  }

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <BackButton fallbackHref="/cursos" label="Volver al catálogo de cursos" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Galería */}
          <div className="space-y-3 lg:sticky lg:top-8">
            <div className="relative rounded-3xl overflow-hidden bg-rose-50 dark:bg-gray-800 shadow-xl dark:shadow-none aspect-square">
              {imagenActiva ? (
                <Image
                  src={imagenActiva}
                  alt={curso.titulo}
                  fill
                  className="object-cover transition-all duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🎓</div>
              )}

              {/* Badge nivel */}
              {curso.nivel && (
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border ${nivelColor[nivelKey] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200"}`}>
                    {curso.nivel}
                  </span>
                </div>
              )}

              {/* Favorito */}
              <div className="absolute top-4 right-4">
                <FavoritoCursoBoton cursoId={curso.id} />
              </div>
            </div>

            {/* Miniaturas */}
            {curso.imagenes.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {curso.imagenes.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImagenActiva(img)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      imagenActiva === img ? "border-rose-500" : "border-gray-200 dark:border-gray-700 hover:border-rose-300"
                    }`}
                  >
                    <Image src={img} alt={`Vista ${i + 1}`} fill sizes="10vw" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              {curso.nivel && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${nivelColor[nivelKey] || "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200"}`}>
                  {curso.nivel}
                </span>
              )}
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              {curso.titulo}
            </h1>

            {/* Precio */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-rose-100 dark:border-gray-700">
              <p className="text-4xl font-black text-gray-900 dark:text-white">
                ${curso.precio_total.toLocaleString("es-MX")}
                <span className="text-lg font-semibold text-gray-400 ml-2">MXN</span>
              </p>
            </div>

            {/* Disponibilidad */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Disponibilidad</span>
                <span className={`text-sm font-black ${cupoDisponible < 5 ? "text-rose-500 animate-pulse" : "text-gray-900 dark:text-white"}`}>
                  {cupoDisponible > 0 ? `${cupoDisponible} lugares restantes` : "Cupo agotado"}
                </span>
              </div>
              <div className="h-3 w-full bg-rose-50 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-1000 ease-out"
                  style={{ width: `${porcentajeOcupado}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <Clock className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Duración</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{curso.duracion_horas} Horas</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <BarChart className="w-5 h-5 text-rose-500 mb-2" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Nivel</p>
                <p className="text-sm font-black text-gray-900 dark:text-white capitalize">{curso.nivel}</p>
              </div>
              <div className="col-span-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <Calendar className="w-5 h-5 text-rose-500 mb-2" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Inicia</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(curso.fecha_inicio)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Termina</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{formatDate(curso.fecha_fin)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {curso.descripcion && (
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{curso.descripcion}</p>
            )}

            {/* Cupo */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              {cupoDisponible <= 0 ? (
                <span className="text-sm font-semibold text-red-500">Sin cupo disponible</span>
              ) : cupoDisponible <= 5 ? (
                <span className="text-sm font-semibold text-amber-600 animate-pulse">¡Solo quedan {cupoDisponible} lugares!</span>
              ) : (
                <span className="text-sm font-semibold text-green-600">Cupo disponible</span>
              )}
            </div>

            {/* Botón */}
            <button
              onClick={handleInscripcion}
              disabled={cupoDisponible <= 0 && !inscrito}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 uppercase tracking-wide ${
                inscrito
                  ? "bg-emerald-500 text-white"
                  : cupoDisponible <= 0
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 hover:bg-rose-700 text-white"
              }`}
            >
              {inscrito ? (
                <><CheckCircle2 className="w-5 h-5" /> ¡Ya estás inscrito!</>
              ) : cupoDisponible <= 0 ? (
                <><LockKeyhole className="w-5 h-5" /> Cupo Completo</>
              ) : (
                isLoggedIn ? "Inscribirme ahora" : "Inicia sesión para participar"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
