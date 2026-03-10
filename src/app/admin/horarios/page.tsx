// src/app/admin/horarios/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Clock, Plus, Trash2, Loader2, Check } from "lucide-react"

const DIAS = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
]

// Horas sugeridas para agregar rápido
const HORAS_SUGERIDAS = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
  "17:00","17:30","18:00","18:30","19:00","19:30",
]

type Horario = {
  id: number
  hora: string
  diaSemana: number
  activo: boolean
}

export default function HorariosPage() {
  const [diaActivo, setDiaActivo] = useState(1)
  const [horarios, setHorarios]   = useState<Horario[]>([])
  const [cargando, setCargando]   = useState(true)
  const [nuevaHora, setNuevaHora] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState("")
  const [copiando, setCopiando]   = useState(false)

  const cargar = async () => {
    setCargando(true)
    const res  = await fetch("/api/admin/horarios")
    const data = await res.json()
    setHorarios(data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const horariosDia = horarios.filter(h => h.diaSemana === diaActivo)

  const agregarHora = async (hora: string) => {
    if (!hora) return
    setError("")
    setGuardando(true)
    try {
      const res = await fetch("/api/admin/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hora, diaSemana: diaActivo }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Error al agregar")
      }
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
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })
    await cargar()
  }

  const eliminar = async (id: number) => {
    if (!confirm("¿Eliminar este horario?")) return
    await fetch(`/api/admin/horarios/${id}`, { method: "DELETE" })
    await cargar()
  }

  // Copiar horarios de otro día
  const copiarDesdeDia = async (diaOrigen: number) => {
    const origen = horarios.filter(h => h.diaSemana === diaOrigen)
    if (origen.length === 0) { alert("El día seleccionado no tiene horarios"); return }
    setCopiando(true)
    for (const h of origen) {
      // Solo agrega si no existe ya en el día destino
      const existe = horarios.find(x => x.diaSemana === diaActivo && x.hora === h.hora)
      if (!existe) {
        await fetch("/api/admin/horarios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        <h1 className="text-2xl font-bold text-pink-900">Horarios por día</h1>
      </div>

      {/* Tabs de días */}
      <div className="flex flex-wrap gap-2">
        {DIAS.map(d => {
          const count = horarios.filter(h => h.diaSemana === d.id && h.activo).length
          return (
            <button key={d.id} onClick={() => setDiaActivo(d.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                diaActivo === d.id
                  ? "bg-pink-600 text-white shadow-md"
                  : "bg-white border border-pink-200 text-pink-700 hover:bg-pink-50"
              }`}>
              {d.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                diaActivo === d.id ? "bg-pink-500" : "bg-pink-100 text-pink-600"
              }`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Panel izquierdo: agregar horas */}
        <div className="lg:col-span-1 space-y-4">

          {/* Hora manual */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-500" /> Agregar hora
            </h3>
            <div className="flex gap-2">
              <input
                type="time"
                value={nuevaHora}
                onChange={e => setNuevaHora(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
              <button onClick={() => agregarHora(nuevaHora)} disabled={!nuevaHora || guardando}
                className="bg-pink-600 text-white px-4 py-2 rounded-xl hover:bg-pink-700 transition disabled:opacity-40">
                {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>

          {/* Horas sugeridas */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Horas rápidas</h3>
            <div className="grid grid-cols-3 gap-2">
              {HORAS_SUGERIDAS.map(h => {
                const yaExiste = horarios.find(x => x.diaSemana === diaActivo && x.hora === h)
                return (
                  <button key={h} onClick={() => !yaExiste && agregarHora(h)}
                    disabled={!!yaExiste}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                      yaExiste
                        ? "bg-green-50 border-green-200 text-green-600 cursor-default"
                        : "bg-white border-pink-100 text-gray-700 hover:border-pink-400 hover:bg-pink-50"
                    }`}>
                    {yaExiste && <Check className="w-3 h-3" />}
                    {h}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Copiar de otro día */}
          <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Copiar horarios de otro día</h3>
            <div className="space-y-2">
              {DIAS.filter(d => d.id !== diaActivo).map(d => (
                <button key={d.id} onClick={() => copiarDesdeDia(d.id)} disabled={copiando}
                  className="w-full text-left px-4 py-2 rounded-xl border border-pink-100 text-sm text-gray-700 hover:bg-pink-50 hover:border-pink-300 transition flex items-center justify-between">
                  <span>{d.label}</span>
                  <span className="text-xs text-pink-500">
                    {horarios.filter(h => h.diaSemana === d.id).length} horas
                  </span>
                </button>
              ))}
            </div>
            {copiando && <p className="text-xs text-pink-500 mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Copiando...</p>}
          </div>
        </div>

        {/* Panel derecho: horarios del día */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-pink-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">
                Horarios — {DIAS.find(d => d.id === diaActivo)?.label}
              </h3>
              <span className="text-sm text-gray-500">{horariosDia.length} configurados</span>
            </div>

            {cargando ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              </div>
            ) : horariosDia.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Sin horarios para este día</p>
                <p className="text-sm mt-1">Agrega horas desde el panel izquierdo</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-6">
                {horariosDia
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(h => (
                    <div key={h.id}
                      className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                        h.activo ? "border-pink-200 bg-pink-50" : "border-gray-100 bg-gray-50 opacity-60"
                      }`}>
                      <span className={`text-lg font-bold ${h.activo ? "text-pink-700" : "text-gray-400"}`}>
                        {h.hora}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => toggleActivo(h.id, h.activo)}
                          title={h.activo ? "Desactivar" : "Activar"}
                          className={`text-xs px-2 py-1 rounded-lg font-semibold transition ${
                            h.activo
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}>
                          {h.activo ? "ON" : "OFF"}
                        </button>
                        <button onClick={() => eliminar(h.id)}
                          className="p-1 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition">
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
    </div>
  )
}