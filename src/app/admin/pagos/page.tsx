import { prisma } from "@/lib/prisma"
import { CreditCard, Banknote, ArrowRight, CheckCircle, Clock, XCircle, AlertCircle, ExternalLink } from "lucide-react"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Pagos — Servicios" }

/**
 * Detecta si la cita es anticipo o pago completo.
 * Primero usa el campo `total` (guardado desde el formulario).
 * Si no existe (registros viejos), cae al regex en notas.
 */
function detectarTipo(
  total: number | null,
  notas: string | null,
  precioServicio: number
): { montoAnticipo: number; tipo: "ANTICIPO" | "COMPLETO" } {
  // 1. Usar campo total si está guardado
  if (total !== null && total > 0) {
    // Si pagó menos del 99% del precio → es anticipo
    const esAnticipo = total < precioServicio * 0.99
    return { montoAnticipo: total, tipo: esAnticipo ? "ANTICIPO" : "COMPLETO" }
  }

  // 2. Fallback: regex en notas (registros anteriores)
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

export default async function PagosPage() {
  const citasRaw = await prisma.cita.findMany({
    where:   { estado: { not: "CANCELADA" } },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      usuario:  { select: { nombre: true, telefono: true } },
    },
    orderBy: { fecha: "desc" },
    take: 200,
  })
  // comprobante is included via the spread below

  const pagos = citasRaw.map(c => {
    const precioServicio = Number(c.servicio.precio)
    const totalGuardado  = c.total ? Number(c.total) : null
    const { montoAnticipo, tipo } = detectarTipo(totalGuardado, c.notas, precioServicio)
    const saldoPendiente = tipo === "ANTICIPO" ? precioServicio - montoAnticipo : 0

    // estadoPago: basado en el estado de la cita + método de pago
    // PENDIENTE = el admin aún no ha revisado/confirmado (transferencia no verificada)
    // CONFIRMADA = admin revisó y confirmó (transferencia OK)
    // COMPLETADA = la cita ya se realizó
    const estadoPago: "POR_VERIFICAR" | "ANTICIPO_VERIFICADO" | "COMPLETADO" =
      c.estado === "PENDIENTE"   ? "POR_VERIFICAR" :
      c.estado === "COMPLETADA"  ? "COMPLETADO"    :
      tipo === "ANTICIPO"        ? "ANTICIPO_VERIFICADO" :
                                   "COMPLETADO"

    return {
      id:              c.id,
      cliente:         c.usuario?.nombre || c.nombre_contacto || "Sin nombre",
      telefono:        c.usuario?.telefono || c.telefono_contacto || null,
      servicio:        c.servicio.nombre,
      montoAnticipo,
      saldoPendiente,
      tipo,
      metodo:          c.metodo_pago || "EFECTIVO",
      estadoPago,
      estadoCita:      c.estado,
      fecha:           c.fecha.toISOString().slice(0, 10),
      comprobante:     (c as unknown as { comprobante?: string | null }).comprobante ?? null,
    }
  })

  // KPIs
  const totalRecibido    = pagos.reduce((s, p) => s + p.montoAnticipo, 0)
  const porVerificar     = pagos.filter(p => p.estadoPago === "POR_VERIFICAR").length
  const totalSaldoPend   = pagos
    .filter(p => p.estadoPago === "ANTICIPO_VERIFICADO" && p.saldoPendiente > 0)
    .reduce((s, p) => s + p.saldoPendiente, 0)

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
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total recibido</p>
            <p className="text-xl font-black text-green-600">${totalRecibido.toLocaleString()} MXN</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Transferencias por verificar</p>
            <p className="text-xl font-black text-amber-600">{porVerificar}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-400 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Saldo por cobrar al llegar</p>
            <p className="text-xl font-black text-orange-600">${totalSaldoPend.toLocaleString()} MXN</p>
          </div>
        </div>
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
                <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                  No hay pagos registrados aún
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
                      <a
                        href={p.comprobante}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium whitespace-nowrap"
                      >
                        Ver <ExternalLink className="w-3 h-3" />
                      </a>
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
    </div>
  )
}
