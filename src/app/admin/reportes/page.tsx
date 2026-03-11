// src/app/admin/reportes/page.tsx
"use client"

import { FileText, Download, Calendar, TrendingUp, ShoppingBag, Users } from "lucide-react"

const REPORTES = [
  { titulo: "Reporte de citas",       desc: "Historial completo de citas por período", icon: Calendar,    color: "bg-pink-500"   },
  { titulo: "Reporte de ventas",      desc: "Ingresos por productos y servicios",      icon: TrendingUp,  color: "bg-orange-400" },
  { titulo: "Reporte de pedidos",     desc: "Pedidos realizados y su estado",          icon: ShoppingBag, color: "bg-blue-400"   },
  { titulo: "Reporte de clientes",    desc: "Listado de clientes registrados",         icon: Users,       color: "bg-green-500"  },
]

export default function ReportesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" /> Reportes
        </h1>
        <p className="text-sm text-gray-500 mt-1">Genera y descarga reportes del negocio</p>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-700 mb-4 text-sm">Filtrar por período</h3>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Desde</label>
            <input type="date" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hasta</label>
            <input type="date" className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
          </div>
          <div className="flex gap-2">
            {["Esta semana", "Este mes", "Este año"].map(p => (
              <button key={p} className="px-3 py-2 text-xs font-semibold border border-pink-200 text-pink-600 rounded-xl hover:bg-pink-50 transition">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards de reportes */}
      <div className="grid sm:grid-cols-2 gap-4">
        {REPORTES.map(({ titulo, desc, icon: Icon, color }) => (
          <div key={titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:border-pink-200 transition">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 border border-pink-200 text-pink-600 rounded-xl hover:bg-pink-100 transition text-xs font-semibold">
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
        ⚠️ Esta sección está en desarrollo. La generación de PDFs estará disponible próximamente.
      </p>
    </div>
  )
}