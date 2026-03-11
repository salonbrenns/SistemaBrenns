// src/app/admin/agendar/page.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Calendar, Clock, User, Search, CreditCard,
  Banknote, ArrowRight, CheckCircle, Loader2, AlertCircle, Phone
} from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, isBefore, isToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"

type Servicio = { id: number; nombre: string; precio: number; duracion: string }
type Horario  = { id: number; hora: string; disponible: boolean }
type Usuario  = { id: number; nombre: string; correo: string; telefono?: string }

const METODOS_PAGO = [
  { id: "EFECTIVO",      label: "Efectivo",      icon: Banknote   },
  { id: "TRANSFERENCIA", label: "Transferencia", icon: ArrowRight },
  { id: "TARJETA",       label: "Tarjeta",       icon: CreditCard },
]

export default function AdminAgendarPage() {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)

  // Paso 1 — Servicio
  const [servicios,     setServicios]     = useState<Servicio[]>([])
  const [servicioSel,   setServicioSel]   = useState<Servicio | null>(null)

  // Paso 2 — Fecha y hora
  const [mesActual,  setMesActual]  = useState(new Date())
  const [fechaSel,   setFechaSel]   = useState<Date | null>(null)
  const [horarios,   setHorarios]   = useState<Horario[]>([])
  const [cargandoHor,setCargandoHor]= useState(false)
  const [horaSel,    setHoraSel]    = useState<string | null>(null)
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([])

  // Paso 3 — Cliente y pago
  const [busqueda,       setBusqueda]       = useState("")
  const [resultados,     setResultados]     = useState<Usuario[]>([])
  const [buscando,       setBuscando]       = useState(false)
  const [usuarioSel,     setUsuarioSel]     = useState<Usuario | null>(null)
  const [sinUsuario,     setSinUsuario]     = useState(false)
  const [nombreContacto, setNombreContacto] = useState("")
  const [telefonoContacto,setTelefonoContacto] = useState("")
  const [metodoPago,     setMetodoPago]     = useState("EFECTIVO")
  const [notas,          setNotas]          = useState("")

  const [guardando, setGuardando] = useState(false)
  const [error,     setError]     = useState("")
  const [exito,     setExito]     = useState(false)

  // Cargar servicios
  useEffect(() => {
    fetch("/api/admin/servicios")
      .then(r => r.json())
    .then(data => setServicios(Array.isArray(data) ? data : data.servicios || []))
      .catch(() => {})
  }, [])

  // Cargar días bloqueados
  useEffect(() => {
    fetch("/api/dias-bloqueados")
      .then(r => r.json())
      .then((data: { fecha: string }[]) => setDiasBloqueados(data.map(d => d.fecha.slice(0, 10))))
      .catch(() => {})
  }, [])

  // Cargar horarios al seleccionar fecha
  useEffect(() => {
    if (!fechaSel || !servicioSel) return
    setCargandoHor(true)
    setHoraSel(null)
    const fechaStr = format(fechaSel, "yyyy-MM-dd")
    fetch(`/api/horarios?fecha=${fechaStr}&servicioId=${servicioSel.id}`)
      .then(r => r.json())
      .then(data => { setHorarios(data); setCargandoHor(false) })
      .catch(() => setCargandoHor(false))
  }, [fechaSel, servicioSel])

  // Buscar usuarios
  useEffect(() => {
    if (!busqueda || busqueda.length < 2) { setResultados([]); return }
    setBuscando(true)
    const t = setTimeout(() => {
      fetch(`/api/admin/usuarios?q=${busqueda}`)
        .then(r => r.json())
        .then(data => { setResultados(data); setBuscando(false) })
        .catch(() => setBuscando(false))
    }, 400)
    return () => clearTimeout(t)
  }, [busqueda])

  const hoy    = new Date()
  const offset = startOfMonth(mesActual).getDay() === 0 ? 6 : startOfMonth(mesActual).getDay() - 1
  const diasDelMes = eachDayOfInterval({ start: startOfMonth(mesActual), end: endOfMonth(mesActual) })

  const handleGuardar = async () => {
    setError("")
    if (!servicioSel || !fechaSel || !horaSel) { setError("Completa servicio, fecha y hora"); return }
    if (!sinUsuario && !usuarioSel) { setError("Selecciona un cliente o marca 'Sin usuario'"); return }
    if (sinUsuario && !nombreContacto) { setError("Ingresa el nombre del cliente"); return }

    setGuardando(true)
    try {
      const res = await fetch("/api/admin/crear-cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicio_id:       servicioSel.id,
          fecha:             format(fechaSel, "yyyy-MM-dd"),
          hora:              horaSel,
          usuario_id:        usuarioSel?.id || null,
          nombre_contacto:   sinUsuario ? nombreContacto : null,
          telefono_contacto: sinUsuario ? telefonoContacto : null,
          metodo_pago:       metodoPago,
          notas,
          estado:            "CONFIRMADA",
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al guardar")
      setExito(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al guardar")
    } finally {
      setGuardando(false)
    }
  }

  const resetear = () => {
    setPaso(1); setServicioSel(null); setFechaSel(null); setHoraSel(null)
    setUsuarioSel(null); setSinUsuario(false); setNombreContacto(""); setTelefonoContacto("")
    setMetodoPago("EFECTIVO"); setNotas(""); setExito(false); setError("")
  }

  if (exito) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Cita agendada!</h2>
          <p className="text-gray-500 mb-1"><strong>{servicioSel?.nombre}</strong></p>
          <p className="text-gray-500 mb-1">{fechaSel && format(fechaSel, "EEEE d 'de' MMMM", { locale: es })}</p>
          <p className="text-pink-600 font-bold text-lg mb-2">{horaSel}</p>
          <p className="text-gray-500 mb-6">
            Cliente: <strong>{usuarioSel?.nombre || nombreContacto}</strong>
          </p>
          <p className="text-sm text-gray-400 mb-6">Pago: {metodoPago}</p>
          <button onClick={resetear}
            className="bg-pink-600 text-white font-bold px-8 py-3 rounded-full hover:bg-pink-700 transition">
            Agendar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900">Agendar cita</h1>
        <p className="text-sm text-gray-500 mt-1">Crea una cita para un cliente</p>
      </div>

      {/* Indicador de pasos */}
      <div className="flex items-center gap-3">
        {[
          { n: 1, label: "Servicio" },
          { n: 2, label: "Fecha y hora" },
          { n: 3, label: "Cliente y pago" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              paso > n ? "bg-green-500 text-white" : paso === n ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {paso > n ? "✓" : n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${paso >= n ? "text-pink-700" : "text-gray-400"}`}>{label}</span>
            {n < 3 && <div className="w-8 h-0.5 bg-gray-200 hidden sm:block" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* ── PASO 1: Servicio ─────────────────────────────── */}
          {paso === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-500" /> Selecciona el servicio
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {servicios.map(s => (
                  <button key={s.id} onClick={() => setServicioSel(s)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      servicioSel?.id === s.id
                        ? "border-pink-600 bg-pink-50"
                        : "border-gray-100 hover:border-pink-200"
                    }`}>
                    <p className="font-bold text-gray-800">{s.nombre}</p>
                    <p className="text-sm text-gray-500 mt-1">{s.duracion}</p>
                    <p className="text-pink-600 font-bold mt-1">${Number(s.precio).toLocaleString()} MXN</p>
                  </button>
                ))}
              </div>
              <button onClick={() => setPaso(2)} disabled={!servicioSel}
                className="mt-6 w-full bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition disabled:opacity-40">
                Continuar →
              </button>
            </div>
          )}

          {/* ── PASO 2: Fecha y hora ──────────────────────────── */}
          {paso === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
              <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" /> Fecha y hora
              </h2>

              {/* Calendario */}
              <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-pink-700 capitalize">
                    {format(mesActual, "MMMM yyyy", { locale: es })}
                  </h3>
                  <div className="flex gap-2">
                    <button onClick={() => setMesActual(subMonths(mesActual, 1))}
                      className="p-1.5 bg-white rounded-lg border border-pink-100 hover:bg-pink-100 transition">
                      ‹
                    </button>
                    <button onClick={() => setMesActual(addMonths(mesActual, 1))}
                      className="p-1.5 bg-white rounded-lg border border-pink-100 hover:bg-pink-100 transition">
                      ›
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                  {["Lu","Ma","Mi","Ju","Vi","Sá","Do"].map(d => (
                    <div key={d} className="text-pink-400 text-xs font-bold">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
                  {diasDelMes.map(dia => {
                    const pasado    = isBefore(dia, hoy) && !isToday(dia)
                    const esDom     = dia.getDay() === 0
                    const bloqueado = diasBloqueados.includes(format(dia, "yyyy-MM-dd"))
                    const selected  = fechaSel && isSameDay(dia, fechaSel)
                    const disabled  = pasado || esDom || bloqueado
                    return (
                      <button key={dia.toISOString()} disabled={disabled} onClick={() => setFechaSel(dia)}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
                          selected ? "bg-pink-600 text-white shadow-md"
                          : bloqueado ? "bg-orange-50 text-orange-300 cursor-not-allowed"
                          : disabled ? "text-gray-300 cursor-not-allowed"
                          : isToday(dia) ? "bg-pink-100 text-pink-600 border-2 border-pink-300"
                          : "bg-white hover:bg-pink-100 text-gray-700"
                        }`}>
                        {format(dia, "d")}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Horarios */}
              {fechaSel && (
                <div className="mt-5">
                  <p className="font-semibold text-gray-700 mb-3 text-sm">
                    Horarios — {format(fechaSel, "EEEE d 'de' MMMM", { locale: es })}
                  </p>
                  {cargandoHor ? (
                    <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-pink-400 animate-spin" /></div>
                  ) : horarios.length === 0 ? (
                    <p className="text-center text-gray-400 py-4 text-sm">Sin horarios configurados para este día</p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {horarios.map(h => (
                        <button key={h.id} disabled={!h.disponible} onClick={() => setHoraSel(h.hora)}
                          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                            !h.disponible ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                            : horaSel === h.hora ? "bg-pink-600 text-white border-pink-600 shadow-md"
                            : "bg-white border-pink-100 hover:border-pink-400 text-gray-700"
                          }`}>
                          {h.hora}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setPaso(1)}
                  className="flex-1 border-2 border-pink-200 text-pink-600 font-bold py-3 rounded-full hover:bg-pink-50 transition">
                  ← Atrás
                </button>
                <button onClick={() => setPaso(3)} disabled={!fechaSel || !horaSel}
                  className="flex-1 bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition disabled:opacity-40">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: Cliente y pago ────────────────────────── */}
          {paso === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 space-y-5">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-pink-500" /> Cliente y pago
              </h2>

              {/* Toggle sin usuario */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => { setSinUsuario(!sinUsuario); setUsuarioSel(null); setBusqueda("") }}
                  className={`w-10 h-6 rounded-full transition-colors ${sinUsuario ? "bg-pink-600" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${sinUsuario ? "translate-x-4" : "translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Cliente sin cuenta (walk-in / teléfono)</span>
              </label>

              {/* Buscar usuario registrado */}
              {!sinUsuario && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar cliente</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input value={busqueda} onChange={e => { setBusqueda(e.target.value); setUsuarioSel(null) }}
                      placeholder="Nombre o correo..."
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                    {buscando && <Loader2 className="absolute right-3 top-2.5 w-4 h-4 text-pink-400 animate-spin" />}
                  </div>
                  {resultados.length > 0 && !usuarioSel && (
                    <div className="mt-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      {resultados.map(u => (
                        <button key={u.id} onClick={() => { setUsuarioSel(u); setBusqueda(u.nombre); setResultados([]) }}
                          className="w-full text-left px-4 py-3 hover:bg-pink-50 transition border-b border-gray-100 last:border-0">
                          <p className="font-semibold text-gray-800 text-sm">{u.nombre}</p>
                          <p className="text-xs text-gray-400">{u.correo}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {usuarioSel && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{usuarioSel.nombre}</p>
                        <p className="text-xs text-gray-500">{usuarioSel.correo}</p>
                      </div>
                      <button onClick={() => { setUsuarioSel(null); setBusqueda("") }} className="ml-auto text-xs text-red-400 hover:text-red-600">✕</button>
                    </div>
                  )}
                </div>
              )}

              {/* Datos de contacto sin usuario */}
              {sinUsuario && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del cliente</label>
                    <input value={nombreContacto} onChange={e => setNombreContacto(e.target.value)}
                      placeholder="Ej. Ana García"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono (opcional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input value={telefonoContacto} onChange={e => setTelefonoContacto(e.target.value)}
                        placeholder="961 000 0000"
                        className="w-full pl-9 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Método de pago</label>
                <div className="grid grid-cols-3 gap-3">
                  {METODOS_PAGO.map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setMetodoPago(id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                        metodoPago === id ? "border-pink-600 bg-pink-50" : "border-gray-100 hover:border-pink-200"
                      }`}>
                      <Icon className={`w-5 h-5 ${metodoPago === id ? "text-pink-600" : "text-gray-400"}`} />
                      <span className={`text-xs font-bold ${metodoPago === id ? "text-pink-700" : "text-gray-500"}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                  placeholder="Observaciones sobre la cita..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 resize-none" />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setPaso(2)}
                  className="flex-1 border-2 border-pink-200 text-pink-600 font-bold py-3 rounded-full hover:bg-pink-50 transition">
                  ← Atrás
                </button>
                <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "✓ Confirmar cita"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen lateral */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-5 sticky top-6">
            <h3 className="font-bold text-pink-600 mb-4">Resumen</h3>
            <div className="space-y-3 text-sm">
              {servicioSel ? (
                <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                  <p className="font-bold text-gray-800">{servicioSel.nombre}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{servicioSel.duracion}</p>
                  <p className="text-pink-600 font-bold mt-1">${Number(servicioSel.precio).toLocaleString()} MXN</p>
                </div>
              ) : (
                <p className="text-gray-400 text-xs">Sin servicio seleccionado</p>
              )}
              {fechaSel && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span>{format(fechaSel, "d 'de' MMMM", { locale: es })}</span>
                </div>
              )}
              {horaSel && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                  <Clock className="w-4 h-4 text-pink-400" />
                  <span className="font-bold">{horaSel}</span>
                </div>
              )}
              {(usuarioSel || (sinUsuario && nombreContacto)) && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-pink-400" />
                  <span>{usuarioSel?.nombre || nombreContacto}</span>
                </div>
              )}
              {metodoPago && paso === 3 && (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2">
                  <CreditCard className="w-4 h-4 text-pink-400" />
                  <span>{metodoPago}</span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}