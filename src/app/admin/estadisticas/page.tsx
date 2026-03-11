// src/app/admin/estadisticas/page.tsx
"use client"

import { useState, useEffect } from "react"
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from "recharts"
import { TrendingUp, ShoppingBag, Calendar, Users, BarChart2, Table2, Calculator } from "lucide-react"

// ─── PARÁMETROS DEL MODELO LOGÍSTICO ────────────────────────────────────────
const V0 = 12500
const K  = 48000
const r  = 0.14
const C  = (K - V0) / V0

const solucionAnalitica = (t: number) => K / (1 + C * Math.exp(-r * t))

const f = (t: number, V: number) => r * V * (1 - V / K)

const rungeKutta = (t0: number, V0: number, tFinal: number, h = 0.5) => {
  const puntos: { t: number; V: number }[] = [{ t: t0, V: V0 }]
  let t = t0, V = V0
  while (t < tFinal) {
    const k1 = h * f(t, V)
    const k2 = h * f(t + h / 2, V + k1 / 2)
    const k3 = h * f(t + h / 2, V + k2 / 2)
    const k4 = h * f(t + h, V + k3)
    V += (k1 + 2 * k2 + 2 * k3 + k4) / 6
    t = parseFloat((t + h).toFixed(4))
    if (Math.abs(t - Math.round(t)) < 0.01) {
      puntos.push({ t: Math.round(t), V: Math.round(V) })
    }
  }
  return puntos
}

const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
const ruido = [0.93,1.08,0.97,1.11,0.95,1.04,0.99,1.07,0.96,1.10,1.02,0.98,1.06,0.94,1.09,1.01,0.97,1.05]

const historico = Array.from({ length: 18 }, (_, i) => {
  const base = solucionAnalitica(i)
  const total = Math.round(base * ruido[i])
  return {
    mes: i + 1,
    label: `${meses[i % 12]} ${i < 12 ? "Año 1" : "Año 2"}`,
    total,
    servicios: Math.round(total * 0.55),
    productos:  Math.round(total * 0.28),
    cursos:     Math.round(total * 0.17),
    tipo: "histórico"
  }
})

const rkPuntos = rungeKutta(0, V0, 24, 0.5)
const proyeccion = Array.from({ length: 6 }, (_, i) => {
  const t = 18 + i
  const rkPunto = rkPuntos.find(p => p.t === t)
  const total = rkPunto ? Math.round(rkPunto.V) : Math.round(solucionAnalitica(t))
  return {
    mes: t + 1,
    label: `${meses[t % 12]} Año 3`,
    total,
    servicios: Math.round(total * 0.55),
    productos:  Math.round(total * 0.28),
    cursos:     Math.round(total * 0.17),
    tipo: "proyección"
  }
})

const todosLosDatos = [...historico, ...proyeccion]
const fmt = (v?: number) => `$${v?.toLocaleString("es-MX")}`

type KPIs = {
  citasHoy: number
  citasMes: number
  pedidosMes: number
  clientesTotal: number
}

// Tooltip personalizado
const TooltipCustom = ({ active, payload, label }: {
  active?: boolean
  payload?: { payload: typeof historico[0] }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="bg-white border border-pink-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-pink-700 mb-1">{label}</p>
      <p className="text-gray-700">Total: <strong>{fmt(d?.total)}</strong></p>
      <p className="text-pink-500">Servicios: {fmt(d?.servicios)}</p>
      <p className="text-orange-400">Productos: {fmt(d?.productos)}</p>
      <p className="text-blue-400">Cursos: {fmt(d?.cursos)}</p>
      <p className={`mt-1 ${d?.tipo === "proyección" ? "text-green-500" : "text-gray-400"}`}>
        {d?.tipo === "proyección" ? "📈 Proyectado (RK4)" : "📊 Histórico"}
      </p>
    </div>
  )
}

