import { prisma } from "@/lib/prisma"
import { CreditCard, Banknote, ArrowRight, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink, ChevronLeft, ChevronRight, FileImage } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"
import PagoAccionesClient from "./PagoAccionesClient"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Pagos — Servicios" }

const PAGE_SIZE = 20

function detectarTipo(
  total: number | null,
  notas: string | null,
  precioServicio: number
): { montoAnticipo: number; tipo: "ANTICIPO" | "COMPLETO" } {
  if (total !== null && total > 0) {
    const esAnticipo = total < precioServicio * 0.99
    return { montoAnticipo: total, tipo: esAnticipo ? "ANTICIPO" : "COMPLETO" }
  }
  if (notas) {
    const matchAnticipo = notas.match(/\[ANTICIPO[^:]*:\s*\$([0-9,]+)/)
    if (matchAnticipo) {
      const monto = Number(matchAnticipo[1].replace(/,/g, ""))
      return { montoAnticipo: isNaN(monto) ? precioServicio * 0.5 : monto, tipo: "ANTICIPO" }
    }
    if (notas.includes("[PAGO COMPLETO")) {
      return { montoAnticipo: precioServicio, tipo: "COMPLETO" }
    }
  }
  return { montoAnticipo: precioServicio, tipo: "COMPLETO" }
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO:      "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA:       "Tarjeta",
}

type SearchParams = { page?: string; estado?: string; conComprobante?: string }

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { page = "1", estado = "todos", conComprobante = "no" } = await searchParams
  const pageNum  = Math.max(1, parseInt(page) || 1)
  const soloComp = conComprobante === "si"

  // ── Where clause según filtros
  const where = {
    estado: estado === "todos"
      ? { not: "CANCELADA" as const }
      : estado,
    // Filtro comprobante: si soloComp solo traemos los que tienen comprobante
    ...(soloComp ? { comprobante: { not: null as unknown as undefined } } : {}),
  }

  const [total, citasRaw] = await Promise.all([
    prisma.cita.count({ where }),
    prisma.cita.findMany({
      where,
      include: {
        servicio: { select: { nombre: true, precio: true } },
        usuario:  { select: { nombre: true, telefono: true } },
      },
      orderBy: { fecha: "desc" },
      skip:    (pageNum - 1) * PAGE_SIZE,
      take:    PAGE_SIZE,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // KPIs (sobre TODOS los registros, sin paginación)
  const [kpiTotal, kpiPorVerificar, kpiSaldo] = await Promise.all([
    prisma.cita.aggregate({
      where: { estado: { not: "CANCELADA" }, total: { not: null } },
      _sum:  { total: true },
    }),
    prisma.cita.count({ where: { estado: "PENDIENTE" } }),
    prisma.cita.findMany({
      where:  { estado: { not: "CANCELADA" }, total: { not: null } },
      select: { total: true, notas: true, servicio: { select: { precio: true } } },
    }),
  ])

  const totalRecibido  = Number(kpiTotal._sum.total ?? 0)
  const totalSaldoPend = kpiSaldo.reduce((s, c) => {
    const precio = Number(c.servicio.precio)
    const { tipo, montoAnticipo } = detectarTipo(c.total ? Number(c.total) : null, c.notas, precio)
    return tipo === "ANTICIPO" ? s + (precio - montoAnticipo) : s
  }, 0)

  const pagos = citasRaw.map(c => {
    const precioServicio = Number(c.servicio.precio)
    const totalGuardado  = c.total ? Number(c.total) : null
    const { montoAnticipo, tipo } = detectarTipo(totalGuardado, c.notas, precioServicio)
    const saldoPendiente = tipo === "ANTICIPO" ? precioServicio - montoAnticipo : 0

    const estadoPago: "POR_VERIFICAR" | "ANTICIPO_VERIFICADO" | "COMPLETADO" =
      c.estado === "PENDIENTE"   ? "POR_VERIFICAR" :
      c.estado === "COMPLETADA"  ? "COMPLETADO"    :
      tipo === "ANTICIPO"        ? "ANTICIPO_VERIFICADO" :
                                   "COMPLETADO"

    return {
      id:          c.id,
      cliente:     c.usuario?.nombre || c.nombre_contacto || "Sin nombre",
      telefono:    c.usuario?.telefono || c.telefono_contacto || null,
      servicio:    c.servicio.nombre,
      montoAnticipo,
      saldoPendiente,
      tipo,
      metodo:      c.metodo_pago || "EFECTIVO",
      estadoPago,
      estadoCita:  c.estado,
      fecha:       c.fecha.toISOString().slice(0, 10),
      comprobante: (c as unknown as { comprobante?: string | null }).comprobante ?? null,
    }
  })

  // helpers para construir URLs de filtros conservando otros params
  const buildUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams({ page: String(pageNum), estado, conComprobante })
    Object.entries(overrides).forEach(([k, v]) => p.set(k, v))
    return `/admin/pagos?${p.toString()}`
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-pink-500" /> Pagos — Servicios
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Registro de cobros de citas del salón</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total recibido</p>
            <p className="text-xl font-black text-green-600">${totalRecibido.toLocaleString()} MXN</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Transferencias por verificar</p>
            <p className="text-xl font-black text-amber-600">{kpiPorVerificar}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Saldo por cobrar al llegar</p>
            <p className="text-xl font-black text-orange-600">${totalSaldoPend.toLocaleString()} MXN</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Estado */}
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 text-xs font-semibold">
          {[
            { label: "Todos",       value: "todos"     },
            { label: "Por verificar", value: "PENDIENTE" },
            { label: "Confirmadas", value: "CONFIRMADA" },
            { label: "Completadas", value: "COMPLETADA" },
          ].map(opt => (
            <Link
              key={opt.value}
              href={buildUrl({ estado: opt.value, page: "1" })}
              className={`px-3 py-1.5 rounded-lg transition ${
                estado === opt.value
                  ? "bg-pink-600 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>

        {/* Solo con comprobante */}
        <Link
          href={buildUrl({ conComprobante: soloComp ? "no" : "si", page: "1" })}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
            soloComp
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-400"
          }`}
        >
          <FileImage className="w-3.5 h-3.5" />
          Solo con comprobante
        </Link>

        <span className="ml-auto text-xs text-gray-400">
          {total} registro{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-rose-900 dark:bg-rose-950 text-white">
            <tr>
              {["Cliente", "Servicio", "Anticipo / Pago", "Saldo al llegar", "Tipo", "Método", "Estado", "Fecha", "Comprobante"].map(h => (
                <th key={h} className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {pagos.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-16 text-gray-400 text-sm">
                  No hay registros con los filtros actuales
                </td>
              </tr>
            ) : (
              pagos.map(p => (
                <tr key={p.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 dark:text-white">{p.cliente}</p>
                    {p.telefono && <p className="text-xs text-gray-400">{p.telefono}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.servicio}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                    ${p.montoAnticipo.toLocaleString()} MXN
                  </td>
                  <td className="px-4 py-3">
                    {p.saldoPendiente > 0 ? (
                      <span className="font-black text-orange-600 dark:text-orange-400">
                        ${p.saldoPendiente.toLocaleString()} MXN
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      p.tipo === "ANTICIPO"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                      {p.tipo === "ANTICIPO" ? "Anticipo" : "Completo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                      {p.metodo === "TRANSFERENCIA"
                        ? <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        : <Banknote className="w-3.5 h-3.5 text-green-500" />}
                      {METODO_LABEL[p.metodo] || p.metodo}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.estadoPago === "POR_VERIFICAR" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full w-fit whitespace-nowrap">
                        <Clock className="w-3 h-3" /> Por verificar
                      </span>
                    )}
                    {p.estadoPago === "ANTICIPO_VERIFICADO" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full w-fit whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" /> Anticipo ✓
                      </span>
                    )}
                    {p.estadoPago === "COMPLETADO" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full w-fit whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" /> Liquidado
                      </span>
                    )}
                    {p.estadoCita === "CANCELADA" && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full w-fit whitespace-nowrap">
                        <XCircle className="w-3 h-3" /> Cancelado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{p.fecha}</td>
                  <td className="px-4 py-3">
                    {p.comprobante ? (
                      <div className="flex flex-col gap-2">
                        <a
                          href={p.comprobante}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold whitespace-nowrap"
                        >
                          <FileImage className="w-3.5 h-3.5" /> Ver
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        {p.estadoPago === "POR_VERIFICAR" && (
                          <PagoAccionesClient citaId={p.id} />
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Página {pageNum} de {totalPages} · {total} registros
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={buildUrl({ page: String(pageNum - 1) })}
              aria-disabled={pageNum <= 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                pageNum <= 1
                  ? "pointer-events-none opacity-40 border-gray-200 dark:border-gray-700 text-gray-400"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Anterior
            </Link>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                // Mostrar páginas cercanas a la actual
                let p: number
                if (totalPages <= 7) {
                  p = i + 1
                } else if (pageNum <= 4) {
                  p = i + 1
                } else if (pageNum >= totalPages - 3) {
                  p = totalPages - 6 + i
                } else {
                  p = pageNum - 3 + i
                }
                return (
                  <Link
                    key={p}
                    href={buildUrl({ page: String(p) })}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                      p === pageNum
                        ? "bg-pink-600 text-white"
                        : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {p}
                  </Link>
                )
              })}
            </div>

            <Link
              href={buildUrl({ page: String(pageNum + 1) })}
              aria-disabled={pageNum >= totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold transition ${
                pageNum >= totalPages
                  ? "pointer-events-none opacity-40 border-gray-200 dark:border-gray-700 text-gray-400"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Siguiente <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
