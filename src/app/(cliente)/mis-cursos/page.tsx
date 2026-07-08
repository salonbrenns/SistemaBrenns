"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import AuthGuard from "@/components/ui/AuthGuard"
import {
  GraduationCap, Clock, Calendar, BookOpen,
  CheckCircle2, AlertCircle, Loader2, Plus,
  CreditCard, Banknote, ChevronRight,
} from "lucide-react"

type PagoCurso = {
  id:          number
  numero_pago: number | null
  monto:       number
  metodo_pago: string | null
  estado:      string
  fecha_pago:  string
}

type CursoInscrito = {
  inscripcionId:     number
  estado:            string
  fecha_inscripcion: string
  totalPagado:       number
  pagos:             PagoCurso[]
  curso: {
    id:             number
    titulo:         string
    nivel:          string | null
    duracion_horas: number | null
    precio_total:   number
    fecha_inicio:   string | null
    fecha_fin:      string | null
    imagenes:       string[]
  } | null
}

const estadoBadge: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  ACTIVO:   { label: "Activo",   color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  CANCELADO:{ label: "Cancelado",color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",                 icon: AlertCircle  },
}

const pagoBadge: Record<string, string> = {
  PAGADO:   "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  PENDIENTE:"bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
}

function formatDate(d: string | null) {
  if (!d) return "Por definir"
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
}

function MisCursosContent() {
  const [cursos, setCursos]   = useState<CursoInscrito[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/mis-cursos")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setCursos(d.cursos)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-600 dark:text-red-400">
      <AlertCircle className="w-6 h-6 shrink-0" />
      <p>{error}</p>
    </div>
  )

  if (cursos.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
        <GraduationCap className="w-12 h-12 text-rose-300" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Sin cursos aún</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
        Todavía no te has inscrito a ningún curso. ¡Explora el catálogo y comienza tu camino!
      </p>
      <Link
        href="/cursos"
        className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-rose-600 dark:hover:bg-rose-100 transition-all"
      >
        <Plus className="w-4 h-4" />
        Ver catálogo de cursos
      </Link>
    </div>
  )

  return (
    <div className="space-y-6">
      {cursos.map((item) => {
        if (!item.curso) return null
        const c       = item.curso
        const badge   = estadoBadge[item.estado] ?? estadoBadge.ACTIVO
        const BadgeIcon = badge.icon
        const pendiente = item.pagos.some((p) => p.estado === "PENDIENTE")
        const deuda     = c.precio_total - item.totalPagado

        return (
          <div
            key={item.inscripcionId}
            className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-0">
              {/* Imagen */}
              <div className="w-full md:w-48 h-36 md:h-auto shrink-0 bg-rose-50 dark:bg-gray-700 flex items-center justify-center text-5xl">
                {Array.isArray(c.imagenes) && c.imagenes.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imagenes[0]} alt={c.titulo} className="w-full h-full object-cover" />
                ) : (
                  "🎓"
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {badge.label}
                      </span>
                      {c.nivel && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                          {c.nivel}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{c.titulo}</h3>
                  </div>
                  <Link
                    href={`/curso/${c.id}`}
                    className="shrink-0 p-2 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>

                {/* Info del curso */}
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {c.duracion_horas && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {c.duracion_horas} horas
                    </span>
                  )}
                  {c.fecha_inicio && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(c.fecha_inicio)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Inscrito el {formatDate(item.fecha_inscripcion)}
                  </span>
                </div>

                {/* Pagos */}
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">Pagos:</span>
                  {item.pagos.map((pago) => {
                    const MetodoIcon = pago.metodo_pago === "TRANSFERENCIA" ? Banknote : CreditCard
                    return (
                      <div key={pago.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${pagoBadge[pago.estado] ?? pagoBadge.PENDIENTE}`}>
                        <MetodoIcon className="w-3.5 h-3.5" />
                        ${pago.monto.toLocaleString("es-MX")} · {pago.estado}
                      </div>
                    )
                  })}

                  {deuda > 0 && item.estado === "ACTIVO" && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Resto: ${deuda.toLocaleString("es-MX")} MXN
                    </span>
                  )}

                  {pendiente && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      · Transferencia pendiente de verificar
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="text-center pt-4">
        <Link
          href="/cursos"
          className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-700 font-bold text-sm"
        >
          <Plus className="w-4 h-4" />
          Inscribirme a otro curso
        </Link>
      </div>
    </div>
  )
}

export default function MisCursosPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-rose-500" />
              Mis Cursos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Cursos en los que estás inscrita</p>
          </div>
          <MisCursosContent />
        </div>
      </div>
    </AuthGuard>
  )
}
