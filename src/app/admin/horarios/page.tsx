"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Clock, Plus, Trash2, Loader2, Check, Users,
  Calendar, ChevronDown, ChevronUp, X, AlertCircle
} from "lucide-react"
export const dynamic = 'force-dynamic'

const DIAS = [
  { id: 1, label: "Lunes",     short: "Lu" },
  { id: 2, label: "Martes",    short: "Ma" },
  { id: 3, label: "Miércoles", short: "Mi" },
  { id: 4, label: "Jueves",    short: "Ju" },
  { id: 5, label: "Viernes",   short: "Vi" },
  { id: 6, label: "Sábado",    short: "Sá" },
]

const HORAS_SUGERIDAS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
]

type Horario   = { id: number; hora: string; diaSemana: number; activo: boolean }
type Empleado  = { id: number; nombre: string; correo: string; rol: string; dias: number[] }
type Excepcion = {
  id:         number
  hora:       string
  tipo:       "QUITAR" | "AGREGAR"
  dia_semana: number | null
  fecha:      string | null
}

function HorasEmpleado({
  empId,
  diaId,
  horasGlobales,
}: {
  empId:         number
  diaId:         number
  horasGlobales: Horario[]
}) {
  const [excepciones, setExcepciones] = useState<Excepcion[]>([])
  const [cargando,    setCargando]    = useState(true)
  const [nuevaHora,   setNuevaHora]   = useState("")
  const [nuevaFecha,  setNuevaFecha]  = useState("")
  const [modoFecha,   setModoFecha]   = useState(false)
  const [guardando,   setGuardando]   = useState<string>("")

  const horasDia = horasGlobales
    .filter(h => h.diaSemana === diaId && h.activo)
    .map(h => h.hora)
    .sort()

  // ✅ useCallback evita el setState-in-effect
  const cargar = useCallback(async () => {
    setCargando(true)
    const res  = await fetch(`/api/admin/empleados/${empId}/horas`)
    const data: Excepcion[] = await res.json()
    setExcepciones(data)
    setCargando(false)
  }, [empId])

useEffect(() => {
    cargar()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const excDia   = excepciones.filter(e => e.dia_semana === diaId)
  const quitadas = new Set(excDia.filter(e => e.tipo === "QUITAR").map(e => e.hora))
  const agregadas = excDia.filter(e => e.tipo === "AGREGAR").map(e => e.hora)

  const horasEfectivas = [
    ...horasDia.filter(h => !quitadas.has(h)),
    ...agregadas,
  ].sort()

  const toggleQuitar = async (hora: string) => {
    setGuardando(hora)
    const yaQuitada = quitadas.has(hora)
    if (yaQuitada) {
      const exc = excDia.find(e => e.hora === hora && e.tipo === "QUITAR")
      if (exc) {
        await fetch(`/api/admin/empleados/${empId}/horas`, {
          method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: exc.id }),
        })
      }
    } else {
      await fetch(`/api/admin/empleados/${empId}/horas`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora, tipo: "QUITAR", dia_semana: diaId }),
      })
    }
    await cargar()
    setGuardando("")
  }

  const agregarHoraExtra = async () => {
    if (!nuevaHora) return
    setGuardando("nueva")
    const body: Record<string, unknown> = { hora: nuevaHora, tipo: "AGREGAR" }
    if (modoFecha && nuevaFecha) { body.fecha = nuevaFecha }
    else { body.dia_semana = diaId }
    await fetch(`/api/admin/empleados/${empId}/horas`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    setNuevaHora("")
    setNuevaFecha("")
    await cargar()
    setGuardando("")
  }

  const eliminarExcepcion = async (id: number) => {
    await fetch(`/api/admin/empleados/${empId}/horas`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    await cargar()
  }

  if (cargando) return (
    <div className="flex justify-center py-4">
      <Loader2 className="w-5 h-5 text-pink-400 animate-spin" />
    </div>
  )

  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          Horas efectivas — {DIAS.find(d => d.id === diaId)?.label}
          <span className="font-normal normal-case tracking-normal text-gray-300">
            ({horasEfectivas.length} horas)
          </span>
        </p>

        {horasDia.length === 0 ? (
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            No hay horario global configurado para este día
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {horasDia.map(hora => {
              const quitada = quitadas.has(hora)
              const cargandoEsta = guardando === hora
              return (
                <button key={hora} onClick={() => toggleQuitar(hora)} disabled={!!guardando}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    quitada
                      ? "border-red-200 bg-red-50 text-red-400 line-through opacity-70"
                      : "border-pink-200 bg-pink-50 text-pink-700 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                  }`}>
                  {cargandoEsta ? <Loader2 className="w-3 h-3 animate-spin" />
                    : quitada ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  {hora}
                </button>
              )
            })}
            {agregadas.map(hora => {
              const exc = excDia.find(e => e.hora === hora && e.tipo === "AGREGAR")
              return (
                <span key={hora} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 bg-blue-50 text-blue-700">
                  <Plus className="w-3 h-3" />
                  {hora}
                  <button onClick={() => exc && eliminarExcepcion(exc.id)}
                    className="ml-0.5 hover:text-red-500 transition">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {excepciones.filter(e => e.fecha !== null).length > 0 && (
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
            Excepciones por fecha
          </p>
          <div className="space-y-1">
            {excepciones.filter(e => e.fecha !== null)
              .sort((a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? ""))
              .map(exc => (
                <div key={exc.id} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border ${
                  exc.tipo === "QUITAR" ? "bg-red-50 border-red-100 text-red-600" : "bg-blue-50 border-blue-100 text-blue-600"
                }`}>
                  <span className="flex items-center gap-2">
                    {exc.tipo === "QUITAR" ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    <span className="font-semibold">{exc.hora}</span>
                    <span className="text-gray-400">
                      {exc.fecha ? new Date(exc.fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      exc.tipo === "QUITAR" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                    }`}>
                      {exc.tipo === "QUITAR" ? "Quitada" : "Extra"}
                    </span>
                  </span>
                  <button onClick={() => eliminarExcepcion(exc.id)} className="hover:text-red-500 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
        <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Agregar hora extra
        </p>
        <div className="flex gap-1 mb-3">
          <button onClick={() => setModoFecha(false)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              !modoFecha ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-500 border-gray-200 hover:border-pink-300"
            }`}>
            Permanente
          </button>
          <button onClick={() => setModoFecha(true)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              modoFecha ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-500 border-gray-200 hover:border-pink-300"
            }`}>
            Por fecha
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
          {modoFecha && (
            <input type="date" value={nuevaFecha} onChange={e => setNuevaFecha(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-pink-400" />
          )}
          <button onClick={agregarHoraExtra}
            disabled={!nuevaHora || (modoFecha && !nuevaFecha) || guardando === "nueva"}
            className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition disabled:opacity-40">
            {guardando === "nueva" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Agregar
          </button>
        </div>
      </div>
    </div>
  )
}

function EmpleadoCard({ emp, horasGlobales }: { emp: Empleado; horasGlobales: Horario[] }) {
  const [diasSel,   setDiasSel]   = useState<number[]>(emp.dias)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)
  const [expanded,  setExpanded]  = useState(false)
  const [diaHoras,  setDiaHoras]  = useState<number | null>(null)

  const toggleDia = (id: number) => {
    setGuardado(false)
    setDiasSel(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id].sort((a, b) => a - b))
  }

  const guardar = async () => {
    setGuardando(true)
    try {
      await fetch(`/api/admin/empleados/${emp.id}/dias`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dias: diasSel }),
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } finally {
      setGuardando(false)
    }
  }

  const cambios = JSON.stringify(diasSel.sort()) !== JSON.stringify([...emp.dias].sort())

  return (
    <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-pink-50/40 transition text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {emp.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{emp.nombre}</p>
            <p className="text-xs text-gray-400">{emp.correo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex gap-1">
            {DIAS.map(d => (
              <span key={d.id} className={`text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                diasSel.includes(d.id) ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>{d.short}</span>
            ))}
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            emp.rol === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"
          }`}>{emp.rol}</span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-pink-50 pt-4 space-y-5">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-pink-400" /> Días de atención
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {DIAS.map(d => {
                const activo = diasSel.includes(d.id)
                return (
                  <button key={d.id} onClick={() => toggleDia(d.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                      activo ? "border-pink-600 bg-pink-600 text-white shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"
                    }`}>
                    {activo && <Check className="w-3.5 h-3.5" />}
                    {d.label}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[{ label: "Lun–Vie", dias: [1,2,3,4,5] }, { label: "Lun–Sáb", dias: [1,2,3,4,5,6] }].map(({ label, dias }) => (
                <button key={label} onClick={() => { setDiasSel(dias); setGuardado(false) }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600 transition">
                  {label}
                </button>
              ))}
              <button onClick={() => { setDiasSel([]); setGuardado(false) }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 transition">
                Limpiar
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={guardar} disabled={guardando || !cambios}
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold px-5 py-2.5 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed">
                {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar días"}
              </button>
              {guardado && <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium"><Check className="w-4 h-4" /> Guardado</span>}
              {cambios && !guardado && <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>}
            </div>
          </div>

          <div className="border-t border-pink-50" />

          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-pink-400" /> Horario por día
            </p>
            {diasSel.length === 0 ? (
              <p className="text-xs text-gray-400">Asigna días primero para configurar horas</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {diasSel.map(id => {
                    const dia    = DIAS.find(d => d.id === id)
                    const activo = diaHoras === id
                    return (
                      <button key={id} onClick={() => setDiaHoras(activo ? null : id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          activo ? "bg-pink-600 text-white border-pink-600" : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                        }`}>
                        {dia?.label}
                      </button>
                    )
                  })}
                </div>
                {diaHoras !== null && (
                  <div className="bg-pink-50/50 rounded-xl p-4 border border-pink-100">
                    <HorasEmpleado empId={emp.id} diaId={diaHoras} horasGlobales={horasGlobales} />
                  </div>
                )}
                {diaHoras === null && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Selecciona un día para ver y editar sus horas
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HorariosPage() {
  const [seccion,   setSeccion]   = useState<"horarios" | "empleados">("horarios")
  const [diaActivo, setDiaActivo] = useState(1)
  const [horarios,  setHorarios]  = useState<Horario[]>([])
  const [cargando,  setCargando]  = useState(true)
  const [nuevaHora, setNuevaHora] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState("")
  const [copiando,  setCopiando]  = useState(false)
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [cargandoEmpleados, setCargandoEmpleados] = useState(false)

  // ✅ useCallback para evitar setState-in-effect
  const cargar = useCallback(async () => {
    setCargando(true)
    const res  = await fetch("/api/admin/horarios")
    const data = await res.json()
    setHorarios(data)
    setCargando(false)
  }, [])

  const cargarEmpleados = useCallback(async () => {
    setCargandoEmpleados(true)
    try {
      const [emps, usuarios] = await Promise.all([
        fetch("/api/empleados").then(r => r.json()),
        fetch("/api/admin/usuarios?todos=true").then(r => r.json()),
      ])
      const lista: Empleado[] = emps.map((e: { id: number; nombre: string; dias: number[] }) => {
        const u = usuarios.find((u: { id: number; correo: string; rol: string }) => u.id === e.id)
        return { id: e.id, nombre: e.nombre, correo: u?.correo ?? "", rol: u?.rol ?? "EMPLEADO", dias: e.dias }
      })
      setEmpleados(lista)
    } finally {
      setCargandoEmpleados(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  useEffect(() => {
    if (seccion === "empleados" && empleados.length === 0) {
      cargarEmpleados()
    }
  }, [seccion, empleados.length, cargarEmpleados])

  const horariosDia = horarios.filter(h => h.diaSemana === diaActivo)

  const agregarHora = async (hora: string) => {
    if (!hora) return
    setError("")
    setGuardando(true)
    try {
      const res = await fetch("/api/admin/horarios", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora, diaSemana: diaActivo }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Error al agregar") }
      setNuevaHora("")
      await cargar()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al agregar")
    } finally {
      setGuardando(false)
    }
  }

  const toggleActivo = async (id: number, activo: boolean) => {
    await fetch(`/api/admin/horarios/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })
    await cargar()
  }

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return
    await fetch(`/api/admin/horarios/${id}`, { method: "DELETE" })
    await cargar()
  }

  const copiarDesdeDia = async (diaOrigen: number) => {
    const origen = horarios.filter(h => h.diaSemana === diaOrigen)
    if (origen.length === 0) { alert("El día seleccionado no tiene horarios"); return }
    setCopiando(true)
    for (const h of origen) {
      const existe = horarios.find(x => x.diaSemana === diaActivo && x.hora === h.hora)
      if (!existe) {
        await fetch("/api/admin/horarios", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hora: h.hora, diaSemana: diaActivo }),
        })
      }
    }
    await cargar()
    setCopiando(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-pink-900">Horarios</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-100 pb-0">
        <button onClick={() => setSeccion("horarios")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
            seccion === "horarios" ? "border-pink-600 text-pink-600 bg-pink-50" : "border-transparent text-gray-500 hover:text-pink-500"
          }`}>
          <Clock className="w-4 h-4" /> Horarios generales
        </button>
        <button onClick={() => setSeccion("empleados")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
            seccion === "empleados" ? "border-pink-600 text-pink-600 bg-pink-50" : "border-transparent text-gray-500 hover:text-pink-500"
          }`}>
          <Users className="w-4 h-4" /> Días por empleado
        </button>
      </div>

      {seccion === "horarios" && (
        <>
          <div className="flex flex-wrap gap-2">
            {DIAS.map(d => {
              const count = horarios.filter(h => h.diaSemana === d.id && h.activo).length
              return (
                <button key={d.id} onClick={() => setDiaActivo(d.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                    diaActivo === d.id ? "bg-pink-600 text-white shadow-md" : "bg-white border border-pink-200 text-pink-700 hover:bg-pink-50"
                  }`}>
                  {d.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${diaActivo === d.id ? "bg-pink-500" : "bg-pink-100 text-pink-600"}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-500" /> Agregar hora
                </h3>
                <div className="flex gap-2">
                  <input type="time" value={nuevaHora} onChange={e => setNuevaHora(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400" />
                  <button onClick={() => agregarHora(nuevaHora)} disabled={!nuevaHora || guardando}
                    className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition disabled:opacity-40">
                    {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Horas rápidas</h3>
                <div className="grid grid-cols-3 gap-2">
                  {HORAS_SUGERIDAS.map(h => {
                    const yaExiste = horarios.find(x => x.diaSemana === diaActivo && x.hora === h)
                    return (
                      <button key={h} onClick={() => !yaExiste && agregarHora(h)} disabled={!!yaExiste}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                          yaExiste ? "bg-green-50 border-green-200 text-green-600 cursor-default" : "bg-white border-pink-100 text-gray-700 hover:border-pink-400 hover:bg-pink-50"
                        }`}>
                        {yaExiste && <Check className="w-3 h-3" />}
                        {h}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Copiar horarios de otro día</h3>
                <div className="space-y-2">
                  {DIAS.filter(d => d.id !== diaActivo).map(d => (
                    <button key={d.id} onClick={() => copiarDesdeDia(d.id)} disabled={copiando}
                      className="w-full text-left px-4 py-2 rounded-xl border border-pink-100 text-sm text-gray-700 hover:bg-pink-50 hover:border-pink-300 transition flex items-center justify-between">
                      <span>{d.label}</span>
                      <span className="text-xs text-pink-500">{horarios.filter(h => h.diaSemana === d.id).length} horas</span>
                    </button>
                  ))}
                </div>
                {copiando && (
                  <p className="text-xs text-pink-500 mt-2 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Copiando...
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-pink-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Horarios — {DIAS.find(d => d.id === diaActivo)?.label}</h3>
                  <span className="text-sm text-gray-500">{horariosDia.length} configurados</span>
                </div>
                {cargando ? (
                  <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-pink-400 animate-spin" /></div>
                ) : horariosDia.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Sin horarios para este día</p>
                    <p className="text-sm mt-1">Agrega horas desde el panel izquierdo</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-6">
                    {horariosDia.sort((a, b) => a.hora.localeCompare(b.hora)).map(h => (
                      <div key={h.id} className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                        h.activo ? "border-pink-200 bg-pink-50" : "border-gray-100 bg-gray-50 opacity-60"
                      }`}>
                        <span className={`text-lg font-bold ${h.activo ? "text-pink-700" : "text-gray-400"}`}>{h.hora}</span>
                        <div className="flex gap-1">
                          <button onClick={() => toggleActivo(h.id, h.activo)}
                            className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
                              h.activo ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}>
                            {h.activo ? "ON" : "OFF"}
                          </button>
                          <button onClick={() => eliminar(h.id)} className="p-1 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {seccion === "empleados" && (
        <div className="space-y-3 max-w-4xl">
          <p className="text-sm text-gray-500">Configura los días y excepciones de horario para cada especialista.</p>
          {cargandoEmpleados ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-pink-400 animate-spin" /></div>
          ) : empleados.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay empleados registrados</p>
              <p className="text-sm mt-1">Crea usuarios con rol EMPLEADO desde el Dashboard</p>
            </div>
          ) : (
            empleados.map(emp => <EmpleadoCard key={emp.id} emp={emp} horasGlobales={horarios} />)
          )}
        </div>
      )}
    </div>
  )
}