// src/app/admin/pagos/page.tsx
"use client"

import { CreditCard, Banknote, ArrowRight, CheckCircle, Clock, XCircle, Search } from "lucide-react"

const PAGOS_DEMO = [
  { id: 1, cliente: "Ana García",    servicio: "Manicure",    monto: 250,  metodo: "EFECTIVO",      estado: "PAGADO",    fecha: "2026-03-10" },
  { id: 2, cliente: "Benilde López", servicio: "Pedicure",    monto: 180,  metodo: "TRANSFERENCIA", estado: "PAGADO",    fecha: "2026-03-10" },
  { id: 3, cliente: "María Ruiz",    servicio: "Uñas gel",    monto: 350,  metodo: "TARJETA",       estado: "PENDIENTE", fecha: "2026-03-11" },
  { id: 4, cliente: "Lucía Morales", servicio: "Extensiones", monto: 600,  metodo: "EFECTIVO",      estado: "PAGADO",    fecha: "2026-03-09" },
  { id: 5, cliente: "Sofia Torres",  servicio: "Manicure",    monto: 250,  metodo: "TRANSFERENCIA", estado: "CANCELADO", fecha: "2026-03-08" },
]

const METODO_ICON: Record<string, React.ReactNode> = {
  EFECTIVO:      <Banknote className="w-4 h-4 text-green-500" />,
  TRANSFERENCIA: <ArrowRight className="w-4 h-4 text-blue-500" />,
  TARJETA:       <CreditCard className="w-4 h-4 text-purple-500" />,
}

const ESTADO_STYLE: Record<string, string> = {
  PAGADO:    "bg-green-100 text-green-700",
  PENDIENTE: "bg-yellow-100 text-yellow-700",
  CANCELADO: "bg-red-100 text-red-700",
}

const ESTADO_ICON: Record<string, React.ReactNode> = {
  PAGADO:    <CheckCircle className="w-3.5 h-3.5" />,
  PENDIENTE: <Clock className="w-3.5 h-3.5" />,
  CANCELADO: <XCircle className="w-3.5 h-3.5" />,
}

export default function PagosPage() {
  const total = PAGOS_DEMO.filter(p => p.estado === "PAGADO").reduce((a, p) => a + p.monto, 0)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-pink-500" /> Pagos
        </h1>
        <p className="text-sm text-gray-500 mt-1">Historial de pagos de citas y servicios</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Cobrado hoy",    value: `$${total.toLocaleString()}`, color: "bg-green-500"  },
          { label: "Pendientes",     value: PAGOS_DEMO.filter(p => p.estado === "PENDIENTE").length, color: "bg-yellow-400" },
          { label: "Cancelados",     value: PAGOS_DEMO.filter(p => p.estado === "CANCELADO").length, color: "bg-red-400"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
              {value}
            </div>
            <p className="text-sm font-semibold text-gray-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input placeholder="Buscar cliente..." className="w-full pl-9 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 border-b border-pink-100">
            <tr>
              {["Cliente","Servicio","Monto","Método","Estado","Fecha"].map(h => (
                <th key={h} className="text-left text-pink-600 font-semibold px-4 py-3 text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAGOS_DEMO.map((p, i) => (
              <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <td className="px-4 py-3 font-semibold text-gray-800">{p.cliente}</td>
                <td className="px-4 py-3 text-gray-600">{p.servicio}</td>
                <td className="px-4 py-3 font-bold text-pink-600">${p.monto.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    {METODO_ICON[p.metodo]} {p.metodo}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ${ESTADO_STYLE[p.estado]}`}>
                    {ESTADO_ICON[p.estado]} {p.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
        ⚠️ Esta sección muestra datos de ejemplo. Se conectará a la base de datos próximamente.
      </p>
    </div>
  )
}