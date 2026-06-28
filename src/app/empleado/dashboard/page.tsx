"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { CalendarCheck, Clock, Bell, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

type Stats = {
  citasHoy: number
  citasPendientes: number
  proximaCita: { hora: string; usuario: { nombre: string } | null } | null
}

export default function EmpleadoDashboard() {
  const { data: session } = useSession()
  const nombre = session?.user?.name ?? "Empleada"

  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch("/api/empleado/stats")
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => setStats({ citasHoy: 0, citasPendientes: 0, proximaCita: null }))
  }, [])

  const accesos = [
    {
      label: "Agendar cita",
      href:  "/empleado/agendar",
      icon:  Calendar,
      color: "bg-pink-100 text-pink-700",
      desc:  "Registrar una nueva cita para un cliente",
    },
    {
      label: "Mis citas",
      href:  "/empleado/citas",
      icon:  CalendarCheck,
      color: "bg-rose-100 text-rose-700",
      desc:  "Ver y gestionar las citas asignadas",
    },
    {
      label: "Mi horario",
      href:  "/empleado/mi-horario",
      icon:  Clock,
      color: "bg-fuchsia-100 text-fuchsia-700",
      desc:  "Consultar tu disponibilidad semanal",
    },
    {
      label: "Notificaciones",
      href:  "/empleado/notificaciones",
      icon:  Bell,
      color: "bg-purple-100 text-purple-700",
      desc:  "Alertas y recordatorios de citas",
    },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Saludo */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">
          Hola, {nombre.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString("es-MX", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </p>
      </div>

      {/* Tarjetas de stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Citas hoy */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">
              {stats === null ? "—" : stats.citasHoy}
            </p>
            <p className="text-xs text-pink-100 mt-0.5">Citas hoy</p>
          </div>
        </div>

        {/* Próxima cita */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-pink-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {stats === null ? "—" : stats.proximaCita ? stats.proximaCita.hora : "–"}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {stats?.proximaCita
                ? stats.proximaCita.usuario?.nombre ?? "Cliente walk-in"
                : "Sin citas pendientes"}
            </p>
          </div>
        </div>

        {/* Pendientes de confirmar */}
        <div className={`rounded-2xl p-5 border shadow-sm flex items-center gap-4 ${
          stats && stats.citasPendientes > 0
            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
            : "bg-white dark:bg-gray-800 border-pink-100 dark:border-gray-700"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            stats && stats.citasPendientes > 0
              ? "bg-amber-100 dark:bg-amber-900/30"
              : "bg-gray-100 dark:bg-gray-700"
          }`}>
            <AlertCircle className={`w-6 h-6 ${
              stats && stats.citasPendientes > 0
                ? "text-amber-500"
                : "text-gray-400 dark:text-gray-500"
            }`} />
          </div>
          <div>
            <p className={`text-xl font-bold ${
              stats && stats.citasPendientes > 0
                ? "text-amber-700 dark:text-amber-400"
                : "text-gray-800 dark:text-white"
            }`}>
              {stats === null ? "—" : stats.citasPendientes}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Por confirmar</p>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accesos.map(({ label, href, icon: Icon, color, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-pink-300 dark:hover:border-pink-500 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-white group-hover:text-pink-700 dark:group-hover:text-pink-400 transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
