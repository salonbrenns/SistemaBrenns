import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  Users, GraduationCap, CheckCircle2,
  CreditCard, Banknote, ArrowRight,
  ChevronLeft, ChevronRight,
} from "lucide-react"
import AccionesInscrito from "@/app/admin/cursos/[id]/inscritos/AccionesInscrito"

const POR_PAGINA = 10

export const dynamic = "force-dynamic"

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    ACTIVO:     "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    COMPLETADO: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400",
    CANCELADO:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  }
  return map[estado] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
}

function pagoBadge(estado: string) {
  if (estado === "PAGADO")   return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
  if (estado === "PENDIENTE") return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
  return "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
}

function formatDate(d: Date | string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
}

export default async function InscripcionesGlobalPage({
  searchParams,
}: {
  searchParams: Promise<{ curso?: string; estado?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EMPLEADO")) notFound()

  const sp = await searchParams
  const cursoFiltro  = sp.curso  ? Number(sp.curso)  : undefined
  const estadoFiltro = sp.estado ?? "TODOS"
  const pagina       = Math.max(1, Number(sp.page ?? "1"))

  // Todos los cursos para el filtro
  const cursos = await prisma.curso.findMany({ orderBy: { titulo: "asc" } })

  // Inscripciones filtradas
  const inscripciones = await prisma.inscripcion.findMany({
    where: {
      ...(cursoFiltro ? { curso_id: cursoFiltro } : {}),
      ...(estadoFiltro !== "TODOS" ? { estado: estadoFiltro } : {}),
    },
    orderBy: { fecha_inscripcion: "desc" },
  })

  const usuarioIds     = inscripciones.map(i => i.usuario_id)
  const inscripcionIds = inscripciones.map(i => i.id)
  const cursoIds       = inscripciones.map(i => i.curso_id)

  const [usuarios, pagos, cursosInscritos] = await Promise.all([
    prisma.usuario.findMany({ where: { id: { in: usuarioIds } } }),
    prisma.pagoCurso.findMany({ where: { inscripcion_id: { in: inscripcionIds } } }),
    prisma.curso.findMany({ where: { id: { in: cursoIds } } }),
  ])

  const rowsTodos = inscripciones.map(insc => ({
    insc,
    usuario:    usuarios.find(u => u.id === insc.usuario_id),
    curso:      cursosInscritos.find(c => c.id === insc.curso_id),
    pagosCurso: pagos.filter(p => p.inscripcion_id === insc.id),
  }))

  // KPIs (sobre todos los resultados sin paginar)
  const total       = rowsTodos.length
  const activos     = rowsTodos.filter(r => r.insc.estado === "ACTIVO").length
  const completados = rowsTodos.filter(r => r.insc.estado === "COMPLETADO").length
  const pendPagos   = pagos.filter(p => p.estado === "PENDIENTE").length

  // Paginación
  const totalPags  = Math.max(1, Math.ceil(total / POR_PAGINA))
  const paginaReal = Math.min(pagina, totalPags)
  const rows       = rowsTodos.slice((paginaReal - 1) * POR_PAGINA, paginaReal * POR_PAGINA)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <Users className="w-6 h-6 text-rose-500" /> Inscripciones
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Vista global de todos los alumnos inscritos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",         value: total,       color: "text-gray-900 dark:text-white",  icon: Users         },
          { label: "Activos",       value: activos,     color: "text-emerald-600",               icon: CheckCircle2  },
          { label: "Completados",   value: completados, color: "text-pink-600",                  icon: GraduationCap },
          { label: "Pagos pend.",   value: pendPagos,   color: "text-amber-600",                 icon: CreditCard    },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <Icon className="w-5 h-5 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        {/* Filtro curso */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Curso:</span>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/admin/inscripciones"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !cursoFiltro
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Todos
            </Link>
            {cursos.map(c => (
              <Link
                key={c.id}
                href={`/admin/inscripciones?curso=${c.id}${estadoFiltro !== "TODOS" ? `&estado=${estadoFiltro}` : ""}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition truncate max-w-[140px] ${
                  cursoFiltro === c.id
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {c.titulo}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtro estado */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-bold text-gray-400 uppercase">Estado:</span>
          {["TODOS", "ACTIVO", "COMPLETADO", "CANCELADO"].map(e => (
            <Link
              key={e}
              href={`/admin/inscripciones?${cursoFiltro ? `curso=${cursoFiltro}&` : ""}estado=${e}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                estadoFiltro === e
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {e === "TODOS" ? "Todos" : e.charAt(0) + e.slice(1).toLowerCase()}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabla */}
      {rowsTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <GraduationCap className="w-12 h-12 text-gray-200 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">Sin inscripciones con estos filtros</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-rose-900 dark:bg-rose-950">
              <tr>
                {["#", "Alumna", "Correo", "Curso", "Inscripción", "Pagos", "Estado", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map(({ insc, usuario, curso, pagosCurso }, i) => {
                const nombre = usuario
                  ? [usuario.nombre, usuario.appaterno, usuario.apmaterno].filter(Boolean).join(" ")
                  : `Usuario #${insc.usuario_id}`

                return (
                  <tr key={insc.id} className="hover:bg-rose-50 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">{nombre}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{usuario?.correo ?? "—"}</td>
                    <td className="px-4 py-3">
                      {curso ? (
                        <Link
                          href={`/admin/cursos/${curso.id}/inscritos`}
                          className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium text-xs whitespace-nowrap"
                        >
                          {curso.titulo}
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(insc.fecha_inscripcion)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {pagosCurso.map(p => {
                          const Icon = p.metodo_pago === "TRANSFERENCIA" ? Banknote : CreditCard
                          return (
                            <span key={p.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${pagoBadge(p.estado)}`}>
                              <Icon className="w-3 h-3" />
                              ${Number(p.monto).toLocaleString("es-MX")}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${estadoBadge(insc.estado)}`}>
                        {insc.estado.charAt(0) + insc.estado.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AccionesInscrito
                        inscripcionId={insc.id}
                        estadoInscripcion={insc.estado}
                        pagos={pagosCurso.map(p => ({
                          id: p.id,
                          monto: Number(p.monto),
                          metodo_pago: p.metodo_pago,
                          estado: p.estado,
                        }))}
                        cursoId={insc.curso_id}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {totalPags > 1 && (
        <div className="flex justify-center items-center gap-2 flex-wrap">
          <Link
            href={`/admin/inscripciones?${cursoFiltro ? `curso=${cursoFiltro}&` : ""}${estadoFiltro !== "TODOS" ? `estado=${estadoFiltro}&` : ""}page=${paginaReal - 1}`}
            aria-disabled={paginaReal <= 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-semibold transition ${paginaReal <= 1 ? "pointer-events-none opacity-40" : "hover:bg-rose-50 hover:border-rose-300"}`}
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Link>
          {Array.from({ length: totalPags }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/admin/inscripciones?${cursoFiltro ? `curso=${cursoFiltro}&` : ""}${estadoFiltro !== "TODOS" ? `estado=${estadoFiltro}&` : ""}page=${p}`}
              className={`w-9 h-9 rounded-xl border text-sm font-bold text-center flex items-center justify-center transition ${paginaReal === p ? "bg-rose-700 text-white border-rose-700" : "hover:bg-rose-50 hover:border-rose-300"}`}
            >
              {p}
            </Link>
          ))}
          <Link
            href={`/admin/inscripciones?${cursoFiltro ? `curso=${cursoFiltro}&` : ""}${estadoFiltro !== "TODOS" ? `estado=${estadoFiltro}&` : ""}page=${paginaReal + 1}`}
            aria-disabled={paginaReal >= totalPags}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl border text-sm font-semibold transition ${paginaReal >= totalPags ? "pointer-events-none opacity-40" : "hover:bg-rose-50 hover:border-rose-300"}`}
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  )
}
