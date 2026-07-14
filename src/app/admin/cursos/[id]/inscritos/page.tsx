import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Link from "next/link"
import {
  GraduationCap, Users, ArrowLeft,
  CheckCircle2, AlertCircle, CreditCard, Banknote,
} from "lucide-react"
import AccionesInscrito from "./AccionesInscrito"

function badge(estado: string) {
  if (estado === "PAGADO")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  if (estado === "PENDIENTE")
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
}

function estadoBadge(estado: string) {
  if (estado === "ACTIVO")
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  if (estado === "COMPLETADO")
    return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
  if (estado === "CANCELADO")
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
}

export default async function InscritosPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EMPLEADO")) {
    notFound()
  }

  const { id } = await params
  const cursoId = Number(id)

  const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
  if (!curso) notFound()

  const inscripciones = await prisma.inscripcion.findMany({
    where:   { curso_id: cursoId },
    orderBy: { fecha_inscripcion: "desc" },
  })

  const usuarioIds     = inscripciones.map((i) => i.usuario_id)
  const inscripcionIds = inscripciones.map((i) => i.id)

  const [usuarios, pagos] = await Promise.all([
    prisma.usuario.findMany({ where: { id: { in: usuarioIds } } }),
    prisma.pagoCurso.findMany({ where: { inscripcion_id: { in: inscripcionIds } } }),
  ])

  const rows = inscripciones.map((insc) => {
    const usuario    = usuarios.find((u) => u.id === insc.usuario_id)
    const pagosCurso = pagos.filter((p) => p.inscripcion_id === insc.id)
    const totalPagado = pagosCurso.reduce((sum, p) => sum + Number(p.monto), 0)
    return { insc, usuario, pagosCurso, totalPagado }
  })

  const precioTotal    = Number(curso.precio_total)
  const totalRecaudado = rows.reduce((s, r) => s + r.totalPagado, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/cursos"
          className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-rose-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Inscritos</p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white truncate">{curso.titulo}</h1>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users,          label: "Inscritos",     value: `${curso.inscritos} / ${curso.cupo_maximo}`, color: "text-rose-600" },
          { icon: GraduationCap,  label: "Cupo restante", value: `${Math.max(0, curso.cupo_maximo - curso.inscritos)}`, color: "text-gray-900 dark:text-white" },
          { icon: CheckCircle2,   label: "Recaudado",     value: `$${totalRecaudado.toLocaleString("es-MX")}`, color: "text-emerald-600" },
          { icon: AlertCircle,    label: "Precio total",  value: `$${precioTotal.toLocaleString("es-MX")}`,    color: "text-gray-900 dark:text-white" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
            <Icon className="w-5 h-5 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <GraduationCap className="w-12 h-12 text-gray-200 dark:text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">Nadie inscrito aún</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-rose-900 dark:bg-rose-950">
                <tr>
                  {["#", "Nombre", "Correo", "Teléfono", "Inscripción", "Pago", "Total pagado", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map(({ insc, usuario, pagosCurso, totalPagado }, i) => {
                  const nombre = usuario
                    ? [usuario.nombre, usuario.appaterno, usuario.apmaterno].filter(Boolean).join(" ")
                    : `Usuario #${insc.usuario_id}`

                  return (
                    <tr key={insc.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-4 py-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{nombre}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{usuario?.correo ?? "—"}</td>
                      <td className="px-4 py-4 text-gray-600 dark:text-gray-400">{usuario?.telefono ?? "—"}</td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(insc.fecha_inscripcion)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {pagosCurso.map((p, pi) => {
                            const Icon = p.metodo_pago === "TRANSFERENCIA" ? Banknote : CreditCard
                            return (
                              <span key={pi} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${badge(p.estado)}`}>
                                <Icon className="w-3 h-3" />
                                ${Number(p.monto).toLocaleString("es-MX")} · {p.estado}
                              </span>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 font-black text-gray-900 dark:text-white whitespace-nowrap">
                        ${totalPagado.toLocaleString("es-MX")}
                        {totalPagado < precioTotal && (
                          <span className="block text-xs font-normal text-amber-500">
                            Debe: ${(precioTotal - totalPagado).toLocaleString("es-MX")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoBadge(insc.estado)}`}>
                          {insc.estado}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <AccionesInscrito
                          inscripcionId={insc.id}
                          estadoInscripcion={insc.estado}
                          pagos={pagosCurso.map(p => ({
                            id: p.id,
                            monto: Number(p.monto),
                            metodo_pago: p.metodo_pago,
                            estado: p.estado,
                          }))}
                          cursoId={cursoId}
                        />
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
