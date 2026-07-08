"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import AuthGuard from "@/components/ui/AuthGuard"
import Breadcrumb from "@/components/Breadcrumb"
import Image from "next/image"
import {
  ChevronLeft, ChevronRight, Clock, Calendar,
  CreditCard, CheckCircle, Loader2, AlertCircle, User, Banknote, ArrowRight
} from "lucide-react"
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isBefore, isToday, isSameDay, startOfDay,
} from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

type Servicio = { id: number; nombre: string; precio: number; duracion: string; imagen: string | null }
// ── NUEVO: la API ahora devuelve { sinAtencion, horarios }
type HorarioItem = { id: number; hora: string; disponible: boolean }
type HorariosResp = { sinAtencion: boolean; horarios: HorarioItem[] }
type Empleado = { id: number; nombre: string; imagen: string | null; dias?: number[] }

function AgendarContenido() {
  useSession()
  const searchParams = useSearchParams()
  const servicioId = searchParams.get("servicioId")

  const [paso,        setPaso]        = useState<1 | 2>(1)
  const [servicio,    setServicio]    = useState<Servicio | null>(null)
  const [cargandoSrv, setCargandoSrv] = useState(true)
  const [empleados,   setEmpleados]   = useState<Empleado[]>([])
  const [empleadoSel, setEmpleadoSel] = useState<number | null>(null)

  // ── Calendario mensual (igual que archivo 1)
  const [mesActual,      setMesActual]      = useState(new Date())
  const [fechaSel,       setFechaSel]       = useState<Date | null>(null)
  const [horarios,       setHorarios]       = useState<HorarioItem[]>([])
  const [sinAtencion,    setSinAtencion]    = useState(false)
  const [cargandoHor,    setCargandoHor]    = useState(false)
  const [horaSel,        setHoraSel]        = useState<string | null>(null)
  const [notas,          setNotas]          = useState("")
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([])

  const [tipoPago,          setTipoPago]          = useState<"ANTICIPO" | "COMPLETO" | null>(null)
  const [metodoPagoCliente, setMetodoPagoCliente] = useState<"TARJETA" | "TRANSFERENCIA" | null>(null)
  const [pagando,   setPagando]   = useState(false)
  const [errorPago, setErrorPago] = useState("")
  const [exito,     setExito]     = useState(false)

  // ── Helpers de calendario
  const diasDelMes = eachDayOfInterval({ start: startOfMonth(mesActual), end: endOfMonth(mesActual) })
  const hoy        = startOfDay(new Date())
  const offset     = startOfMonth(mesActual).getDay() === 0 ? 6 : startOfMonth(mesActual).getDay() - 1

  const empleadoActual = empleados.find(e => e.id === empleadoSel)

  // ── NUEVO: días que atiende el empleado seleccionado
  const diasAtiende = (empleadoId: number | null): number[] => {
    if (!empleadoId) return [1, 2, 3, 4, 5, 6]
    return empleados.find(e => e.id === empleadoId)?.dias ?? []
  }

  // ── NUEVO: lógica que combina bloqueados + días del empleado
  const isDiaDisponible = (dia: Date): boolean => {
    const pasado    = isBefore(dia, hoy) && !isToday(dia)
    const esDom     = dia.getDay() === 0
    const bloqueado = diasBloqueados.includes(format(dia, "yyyy-MM-dd"))
    if (pasado || esDom || bloqueado) return false
    if (empleadoSel) {
      const diaN = dia.getDay() === 0 ? 7 : dia.getDay() // 1=Lun…6=Sáb,7=Dom
      return diasAtiende(empleadoSel).includes(diaN)
    }
    return true
  }

  // ── NUEVO: al cambiar empleado resetear fecha y horarios
  const handleSelEmpleado = (id: number | null) => {
    setEmpleadoSel(id)
    setFechaSel(null)
    setHoraSel(null)
    setHorarios([])
    setSinAtencion(false)
  }

  // ── Fetches iniciales
  useEffect(() => {
    if (!servicioId) { setCargandoSrv(false); return }
    fetch(`/api/servicios/${servicioId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setServicio(data); setCargandoSrv(false) })
      .catch(() => setCargandoSrv(false))
  }, [servicioId])

  useEffect(() => {
    fetch("/api/empleados")
      .then(r => r.json())
      .then(data => setEmpleados(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/dias-bloqueados")
      .then(r => r.json())
      .then((data: { fecha: string }[]) => setDiasBloqueados(data.map(d => d.fecha.slice(0, 10))))
      .catch(() => {})
  }, [])

  // ── NUEVO: horarios con respuesta enriquecida { sinAtencion, horarios }
  useEffect(() => {
    if (!fechaSel) return
    setCargandoHor(true)
    setHoraSel(null)
    const fechaStr = format(fechaSel, "yyyy-MM-dd")
    const empParam = empleadoSel ? `&empleadoId=${empleadoSel}` : ""
    fetch(`/api/horarios?fecha=${fechaStr}&servicioId=${servicioId || ""}${empParam}`)
      .then(r => r.json())
      .then((data: HorariosResp) => {
        setSinAtencion(data.sinAtencion ?? false)
        setHorarios(Array.isArray(data.horarios) ? data.horarios : [])
        setCargandoHor(false)
      })
      .catch(() => { setHorarios([]); setCargandoHor(false) })
  }, [fechaSel, empleadoSel, servicioId])

  // ── NUEVO: agrupar horarios en mañana / tarde
  const horariosMañana = horarios.filter(h => parseInt(h.hora.split(":")[0]) < 12)
  const horariosTarde  = horarios.filter(h => parseInt(h.hora.split(":")[0]) >= 12)
  const horasLibres    = horarios.filter(h => h.disponible).length

  const montoAnticipo = servicio ? Number(servicio.precio) * 0.5 : 0
  const montoCompleto = servicio ? Number(servicio.precio) : 0
  // montoCobrado: tipoPago === "ANTICIPO" ? montoAnticipo : montoCompleto

  // Crea la cita en BD (llamado tanto por transferencia como por PayPal tras aprobación)
  const crearCita = async (metodoPago: string) => {
    if (!fechaSel || !horaSel || !servicioId || !tipoPago) return false
    const notasPago = [
      tipoPago === "ANTICIPO"
        ? `[ANTICIPO 50%: $${montoAnticipo.toLocaleString()} MXN]`
        : `[PAGO COMPLETO: $${montoCompleto.toLocaleString()} MXN]`,
      notas,
    ].filter(Boolean).join(" ")
    const res = await fetch("/api/citas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        servicio_id: Number(servicioId),
        fecha:       format(fechaSel, "yyyy-MM-dd"),
        hora:        horaSel,
        notas:       notasPago,
        empleado_id: empleadoSel,
        metodo_pago: metodoPago,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Error al confirmar")
    return true
  }

  const handleTransferencia = async () => {
    setErrorPago("")
    if (!tipoPago) { setErrorPago("Selecciona anticipo o pago completo"); return }
    if (!fechaSel || !horaSel) { setErrorPago("Faltan datos de la cita"); return }
    setPagando(true)
    try {
      await crearCita("TRANSFERENCIA")
      setExito(true)
    } catch (err: unknown) {
      setErrorPago(err instanceof Error ? err.message : "Error al confirmar")
    } finally {
      setPagando(false)
    }
  }

  // ── Pantalla éxito
  if (exito) {
    const esTransferencia = metodoPagoCliente === "TRANSFERENCIA"
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center py-20">
        <div className="text-center max-w-md px-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${esTransferencia ? "bg-amber-100" : "bg-green-100"}`}>
            {esTransferencia
              ? <AlertCircle className="w-14 h-14 text-amber-500" />
              : <CheckCircle className="w-14 h-14 text-green-500" />
            }
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">
            {esTransferencia ? "¡Cita en espera!" : "¡Cita confirmada!"}
          </h2>
          {esTransferencia && (
            <p className="text-amber-600 font-semibold text-sm mb-4">
              Pendiente de verificar tu transferencia
            </p>
          )}
          <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>{servicio?.nombre}</strong></p>
          <p className="text-gray-500 dark:text-gray-400 mb-1">{fechaSel && format(fechaSel, "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
          <p className="text-pink-600 font-bold text-xl mb-2">{horaSel}</p>
          {empleadoActual && (
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">Con: {empleadoActual.nombre}</p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {tipoPago === "ANTICIPO"
              ? `Anticipo: $${montoAnticipo.toLocaleString()} MXN`
              : `Pago completo: $${montoCompleto.toLocaleString()} MXN`}
          </p>
          {esTransferencia && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-left">
              <p className="text-sm font-bold text-amber-800 mb-1">¿Qué sigue?</p>
              <p className="text-xs text-amber-700">
                Envía tu comprobante de transferencia por WhatsApp al número del salón. Una vez verificado, tu cita quedará confirmada.
              </p>
            </div>
          )}
          <div className="flex gap-4 justify-center mt-4">
            <Link href="/mis-citas" className="bg-pink-600 text-white font-bold px-8 py-3 rounded-full hover:bg-pink-700 transition">Ver mis citas</Link>
            <Link href="/servicios" className="border-2 border-pink-200 text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 transition">Ver servicios</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!cargandoSrv && !servicio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Servicio no encontrado</h2>
          <Link href="/servicios" className="text-pink-600 font-bold hover:underline">Ver todos los servicios</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <Breadcrumb items={[
          { label: "Servicios", href: "/servicios" },
          { label: servicio?.nombre || "Agendar", href: "#" },
          { label: "Agendar Cita", href: "#", active: true },
        ]} />

        {/* Pasos */}
        <div className="flex items-center justify-center gap-4 my-8">
          {[{ n: 1, label: "Fecha y hora" }, { n: 2, label: "Pago" }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                paso >= n ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-500 dark:text-gray-400"
              }`}>{n}</div>
              <span className={`text-sm font-medium hidden sm:block ${paso >= n ? "text-pink-600" : "text-gray-400"}`}>{label}</span>
              {n < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── PASO 1 ── */}
          {paso === 1 && (
            <div className="lg:col-span-2 space-y-5">

              {/* Calendario mensual — diseño del archivo 1, isDiaDisponible del archivo 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-pink-50 p-5">
                <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-400" /> Selecciona fecha
                </h2>

                <div className="bg-pink-50/50 dark:bg-gray-900/60 rounded-xl p-4 border border-pink-100 dark:border-gray-700">
                  {/* Header mes */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-pink-700 dark:text-pink-300 capitalize">
                      {format(mesActual, "MMMM yyyy", { locale: es })}
                    </h3>
                    <div className="flex gap-1.5">
                      <button onClick={() => setMesActual(subMonths(mesActual, 1))}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-pink-100 dark:hover:bg-gray-600 transition border border-pink-100 dark:border-gray-600">
                        <ChevronLeft className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </button>
                      <button onClick={() => setMesActual(addMonths(mesActual, 1))}
                        className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:bg-pink-100 dark:hover:bg-gray-600 transition border border-pink-100 dark:border-gray-600">
                        <ChevronRight className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                      </button>
                    </div>
                  </div>

                  {/* Cabecera días de semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map(d => (
                      <div key={d} className="text-pink-400 text-[11px] font-bold uppercase">{d}</div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
                    {diasDelMes.map(dia => {
                      const disponible = isDiaDisponible(dia)
                      const bloqueado  = diasBloqueados.includes(format(dia, "yyyy-MM-dd"))
                      const selected   = fechaSel && isSameDay(dia, fechaSel)
                      const esHoy      = isToday(dia)
                      // NUEVO: días que el empleado no atiende (distinto de bloqueados admin)
                      const sinEmp     = empleadoSel && !disponible && !isBefore(dia, hoy) && !bloqueado && dia.getDay() !== 0

                      return (
                        <button
                          key={dia.toISOString()}
                          disabled={!disponible}
                          onClick={() => setFechaSel(dia)}
                          title={bloqueado ? "Día sin servicio" : sinEmp ? "Especialista no disponible" : undefined}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-bold transition-all relative ${
                            selected
                              ? "bg-pink-600 text-white shadow-md scale-105"
                              : bloqueado
                              ? "bg-orange-50 dark:bg-gray-900 text-orange-300 dark:text-gray-600 cursor-not-allowed"
                              : sinEmp
                              ? "bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed"
                              : !disponible
                              ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                              : esHoy
                              ? "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 border-2 border-pink-300 dark:border-pink-700"
                              : "bg-white dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-800 dark:text-gray-100 shadow-sm"
                          }`}
                        >
                          {format(dia, "d")}
                          {bloqueado && (
                            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Leyenda */}
                  <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-pink-600 inline-block" /> Seleccionado
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-orange-100 border border-orange-200 inline-block" /> Sin servicio
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-pink-100 border-2 border-pink-300 inline-block" /> Hoy
                    </span>
                    {empleadoSel && (
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-gray-100 inline-block" /> Especialista no atiende
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Los domingos no hay servicio</p>
                </div>

                {/* Horarios — NUEVO: agrupados en mañana/tarde + banner sinAtencion */}
                {fechaSel && (
                  <div className="mt-5">
                    <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-400" />
                      {format(fechaSel, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>

                    {cargandoHor ? (
                      <div className="flex justify-center py-6">
                        <Loader2 className="w-7 h-7 text-pink-400 animate-spin" />
                      </div>
                    ) : sinAtencion ? (
                      // NUEVO: banner cuando el empleado no atiende ese día
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <p className="text-sm text-amber-700 font-medium">
                          {empleadoActual?.nombre.split(" ")[0]} no atiende este día. Elige otra fecha.
                        </p>
                      </div>
                    ) : horarios.length === 0 ? (
                      <div className="text-center py-5 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No hay horarios disponibles para este día</p>
                        <p className="text-xs text-gray-400 mt-1">El administrador aún no ha configurado horarios</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* NUEVO: sección Mañana */}
                        {horariosMañana.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mañana</span>
                              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {horariosMañana.map(h => (
                                <button key={h.id} disabled={!h.disponible} onClick={() => setHoraSel(h.hora)}
                                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    !h.disponible
                                      ? "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through"
                                      : horaSel === h.hora
                                      ? "bg-pink-600 text-white border-pink-600 shadow-md"
                                      : "bg-white dark:bg-gray-800 border-pink-100 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-500 text-gray-700 dark:text-gray-200"
                                  }`}>
                                  {h.hora}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* NUEVO: sección Tarde */}
                        {horariosTarde.length > 0 && (
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tarde</span>
                              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {horariosTarde.map(h => (
                                <button key={h.id} disabled={!h.disponible} onClick={() => setHoraSel(h.hora)}
                                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    !h.disponible
                                      ? "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed line-through"
                                      : horaSel === h.hora
                                      ? "bg-pink-600 text-white border-pink-600 shadow-md"
                                      : "bg-white dark:bg-gray-800 border-pink-100 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-500 text-gray-700 dark:text-gray-200"
                                  }`}>
                                  {h.hora}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Aviso: sin horas disponibles para hoy (todas ya pasaron) */}
                        {horasLibres === 0 && horarios.length > 0 && (
                          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3">
                            <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">No hay horas disponibles para hoy</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">El horario de atención ya terminó. Elige otro día.</p>
                            </div>
                          </div>
                        )}

                        {/* Aviso cuando quedan pocas horas */}
                        {horasLibres <= 3 && horasLibres > 0 && (
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-3 py-2.5">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                              Solo quedan {horasLibres} hora{horasLibres > 1 ? "s" : ""} disponible{horasLibres > 1 ? "s" : ""}, ¡agenda lo antes posible!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Notas */}
                {fechaSel && horaSel && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Notas adicionales (opcional)</label>
                    <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                      placeholder="Ej: Alergia a ciertos productos, uñas muy cortas..."
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition resize-none" />
                  </div>
                )}

                <button onClick={() => setPaso(2)} disabled={!fechaSel || !horaSel}
                  className="mt-5 w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-full shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  Continuar al pago →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2 ── */}
          {paso === 2 && (
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-pink-50 p-6">
                <button onClick={() => setPaso(1)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-pink-600 mb-5 transition">
                  <ChevronLeft className="w-4 h-4" /> Cambiar fecha u hora
                </button>

                {/* ── 1. Tipo de pago ── */}
                <div className="mb-6">
                  <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-pink-400" /> ¿Cuánto deseas pagar hoy?
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">Se requiere al menos el 50% para confirmar tu cita.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "ANTICIPO" as const, label: "Anticipo 50%", monto: `$${montoAnticipo.toLocaleString()} MXN`, desc: "Resto al llegar" },
                      { id: "COMPLETO" as const, label: "Pago completo", monto: `$${montoCompleto.toLocaleString()} MXN`, desc: "Todo liquidado" },
                    ].map(op => (
                      <button key={op.id} type="button" onClick={() => setTipoPago(op.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          tipoPago === op.id ? "border-pink-600 bg-pink-50" : "border-gray-100 hover:border-pink-200"
                        }`}>
                        <p className={`font-bold text-sm ${tipoPago === op.id ? "text-pink-700" : "text-gray-700 dark:text-gray-300"}`}>{op.label}</p>
                        <p className={`text-xl font-black mt-0.5 ${tipoPago === op.id ? "text-pink-600" : "text-gray-400"}`}>{op.monto}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{op.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── 2. Método de pago ── */}
                {tipoPago && (
                  <div className="mb-6">
                    <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-pink-400" /> Método de pago
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        { id: "TRANSFERENCIA" as const, label: "Transferencia", icon: ArrowRight },
                        { id: "TARJETA"       as const, label: "Tarjeta",       icon: CreditCard },
                      ].map(({ id, label, icon: Icon }) => (
                        <button key={id} type="button" onClick={() => setMetodoPagoCliente(id)}
                          className={`p-3.5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            metodoPagoCliente === id ? "border-pink-600 bg-pink-50" : "border-gray-100 hover:border-pink-200"
                          }`}>
                          <Icon className={`w-5 h-5 ${metodoPagoCliente === id ? "text-pink-600" : "text-gray-400"}`} />
                          <span className={`font-bold text-sm ${metodoPagoCliente === id ? "text-pink-700" : "text-gray-600 dark:text-gray-400"}`}>{label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Instrucciones transferencia */}
                    {metodoPagoCliente === "TRANSFERENCIA" && (
                      <div className="space-y-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5">
                          <p className="font-bold text-blue-800 text-sm mb-2">Datos para transferencia / SPEI</p>
                          <p className="text-xs text-blue-700">Banco: <strong>BBVA</strong></p>
                          <p className="text-xs text-blue-700">Titular: <strong>Brenn&apos;s Salón</strong></p>
                          <p className="text-xs text-blue-700">CLABE: <strong>012 345 678 901 234 5</strong></p>
                          <p className="text-xs text-blue-700">Concepto: <strong>tu nombre + fecha de cita</strong></p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                          <p className="text-xs text-amber-700 font-medium">
                            Después de transferir, envía tu comprobante por WhatsApp. Tu cita quedará en <strong>espera</strong> hasta que lo verifiquemos.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* PayPal — próximamente */}
                    {metodoPagoCliente === "TARJETA" && (
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 rounded-xl p-5 text-center">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Pago con PayPal / Tarjeta</p>
                        <p className="text-xs text-gray-400">Próximamente disponible. Por ahora usa transferencia.</p>
                      </div>
                    )}
                  </div>
                )}

                {errorPago && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorPago}
                  </div>
                )}

                {/* Botón confirmar — solo activo para transferencia */}
                {metodoPagoCliente === "TRANSFERENCIA" && (
                  <button
                    type="button"
                    onClick={handleTransferencia}
                    disabled={pagando || !tipoPago}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3.5 rounded-full shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed text-sm mt-4">
                    {pagando
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Registrando cita...</>
                      : <><CheckCircle className="w-4 h-4" /> Registrar cita (enviaré comprobante)</>
                    }
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Sidebar resumen — NUEVO: avatar con imagen ── */}
          <aside className="lg:col-span-1">
            <div className="space-y-4 sticky top-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-pink-50 p-5">
              <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Tu cita</h3>
              {cargandoSrv ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ) : servicio ? (
                <div className="space-y-3">
                  <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                    <p className="font-bold text-gray-800 dark:text-white text-sm">{servicio.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {servicio.duracion}
                    </p>
                    <p className="text-2xl font-black text-pink-600 mt-2">${Number(servicio.precio).toLocaleString()} MXN</p>
                  </div>

                  {empleadoSel && empleadoActual && (
                    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2.5">
                      {empleadoActual.imagen ? (
                        <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={empleadoActual.imagen} alt={empleadoActual.nombre} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {empleadoActual.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{empleadoActual.nombre}</span>
                    </div>
                  )}

                  {fechaSel && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2.5">
                      <Calendar className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span>{format(fechaSel, "d 'de' MMMM, yyyy", { locale: es })}</span>
                    </div>
                  )}

                  {horaSel && (
                    <div className="flex items-center gap-2.5 text-sm bg-gray-50 dark:bg-gray-900 rounded-xl px-3 py-2.5">
                      <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span className="font-bold text-gray-800 dark:text-white">{horaSel}</span>
                    </div>
                  )}

                  {!fechaSel && (
                    <p className="text-xs text-gray-400 text-center pt-1">Selecciona fecha y hora para continuar</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">Servicio no seleccionado</p>
                  <Link href="/servicios" className="text-pink-600 text-sm font-bold mt-2 inline-block hover:underline">Elegir servicio →</Link>
                </div>
              )}
            </div>

            {/* ── Especialista ── */}
            {empleados.length > 0 && paso === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-pink-50 p-5">
                <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-pink-400" /> Especialista
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSelEmpleado(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                      empleadoSel === null
                        ? "border-pink-600 bg-pink-600 text-white shadow-md"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-pink-300"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    Sin preferencia
                  </button>
                  {empleados.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelEmpleado(emp.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                        empleadoSel === emp.id
                          ? "border-pink-600 bg-pink-600 text-white shadow-md"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-pink-300"
                      }`}
                    >
                      {emp.imagen ? (
                        <div className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                          <Image src={emp.imagen} alt={emp.nombre} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                          empleadoSel === emp.id ? "bg-white/20 text-white" : "bg-gradient-to-br from-pink-400 to-rose-500 text-white"
                        }`}>
                          {emp.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {emp.nombre.split(" ")[0]}
                    </button>
                  ))}
                </div>
                {empleadoSel && empleadoActual && (
                  <div className="mt-3 flex items-center gap-2 bg-pink-50 dark:bg-pink-950/20 rounded-xl px-4 py-2.5 border border-pink-100 dark:border-pink-900">
                    <Calendar className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                    <p className="text-xs text-pink-700 dark:text-pink-300 font-medium">
                      <span className="font-bold">{empleadoActual.nombre.split(" ")[0]}</span> atiende los:{" "}
                      {diasAtiende(empleadoSel)
                        .map(d => ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d])
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default function AgendarPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
        </div>
      }>
        <AgendarContenido />
      </Suspense>
    </AuthGuard>
  )
}