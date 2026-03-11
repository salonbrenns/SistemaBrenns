// src/app/admin/promociones/page.tsx
"use client"

import { useState } from "react"
import { Tag, Plus, Percent, Calendar, ToggleLeft, ToggleRight, Trash2, Edit } from "lucide-react"

const PROMOCIONES_DEMO = [
  { id: 1, nombre: "Descuento Primavera", tipo: "SERVICIO", descuento: 20, inicio: "2026-03-01", fin: "2026-03-31", activo: true, codigo: "" },
  { id: 2, nombre: "10OFF", tipo: "CODIGO", descuento: 10, inicio: "2026-03-01", fin: "2026-04-30", activo: true, codigo: "10OFF" },
  { id: 3, nombre: "Liquidación productos", tipo: "PRODUCTO", descuento: 15, inicio: "2026-02-01", fin: "2026-02-28", activo: false, codigo: "" },
]

export default function PromocionesPage() {
  const [tab, setTab] = useState<"lista" | "nueva">("lista")
  const [promos] = useState(PROMOCIONES_DEMO)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-pink-500" /> Promociones
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona descuentos y códigos promocionales</p>
        </div>
        <button onClick={() => setTab("nueva")}
          className="flex items-center gap-2 bg-pink-600 text-white font-bold px-5 py-2.5 rounded-full hover:bg-pink-700 transition text-sm">
          <Plus className="w-4 h-4" /> Nueva promoción
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-100">
        {[{ id: "lista", label: "Lista de promociones" }, { id: "nueva", label: "Crear nueva" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === t.id ? "border-pink-600 text-pink-700" : "border-transparent text-gray-400 hover:text-pink-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lista" && (
        <div className="space-y-4">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Activas", count: promos.filter(p => p.activo).length, color: "bg-green-500" },
              { label: "Vencidas", count: promos.filter(p => !p.activo).length, color: "bg-gray-400" },
              { label: "Total", count: promos.length, color: "bg-pink-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold`}>{count}</div>
                <p className="text-sm font-semibold text-gray-600">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-pink-50 border-b border-pink-100">
                <tr>
                  {["Nombre","Tipo","Descuento","Código","Vigencia","Estado","Acciones"].map(h => (
                    <th key={h} className="text-left text-pink-600 font-semibold px-4 py-3 text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map((p, i) => (
                  <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    <td className="px-4 py-3 font-semibold text-gray-800">{p.nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        p.tipo === "SERVICIO" ? "bg-pink-100 text-pink-700" :
                        p.tipo === "PRODUCTO" ? "bg-orange-100 text-orange-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>{p.tipo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-pink-600 font-bold">
                        <Percent className="w-3 h-3" />{p.descuento}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.codigo || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.inicio} → {p.fin}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.activo
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><ToggleRight className="w-4 h-4" /> Activa</span>
                        : <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><ToggleLeft className="w-4 h-4" /> Inactiva</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "nueva" && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 max-w-xl">
          <h2 className="font-bold text-gray-800 mb-5">Nueva promoción</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la promoción</label>
              <input placeholder="Ej. Descuento de Verano"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                  <option>SERVICIO</option>
                  <option>PRODUCTO</option>
                  <option>CODIGO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descuento (%)</label>
                <input type="number" placeholder="10" min={1} max={100}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código (opcional)</label>
              <input placeholder="Ej. VERANO2026"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha inicio</label>
                <input type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha fin</label>
                <input type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-4">
                ⚠️ Esta sección está en desarrollo. Las promociones aún no se aplican automáticamente.
              </p>
              <button className="w-full bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition">
                Guardar promoción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}