// src/app/admin/pagos/page.tsx
import { prisma } from "@/lib/prisma"
import { CreditCard, Banknote, ArrowRight, CheckCircle, Clock, XCircle } from "lucide-react"
import { Metadata } from "next"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Pagos — Servicios" }

// Extrae el monto cobrado de las notas (anticipo o completo)
function parsearMonto(notas: string | null, precioServicio: number): { monto: number; tipo: string } {
  if (!notas) return { monto: precioServicio, tipo: "COMPLETO" }

  const matchAnticipo = notas.match(/\[ANTICIPO 50%:\s*\$([0-9,]+)/)
  if (matchAnticipo) {
    const monto = Number(matchAnticipo[1].replace(/,/g, ""))
    return { monto: isNaN(monto) ? precioServicio * 0.5 : monto, tipo: "ANTICIPO" }
  }

  const matchCompleto = notas.match(/\[PAGO COMPLETO:\s*\$([0-9,]+)/)
  if (matchCompleto) {
    const monto = Number(matchCompleto[1].replace(/,/g, ""))
    return { monto: isNaN(monto) ? precioServicio : monto, tipo: "COMPLETO" }
  }

  return { monto: precioServicio, tipo: "COMPLETO" }
}

const METODO_LABEL: Record<string, string> = {
  EFECTIVO:      "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA:       "Tarjeta",
}

export default async function PagosPage() {
  const citasRaw = await prisma.cita.findMany({
    where: {
      estado: { not: "CANCELADA" },
    },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      usuario:  { select: { nombre: true, telefono: true } },
    },
    orderBy: { fecha: "desc" },
    take: 200,
  })

  const pagos = citasRaw.map(c => {
    const precio = Number(c.servicio.precio)
    const { monto, tipo } = parsearMonto(c.notas, precio)
    const estadoPago = c.estado === "PENDIENTE" ? "POR_VERIFICAR"
                     : c.estado === "CANCELADA"  ? "CANCELADO"
                     : "COBRADO"
    return {
      id:          c.id,
      cliente:     c.usuario?.nombre || c.nombre_contacto || "Sin nombre",
      telefono:    c.usuario?.telefono || c.telefono_contacto || null,
      servicio:    c.servicio.nombre,
      monto,
      tipo,        // ANTICIPO | COMPLETO
      metodo:      c.metodo_pago || "EFECTIVO",
      estadoPago,
      estadoCita:  c.estado,
      fecha:       c.fecha.toISOString().slice(0, 10),
      notas:       c.notas,
    }
  })

  const totalCobrado  = pagos.filter(p => p.estadoPago === "COBRADO").reduce((s, p) => s + p.monto, 0)
  const porVerificar  = pagos.filter(p => p.estadoPago === "POR_VERIFICAR").length
  const anticipos     = pagos.filter(p => p.tipo === "ANTICIPO" && p.estadoPago === "COBRADO").length

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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total cobrado</p>
            <p className="text-xl font-black text-green-600">${totalCobrado.toLocaleString()} MXN</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Por verificar</p>
            <p className="text-xl font-black text-amber-600">{porVerificar} transferencia{porVerificar !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-400 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Anticipos cobrados</p>
            <p className="text-xl font-black text-blue-600">{anticipos}</p>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-rose-900 dark:bg-rose-950 text-white">
              <tr>
                {["Cliente", "Servicio", "Monto cobrado", "Tipo", "Método", "Estado", "Fecha"].map(h => (
                  <th key={h} className="text-left font-semibold px-4 py-3 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {pagos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
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
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">${p.monto.toLocaleString()} MXN</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.tipo === "ANTICIPO" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
                        {p.tipo === "ANTICIPO" ? "Anticipo 50%" : "Pago completo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        {p.metodo === "TRANSFERENCIA" ? <ArrowRight className="w-3.5 h-3.5 text-blue-400" /> : <Banknote className="w-3.5 h-3.5 text-green-500" />}
                        {METODO_LABEL[p.metodo] || p.metodo}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.estadoPago === "COBRADO" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full w-fit">
                          <CheckCircle className="w-3 h-3" /> Cobrado
                        </span>
                      )}
                      {p.estadoPago === "POR_VERIFICAR" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full w-fit">
                          <Clock className="w-3 h-3" /> Por verificar
                        </span>
                      )}
                      {p.estadoPago === "CANCELADO" && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full w-fit">
                          <XCircle className="w-3 h-3" /> Cancelado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{p.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
    </div>
  )
}
