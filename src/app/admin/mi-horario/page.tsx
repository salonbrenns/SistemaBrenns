"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Clock, Loader2, Users, Calendar, AlertCircle } from "lucide-react"

const DIAS = [
  { id: 1, label: "Lunes"     },
  { id: 2, label: "Martes"    },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves"    },
  { id: 5, label: "Viernes"   },
  { id: 6, label: "Sábado"    },
]

type EmpleadoLista = { id: number; nombre: string; correo: string; rol: string }
type HorarioResuelto = {
  usuario:       { nombre: string; correo: string; rol: string }
  dias:          number[]
  horarioPorDia: Record<number, string[]>
}

export default function MiHorarioPage() {
  const { data: session } = useSession()
  const role   = (session?.user as { role?: string })?.role
  const userId = (session?.user as { id?: string })?.id
  const esAdmin = role === "ADMIN"

  const [empleados,       setEmpleados]       = useState<EmpleadoLista[]>([])
  const [empleadoSel,     setEmpleadoSel]     = useState<number | null>(null)
  const [cargandoEmps,    setCargandoEmps]    = useState(false)
  const [horario,         setHorario]         = useState<HorarioResuelto | null>(null)
  const [cargandoHorario, setCargandoHorario] = useState(false)
  const [diaActivo,       setDiaActivo]       = useState<number | null>(null)
  const [error,           setError]           = useState("")

  // ✅ setState dentro de función async interna, no en el cuerpo síncrono del effect
  useEffect(() => {
    if (!esAdmin) return
    let activo = true

    async function cargarEmpleados() {
      setCargandoEmps(true)
      try {
        const r    = await fetch("/api/admin/empleados/lista")
        const data = await r.json()
        if (!activo) return
        setEmpleados(Array.isArray(data) ? data : [])
      } catch {
        // ignorar error de red
      } finally {
        if (activo) setCargandoEmps(false)
      }
    }

    cargarEmpleados()
    return () => { activo = false }
  }, [esAdmin])

  useEffect(() => {
    const id = esAdmin ? empleadoSel : userId ? parseInt(userId) : null
    if (!id) return

    let activo = true

    async function cargarHorario() {
      setCargandoHorario(true)
      setHorario(null)
      setDiaActivo(null)
      setError("")
      try {
        const r    = await fetch(`/api/admin/empleados/${id}/horario-resuelto`)
        const data = await r.json()
        if (!activo) return
        if (data.error) { setError(data.error); return }
        setHorario(data)
        const sorted = [...(data.dias as number[])].sort((a, b) => a - b)
        if (sorted.length > 0) setDiaActivo(sorted[0])
      } catch {
        if (activo) setError("Error al cargar el horario")
      } finally {
        if (activo) setCargandoHorario(false)
      }
    }

    cargarHorario()
    return () => { activo = false }
  }, [empleadoSel, userId, esAdmin])

  const totalSlots = horario
    ? Object.values(horario.horarioPorDia).reduce((acc, h) => acc + h.length, 0)
    : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <Clock className="w-6 h-6 text-pink-500" />
          {esAdmin ? "Horario por empleado" : "Mi horario"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {esAdmin ? "Consulta el horario efectivo de cada especialista" : "Tu horario semanal asignado"}
        </p>
      </div>

      {esAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 p-5 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-pink-400" /> Seleccionar empleado
          </p>
          {cargandoEmps ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando empleados...
            </div>
          ) : empleados.length === 0 ? (
            <p className="text-sm text-gray-400">No hay empleados registrados</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {empleados.map(emp => (
                <button key={emp.id} onClick={() => setEmpleadoSel(emp.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
                    empleadoSel === emp.id ? "bg-pink-600 text-white border-pink-600 shadow-sm" : "bg-white text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-pink-300"
                  }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    empleadoSel === emp.id ? "bg-pink-500 text-white" : "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
                  }`}>
                    {emp.nombre.charAt(0).toUpperCase()}
                  </span>
                  {emp.nombre.split(" ")[0]}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    empleadoSel === emp.id ? "bg-pink-500 text-white"
                      : emp.rol === "ADMIN" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                  }`}>{emp.rol}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {esAdmin && !empleadoSel && !cargandoHorario && (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Selecciona un empleado</p>
          <p className="text-sm mt-1">para ver su horario semanal</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {cargandoHorario && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
        </div>
      )}

      {horario && !cargandoHorario && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 p-5 shadow-sm flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {horario.usuario.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 dark:text-white">{horario.usuario.nombre}</p>
              <p className="text-xs text-gray-400 truncate">{horario.usuario.correo}</p>
            </div>
            <div className="text-center px-4 border-l border-pink-100">
              <p className="text-2xl font-bold text-pink-600">{horario.dias.length}</p>
              <p className="text-xs text-gray-400">días activos</p>
            </div>
            <div className="text-center px-4 border-l border-pink-100">
              <p className="text-2xl font-bold text-pink-600">{totalSlots}</p>
              <p className="text-xs text-gray-400">slots / semana</p>
            </div>
          </div>

          {horario.dias.length === 0 ? (
            <div className="text-center py-16 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-pink-100">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin días asignados</p>
              <p className="text-sm mt-1">
                {esAdmin ? "Asigna días desde Horarios → Días por empleado" : "Contacta al administrador"}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-pink-50 overflow-x-auto">
                {[...horario.dias].sort((a, b) => a - b).map(diaId => {
                  const dia   = DIAS.find(d => d.id === diaId)
                  const horas = horario.horarioPorDia[diaId] ?? []
                  return (
                    <button key={diaId} onClick={() => setDiaActivo(diaId)}
                      className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all flex flex-col items-center gap-1 ${
                        diaActivo === diaId ? "border-pink-600 text-pink-600 bg-pink-50" : "border-transparent text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:bg-pink-50/40"
                      }`}>
                      {dia?.label}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        diaActivo === diaId ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-500 dark:text-gray-400"
                      }`}>{horas.length} slots</span>
                    </button>
                  )
                })}
              </div>

              {diaActivo !== null && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      {DIAS.find(d => d.id === diaActivo)?.label}
                    </p>
                    <span className="text-xs text-gray-400">
                      {(horario.horarioPorDia[diaActivo] ?? []).length} horarios disponibles
                    </span>
                  </div>
                  {(horario.horarioPorDia[diaActivo] ?? []).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Sin horarios para este día</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {(horario.horarioPorDia[diaActivo] ?? []).map(hora => (
                        <div key={hora} className="flex items-center justify-center px-2 py-3 rounded-xl border-2 border-pink-200 bg-pink-50">
                          <span className="text-sm font-bold text-pink-700">{hora}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="px-6 pb-6">
                <div className="border-t border-pink-50 pt-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Resumen semanal</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[...horario.dias].sort((a, b) => a - b).map(diaId => {
                      const dia   = DIAS.find(d => d.id === diaId)
                      const horas = horario.horarioPorDia[diaId] ?? []
                      return (
                        <button key={diaId} onClick={() => setDiaActivo(diaId)}
                          className={`rounded-xl p-3 text-center border transition-all ${
                            diaActivo === diaId ? "border-pink-400 bg-pink-50" : "border-gray-100 bg-gray-50 dark:bg-gray-900 hover:border-pink-200"
                          }`}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{dia?.label.slice(0, 3)}</p>
                          <p className="text-xl font-bold text-pink-600">{horas.length}</p>
                          <p className="text-[10px] text-gray-400">slots</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}