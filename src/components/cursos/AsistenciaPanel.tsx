'use client'

import { useState, useCallback } from 'react'
import { CalendarCheck, Loader2, CheckCircle2, XCircle, Save, ChevronDown, ChevronUp, History } from 'lucide-react'

type Alumno = {
  inscripcion_id: number
  usuario_id:     number
  nombre:         string
  presente:       boolean | null
}

type HistorialAlumna = {
  nombre:    string
  total:     number
  presentes: number
  fechas:    { fecha: string; presente: boolean }[]
}

function fechaLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AsistenciaPanel({ cursoId }: { cursoId: number }) {
  const [abierto,    setAbierto]    = useState(false)
  const [vista,      setVista]      = useState<'marcar' | 'historial'>('marcar')
  const [fecha,      setFecha]      = useState(fechaLocal)
  const [alumnos,    setAlumnos]    = useState<Alumno[]>([])
  const [cargando,   setCargando]   = useState(false)
  const [guardando,  setGuardando]  = useState(false)
  const [mensaje,    setMensaje]    = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [cargado,    setCargado]    = useState(false)
  const [historial,  setHistorial]  = useState<HistorialAlumna[]>([])
  const [cargandoH,  setCargandoH]  = useState(false)
  const [expandida,  setExpandida]  = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setMensaje(null)
    try {
      const res  = await fetch(`/api/admin/asistencia?curso_id=${cursoId}&fecha=${fecha}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      // Si no hay registro previo, marcar todos como presentes por defecto
      setAlumnos(data.alumnos.map((a: Alumno) => ({
        ...a,
        presente: a.presente ?? true,
      })))
      setCargado(true)
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al cargar alumnos' })
    } finally {
      setCargando(false)
    }
  }, [cursoId, fecha])

  const togglePresente = (id: number) => {
    setAlumnos(prev => prev.map(a =>
      a.inscripcion_id === id ? { ...a, presente: !a.presente } : a
    ))
  }

  const guardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/admin/asistencia', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fecha,
          asistencias: alumnos.map(a => ({
            inscripcion_id: a.inscripcion_id,
            presente:       a.presente ?? true,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMensaje({ tipo: 'ok', texto: `✓ Asistencia guardada (${data.guardadas} alumnas)` })
    } catch {
      setMensaje({ tipo: 'error', texto: 'Error al guardar asistencia' })
    } finally {
      setGuardando(false)
    }
  }

  const cargarHistorial = useCallback(async () => {
    setCargandoH(true)
    try {
      const res  = await fetch(`/api/admin/asistencia?curso_id=${cursoId}`)
      const data = await res.json()
      setHistorial(data.historial ?? [])
    } catch {
      setHistorial([])
    } finally {
      setCargandoH(false)
    }
  }, [cursoId])

  const cambiarVista = (v: 'marcar' | 'historial') => {
    setVista(v)
    if (v === 'historial') cargarHistorial()
  }

  const presentes = alumnos.filter(a => a.presente).length
  const ausentes  = alumnos.length - presentes

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-pink-500" />
          <span className="font-bold text-gray-800 dark:text-white">Tomar asistencia</span>
        </div>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {abierto && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          {/* Pestañas */}
          <div className="flex border-b border-gray-100 dark:border-gray-700">
            {([['marcar', 'Tomar asistencia'], ['historial', 'Ver historial']] as const).map(([v, label]) => (
              <button key={v} onClick={() => cambiarVista(v)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-semibold transition border-b-2 ${
                  vista === v
                    ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}>
                {v === 'historial' && <History className="w-4 h-4" />}
                {v === 'marcar' && <CalendarCheck className="w-4 h-4" />}
                {label}
              </button>
            ))}
          </div>

        <div className="p-5 space-y-4">
          {/* ── HISTORIAL ── */}
          {vista === 'historial' && (
            <div>
              {cargandoH ? (
                <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" /> Cargando historial...
                </div>
              ) : historial.length === 0 ? (
                <p className="text-center text-gray-400 py-10 text-sm">Sin registros de asistencia aún</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  {historial.map(a => (
                    <div key={a.nombre}>
                      <button
                        onClick={() => setExpandida(expandida === a.nombre ? null : a.nombre)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                            {a.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">{a.nombre}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-emerald-600">
                            {a.presentes} / {a.total} clases
                          </span>
                          {/* Barra de progreso */}
                          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${a.total > 0 ? (a.presentes / a.total) * 100 : 0}%` }}
                            />
                          </div>
                          {expandida === a.nombre
                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </button>
                      {expandida === a.nombre && (
                        <div className="px-4 pb-3 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800/50">
                          {a.fechas.map(f => (
                            <span key={f.fecha}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                f.presente
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }`}>
                              {new Date(f.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                              {' '}{f.presente ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MARCAR ASISTENCIA ── */}
          {vista === 'marcar' && <>
          {/* Selector de fecha */}
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Fecha de clase</label>
              <input
                type="date"
                value={fecha}
                max={fechaLocal()}
                onChange={e => { setFecha(e.target.value); setCargado(false); setAlumnos([]) }}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
            </div>
            <button
              onClick={cargar}
              disabled={cargando}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {cargando
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Cargando...</>
                : cargado ? 'Recargar' : 'Cargar lista'
              }
            </button>
          </div>

          {/* Lista de alumnos */}
          {cargado && (
            <>
              {alumnos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No hay alumnas activas en este curso</p>
              ) : (
                <>
                  {/* Resumen */}
                  <div className="flex gap-3 text-xs font-semibold">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      {presentes} presentes
                    </span>
                    <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      {ausentes} ausentes
                    </span>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {alumnos.map((a, i) => (
                      <div key={a.inscripcion_id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono w-5">{i + 1}</span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                            {a.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">{a.nombre}</span>
                        </div>
                        <button
                          onClick={() => togglePresente(a.inscripcion_id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            a.presente
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200'
                          }`}
                        >
                          {a.presente
                            ? <><CheckCircle2 className="w-3.5 h-3.5" /> Presente</>
                            : <><XCircle      className="w-3.5 h-3.5" /> Ausente</>
                          }
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Guardar */}
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      onClick={guardar}
                      disabled={guardando}
                      className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition disabled:opacity-50"
                    >
                      {guardando
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                        : <><Save className="w-4 h-4" /> Guardar asistencia</>
                      }
                    </button>
                    {mensaje && (
                      <span className={`text-sm font-medium ${mensaje.tipo === 'ok' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {mensaje.texto}
                      </span>
                    )}
                  </div>
                </>
              )}
            </>
          )}
          </>}
        </div>
        </div>
      )}
    </div>
  )
}