export default function EstadisticasPage() {
  const [tab,       setTab]       = useState<"dashboard" | "matematicas" | "tabla">("dashboard")
  const [filaHover, setFilaHover] = useState<string | null>(null)
  const [kpis,      setKpis]      = useState<KPIs | null>(null)

  useEffect(() => {
    fetch("/api/admin/estadisticas/kpis")
      .then(r => r.json())
      .then(data => setKpis(data))
      .catch(() => {})
  }, [])

  const ultimoHistorico = historico[historico.length - 1]
  const primerProyeccion = proyeccion[0]
  const crecimiento = (((primerProyeccion.total - ultimoHistorico.total) / ultimoHistorico.total) * 100).toFixed(1)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-pink-500" /> Estadísticas y Proyecciones
        </h1>
        <p className="text-sm text-gray-500 mt-1">Modelo predictivo logístico con Runge-Kutta 4° orden</p>
      </div>

      {/* KPIs reales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Citas hoy",      value: kpis?.citasHoy     ?? "—", icon: Calendar,     color: "bg-pink-500"   },
          { label: "Citas este mes", value: kpis?.citasMes     ?? "—", icon: Calendar,     color: "bg-rose-400"   },
          { label: "Pedidos mes",    value: kpis?.pedidosMes   ?? "—", icon: ShoppingBag,  color: "bg-orange-400" },
          { label: "Clientes total", value: kpis?.clientesTotal ?? "—", icon: Users,        color: "bg-blue-400"   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Card principal del modelo */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-pink-100">
          {[
            { id: "dashboard",   label: "📊 Dashboard",   icon: BarChart2   },
            { id: "matematicas", label: "∑ Matemáticas",  icon: Calculator  },
            { id: "tabla",       label: "📋 Datos",        icon: Table2      },
          ].map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id as typeof tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-all ${
                tab === id
                  ? "border-b-2 border-pink-600 text-pink-700 bg-pink-50"
                  : "text-gray-500 hover:text-pink-600 hover:bg-pink-50"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── DASHBOARD ─────────────────────────────────────── */}
          {tab === "dashboard" && (
            <div className="space-y-6">
              {/* KPIs del modelo */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Ventas actuales (mes 18)", value: fmt(ultimoHistorico.total), color: "text-pink-600" },
                  { label: "Proyección próximo mes",   value: fmt(primerProyeccion.total), color: "text-green-600" },
                  { label: "Crecimiento esperado",     value: `+${crecimiento}%`,          color: "text-blue-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-pink-50 rounded-xl p-4 border border-pink-100 text-center">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Gráfica principal */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Curva logística histórica + proyección RK4</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={todosLosDatos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} interval={2} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip content={<TooltipCustom />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <ReferenceLine x={historico[historico.length-1].label} stroke="#db2777" strokeDasharray="4 4" label={{ value: "Hoy", fill: "#db2777", fontSize: 11 }} />
                    <Bar dataKey="servicios" name="Servicios" fill="#f9a8d4" stackId="a" />
                    <Bar dataKey="productos"  name="Productos"  fill="#fdba74" stackId="a" />
                    <Bar dataKey="cursos"     name="Cursos"     fill="#93c5fd" stackId="a" />
                    <Line type="monotone" dataKey="total" name="Total" stroke="#db2777" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfica de área — proyección */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 text-sm">Proyección de ingresos (próximos 6 meses)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={proyeccion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#9ca3af" }} />
                    <Tooltip content={<TooltipCustom />} />
                    <Area type="monotone" dataKey="total" name="Proyección" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ── MATEMÁTICAS ───────────────────────────────────── */}
          {tab === "matematicas" && (
            <div className="space-y-4 max-w-3xl">
              <p className="text-gray-500 text-sm leading-relaxed">
                El modelo predictivo de Brenn&apos;s se fundamenta en la <strong className="text-pink-700">ecuación logística de crecimiento</strong>,
                resuelta analíticamente mediante la Transformada de Laplace y validada con Runge-Kutta 4° orden.
              </p>

              {[
                {
                  titulo: "1. Ecuación Diferencial Ordinaria (EDO)",
                  color: "border-pink-400",
                  titleColor: "text-pink-600",
                  contenido: (
                    <div className="space-y-3">
                      <p className="text-gray-500 text-sm leading-relaxed">
                        El modelo logístico describe el crecimiento de las ventas <em>V(t)</em> en el tiempo <em>t</em> (meses),
                        considerando que el crecimiento desacelera conforme se satura el mercado.
                      </p>
                      <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 font-mono text-center text-pink-800 font-bold">
                        dV/dt = r · V · (1 - V/K)
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[["V(t)", "Ventas mensuales (MXN)"],["r = 0.14", "Tasa de crecimiento 14%"],["K = $48,000", "Capacidad máxima del mercado"],["V₀ = $12,500", "Ventas iniciales"]].map(([v, d]) => (
                          <div key={v} className="bg-gray-50 rounded-lg p-2 text-sm">
                            <span className="font-bold text-pink-600">{v}</span>
                            <span className="text-gray-500"> → {d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                },
                {
                  titulo: "2. Solución Analítica (Transformada de Laplace)",
                  color: "border-orange-400",
                  titleColor: "text-orange-600",
                  contenido: (
                    <div className="space-y-3">
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Aplicando la sustitución <em>u = 1/V</em> (linealización de Bernoulli) y resolviendo
                        con Transformada de Laplace sobre la EDO linealizada:
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 font-mono text-sm text-orange-800 space-y-1">
                        <div className="text-center">Ecuación linealizada: du/dt + r·u = r/K</div>
                        <div className="text-center text-gray-500">s·U(s) - u₀ + r·U(s) = r/(K·s)</div>
                        <div className="text-center font-bold text-orange-700">U(s) = (u₀)/(s+r) + r/(K·s·(s+r))</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 font-mono text-center text-green-800 font-bold">
                        ✓ V(t) = K / (1 + C · e^(−rt)) &nbsp; donde C = {C.toFixed(2)}
                      </div>
                    </div>
                  )
                },
                {
                  titulo: "3. Método Numérico: Runge-Kutta 4° Orden",
                  color: "border-blue-400",
                  titleColor: "text-blue-600",
                  contenido: (
                    <div className="space-y-3">
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Se aplica RK4 con paso <em>h = 0.5</em> meses para validar la solución analítica
                        y generar la proyección de los próximos 6 meses.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 font-mono text-sm text-blue-800 space-y-1">
                        <div>f(t, V) = r · V · (1 − V/K)</div>
                        <div className="text-gray-500">k₁ = h · f(tₙ, Vₙ)</div>
                        <div className="text-gray-500">k₂ = h · f(tₙ + h/2, Vₙ + k₁/2)</div>
                        <div className="text-gray-500">k₃ = h · f(tₙ + h/2, Vₙ + k₂/2)</div>
                        <div className="text-gray-500">k₄ = h · f(tₙ + h, Vₙ + k₃)</div>
                        <div className="font-bold text-blue-700">Vₙ₊₁ = Vₙ + (k₁ + 2k₂ + 2k₃ + k₄) / 6</div>
                      </div>

                      {/* Tabla RK4 */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-blue-50">
                              {["Mes t","Vₙ (RK4)","k₁","k₂","k₃","k₄","Vₙ₊₁"].map(h => (
                                <th key={h} className="text-blue-600 p-2 text-center font-semibold border border-blue-100">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {proyeccion.map((p, i) => {
                              const t = 18 + i
                              const Vn = i === 0 ? historico[17].total : proyeccion[i-1].total
                              const k1 = (0.5 * f(t, Vn)).toFixed(0)
                              const k2 = (0.5 * f(t+0.25, Vn + parseFloat(k1)/2)).toFixed(0)
                              const k3 = (0.5 * f(t+0.25, Vn + parseFloat(k2)/2)).toFixed(0)
                              const k4 = (0.5 * f(t+0.5,  Vn + parseFloat(k3))).toFixed(0)
                              return (
                                <tr key={t} className={i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}>
                                  <td className="text-pink-600 p-2 text-center border border-gray-100 font-bold">{t}</td>
                                  <td className="text-gray-700 p-2 text-center border border-gray-100">${Vn.toLocaleString()}</td>
                                  <td className="text-gray-500 p-2 text-center border border-gray-100">{k1}</td>
                                  <td className="text-gray-500 p-2 text-center border border-gray-100">{k2}</td>
                                  <td className="text-gray-500 p-2 text-center border border-gray-100">{k3}</td>
                                  <td className="text-gray-500 p-2 text-center border border-gray-100">{k4}</td>
                                  <td className="text-green-600 p-2 text-center border border-gray-100 font-bold">${p.total.toLocaleString()}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                },
              ].map(s => (
                <div key={s.titulo} className={`border-l-4 ${s.color} rounded-xl p-5 bg-gray-50 border border-gray-100`}>
                  <h3 className={`font-bold ${s.titleColor} mb-3`}>{s.titulo}</h3>
                  {s.contenido}
                </div>
              ))}
            </div>
          )}

          {/* ── TABLA DE DATOS ─────────────────────────────────── */}
          {tab === "tabla" && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Histórico */}
              <div>
                <h3 className="font-bold text-pink-600 mb-3">📊 Datos Históricos (18 meses)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-pink-50">
                        {["Mes","Periodo","Servicios","Productos","Cursos","Total"].map(h => (
                          <th key={h} className="text-pink-600 p-2 text-center font-semibold border border-pink-100">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((d, i) => (
                        <tr key={i}
                          onMouseEnter={() => setFilaHover(`h${i}`)}
                          onMouseLeave={() => setFilaHover(null)}
                          className={`transition-colors ${filaHover === `h${i}` ? "bg-pink-50" : i%2===0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="text-gray-400 p-2 text-center border border-gray-100">{d.mes}</td>
                          <td className="text-pink-600 p-2 border border-gray-100 text-xs">{d.label}</td>
                          <td className="text-pink-500 p-2 text-right border border-gray-100">${d.servicios.toLocaleString()}</td>
                          <td className="text-orange-400 p-2 text-right border border-gray-100">${d.productos.toLocaleString()}</td>
                          <td className="text-blue-400 p-2 text-right border border-gray-100">${d.cursos.toLocaleString()}</td>
                          <td className="text-gray-800 p-2 text-right border border-gray-100 font-bold">${d.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Proyección */}
              <div>
                <h3 className="font-bold text-green-600 mb-3">📈 Proyección RK4 (6 meses)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-green-50">
                        {["Mes","Periodo","Servicios","Productos","Cursos","Total"].map(h => (
                          <th key={h} className="text-green-600 p-2 text-center font-semibold border border-green-100">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {proyeccion.map((d, i) => (
                        <tr key={i}
                          onMouseEnter={() => setFilaHover(`p${i}`)}
                          onMouseLeave={() => setFilaHover(null)}
                          className={`transition-colors ${filaHover === `p${i}` ? "bg-green-50" : i%2===0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="text-gray-400 p-2 text-center border border-gray-100">{d.mes}</td>
                          <td className="text-green-600 p-2 border border-gray-100">{d.label}</td>
                          <td className="text-pink-500 p-2 text-right border border-gray-100">${d.servicios.toLocaleString()}</td>
                          <td className="text-orange-400 p-2 text-right border border-gray-100">${d.productos.toLocaleString()}</td>
                          <td className="text-blue-400 p-2 text-right border border-gray-100">${d.cursos.toLocaleString()}</td>
                          <td className="text-green-700 p-2 text-right border border-gray-100 font-bold">${d.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Resumen del modelo */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <h4 className="font-bold text-green-700 mb-3 text-sm">Parámetros del Modelo</h4>
                  {[
                    ["V₀ inicial", fmt(V0)],
                    ["Capacidad K", fmt(K)],
                    ["Tasa r", "14% mensual"],
                    ["Constante C", C.toFixed(3)],
                    ["Saturación estimada", "~Mes 30"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-green-100 py-1.5 text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="text-pink-600 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-pink-100 px-6 py-3 flex justify-between text-xs text-gray-400 bg-pink-50/50">
          <span>🌸 Brenn&apos;s — Modelo Logístico Predictivo</span>
          <span>Runge-Kutta 4° orden · r=14% · K=$48,000</span>
        </div>
      </div>
    </div>
  )
}