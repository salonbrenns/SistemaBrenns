"use client"
import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { TrendingUp, CalendarCheck, Users, DollarSign, Loader2, Trophy, Star } from "lucide-react"

type Resumen  = { totalCitasAnio: number; totalIngresosAnio: number; citasHoy: number; clientesTotal: number }
type Mes      = { mes: string; ingresos: number; citas: number }
type Servicio = { nombre: string; citas: number }
type Empleada = { nombre: string; citas: number; ingresos: number }
type Data     = { resumen: Resumen; ingresosPorMes: Mes[]; topServicios: Servicio[]; topEmpleadas: Empleada[] }

const PINKS = ["#db2777","#ec4899","#f472b6","#f9a8d4","#fce7f3"]

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n)

function StatCard({ label, value, Icon, color }: { label: string; value: string | number; Icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/20">
          <Icon className="w-5 h-5 text-pink-500" />
        </div>
      </div>
    </div>
  )
}

export default function ReportesPage() {
  const [data, setData]     = useState<Data | null>(null)
  const [cargando, setCarg] = useState(true)
  const [tab, setTab]       = useState<"ingresos" | "citas">("ingresos")

  useEffect(() => {
    fetch("/api/admin/reportes")
      .then(r => r.json())
      .then(d => { setData(d); setCarg(false) })
  }, [])

  if (cargando) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
    </div>
  )
  if (!data) return null

  const { resumen, ingresosPorMes, topServicios, topEmpleadas } = data

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-pink-500" /> Reportes
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Resumen del año {new Date().getFullYear()}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Citas hoy"             value={resumen.citasHoy}               Icon={CalendarCheck} color="text-pink-600 dark:text-pink-300" />
        <StatCard label="Citas este año"        value={resumen.totalCitasAnio}         Icon={CalendarCheck} color="text-pink-600 dark:text-pink-300" />
        <StatCard label="Ingresos este año"     value={fmt(resumen.totalIngresosAnio)} Icon={DollarSign}    color="text-green-600 dark:text-green-400" />
        <StatCard label="Clientas registradas"  value={resumen.clientesTotal}          Icon={Users}         color="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Gráfica mensual */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 dark:text-white">Últimos 12 meses</h2>
          <div className="flex gap-2">
            {(["ingresos","citas"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                  tab === t
                    ? "bg-pink-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {t === "ingresos" ? "Ingresos" : "Citas"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={ingresosPorMes} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
              tickFormatter={v => tab === "ingresos" ? `$${(v/1000).toFixed(0)}k` : String(v)} />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "none", borderRadius: 12, fontSize: 12, color: "#f9fafb" }}
              formatter={(v) => tab === "ingresos" ? [fmt(Number(v)), "Ingresos"] : [v, "Citas"]}
            />
            <Bar dataKey={tab} radius={[6,6,0,0]} fill="#db2777" maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top servicios */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-pink-500" /> Servicios más solicitados
          </h2>
          {topServicios.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos este año</p>
          ) : (
            <div className="space-y-3">
              {topServicios.map((s, i) => (
                <div key={s.nombre} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-pink-400">#{i+1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{s.nombre}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{s.citas} citas</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(s.citas / topServicios[0].citas) * 100}%`, background: PINKS[i] }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top empleadas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-pink-500" /> Top empleadas del año
          </h2>
          {topEmpleadas.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Sin datos este año</p>
          ) : (
            <div className="space-y-4">
              {topEmpleadas.map((e, i) => (
                <div key={e.nombre} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0 ${
                    i === 0 ? "bg-yellow-100 dark:bg-yellow-900/30"
                    : i === 1 ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-orange-50 dark:bg-orange-900/20"
                  }`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{e.nombre}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{e.citas} citas · {fmt(e.ingresos)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
