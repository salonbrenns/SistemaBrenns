import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CreditCard, Banknote, AlertCircle, CheckCircle2 } from "lucide-react"
import AccionesPago from "./AccionesPago"

export const dynamic = "force-dynamic"

type FiltroEstado = "PENDIENTE" | "PAGADO" | "RECHAZADO" | "TODOS"

const TABS: { label: string; value: FiltroEstado }[] = [
  { label: "Pendientes",  value: "PENDIENTE"  },
  { label: "Confirmados", value: "PAGADO"      },
  { label: "Rechazados",  value: "RECHAZADO"   },
  { label: "Todos",       value: "TODOS"        },
]

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

const ESTADO_BADGE: Record<string, { label: string; color: string }> = {
  PENDIENTE: { label: "Pendiente",  color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"    },
  PAGADO:    { label: "Confirmado", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
  RECHAZADO: { label: "Rechazado",  color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"             },
}

export default async function PagosCursosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EMPLEADO")) notFound()

  const { estado: estadoParam } = await searchParams
  const filtro = (TABS.find(t => t.value === estadoParam)?.value ?? "PENDIENTE") as FiltroEstado

  const whereEstado = filtro === "TODOS" ? undefined : { estado: filtro }

  const pagos = await prisma.pagoCurso.findMany({
    where: whereEstado,
    orderBy: { fecha_pago: "desc" },
  })

  const inscripcionIds = [...new Set(pagos.map(p => p.inscripcion_id))]
  const inscripciones  = await prisma.inscripcion.findMany({ where: { id: { in: inscripcionIds } } })

  const usuarioIds = [...new Set(inscripciones.map(i => i.usuario_id))]
  const cursoIds   = [...new Set(inscripciones.map(i => i.curso_id))]

  const [usuarios, cursos] = await Promise.all([
    prisma.usuario.findMany({ where: { id: { in: usuarioIds } } }),
    prisma.curso.findMany({ where: { id: { in: cursoIds } } }),
  ])

  const rows = pagos.map(pago => {
    const insc    = inscripciones.find(i => i.id === pago.inscripcion_id)
    const usuario = insc ? usuarios.find(u => u.id === insc.usuario_id)  : undefined
    const curso   = insc ? cursos.find(c => c.id === insc.curso_id)      : undefined
    return { pago, insc, usuario, curso }
  })

  // KPIs (always from full dataset for context)
  const totalPendiente = pagos.filter(p => p.estado === "PENDIENTE").reduce((s, p) => s + Number(p.monto), 0)
  const countPendiente = pagos.filter(p => p.estado === "PENDIENTE").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-amber-500" /> Pagos de cursos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Historial de pagos registrados para inscripciones
        </p>
      </div>

      {/* KPIs — always show pendientes count for quick awareness */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <AlertCircle className="w-5 h-5 text-amber-400 mb-2" />
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Pendientes</p>
          <p className="text-3xl font-black text-amber-600">{countPendiente}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">Monto por confirmar</p>
          <p className="text-3xl font-black text-emerald-600">${totalPendiente.toLocaleString("es-MX")}</p>
        </div>
      </div>

      {/* Tabs de filtro */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <Link
            key={tab.value}
            href={`/admin/pagos-cursos?estado=${tab.value}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
              filtro === tab.value
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Lista */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <CheckCircle2 className="w-14 h-14 text-emerald-300 dark:text-emerald-700 mb-4" />
          <p className="text-lg font-bold text-gray-700 dark:text-white">Sin resultados</p>
          <p className="text-sm text-gray-400 mt-1">No hay pagos en este estado</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-amber-700 dark:bg-amber-900">
              <tr>
                {["#", "Alumna", "Curso", "Monto", "Método", "Estado", "Fecha", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map(({ pago, usuario, curso, insc }, i) => {
                const nombre = usuario
                  ? [usuario.nombre, usuario.appaterno, usuario.apmaterno].filter(Boolean).join(" ")
                  : `Usuario #${insc?.usuario_id}`

                const MetodoIcon = pago.metodo_pago === "TRANSFERENCIA" ? Banknote : CreditCard
                const estadoBadge = ESTADO_BADGE[pago.estado] ?? { label: pago.estado, color: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400" }

                return (
                  <tr key={pago.id} className="hover:bg-amber-50 dark:hover:bg-gray-700/60 transition-colors">
                    <td className="px-4 py-4 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-900 dark:text-white whitespace-nowrap">{nombre}</p>
                      <p className="text-xs text-gray-400">{usuario?.correo ?? "—"}</p>
                    </td>
                    <td className="px-4 py-4">
                      {curso && insc ? (
                        <a
                          href={`/admin/cursos/${curso.id}/inscritos`}
                          className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium text-xs whitespace-nowrap"
                        >
                          {curso.titulo}
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4 font-black text-gray-900 dark:text-white whitespace-nowrap">
                      ${Number(pago.monto).toLocaleString("es-MX")} MXN
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                        <MetodoIcon className="w-3.5 h-3.5" />
                        {pago.metodo_pago ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${estadoBadge.color}`}>
                        {estadoBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(pago.fecha_pago)}
                    </td>
                    <td className="px-4 py-4">
                      {pago.estado === "PENDIENTE" ? (
                        <AccionesPago pagoId={pago.id} />
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
