// src/app/(frontend)/agendar/page.tsx
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import AuthGuard from "@/components/ui/AuthGuard"
import Breadcrumb from "@/components/Breadcrumb"
import {
  ChevronLeft, ChevronRight, Clock, Calendar,
  CreditCard, CheckCircle, Lock, Loader2, AlertCircle
} from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, isBefore, isToday, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

type Servicio = {
  id: number
  nombre: string
  precio: number
  duracion: string
  imagen: string | null
}

type Horario = {
  id: number
  hora: string
  disponible: boolean
}

function AgendarContenido() {
  useSession()
  const searchParams = useSearchParams()
  const servicioId   = searchParams.get("servicioId")

  const [paso,          setPaso]          = useState<1 | 2>(1)
  const [servicio,      setServicio]      = useState<Servicio | null>(null)
  const [cargandoSrv,   setCargandoSrv]   = useState(true)
  const [mesActual,     setMesActual]     = useState(new Date())
  const [fechaSel,      setFechaSel]      = useState<Date | null>(null)
  const [horarios,      setHorarios]      = useState<Horario[]>([])
  const [cargandoHor,   setCargandoHor]   = useState(false)
  const [horaSel,       setHoraSel]       = useState<string | null>(null)
  const [notas,         setNotas]         = useState("")
  const [diasBloqueados, setDiasBloqueados] = useState<string[]>([])

  const [form, setForm] = useState({
    nombreTarjeta: "", numeroTarjeta: "", expiracion: "", cvv: "",
  })
  const [pagando,   setPagando]   = useState(false)
  const [errorPago, setErrorPago] = useState("")
  const [exito,     setExito]     = useState(false)

  useEffect(() => {
    if (!servicioId) { setCargandoSrv(false); return }
    fetch(`/api/servicios/${servicioId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setServicio(data); setCargandoSrv(false) })
      .catch(() => setCargandoSrv(false))
  }, [servicioId])

  

  // Cargar días bloqueados
  useEffect(() => {
    fetch("/api/dias-bloqueados")
      .then(r => r.json())
      .then((data: { fecha: string }[]) => {
        setDiasBloqueados(data.map(d => d.fecha.slice(0, 10)))
      })
      .catch(() => {})
  }, [])

 useEffect(() => {
  if (!fechaSel) return
  setCargandoHor(true)
  setHoraSel(null)
  const fechaStr = format(fechaSel, "yyyy-MM-dd")
  fetch(`/api/horarios?fecha=${fechaStr}&servicioId=${servicioId || ""}`)
    .then(r => r.json())
    .then(data => {
      setHorarios(Array.isArray(data) ? data : [])  // ← cambio aquí
      setCargandoHor(false)
    })
    .catch(() => { setHorarios([]); setCargandoHor(false) })
}, [fechaSel, servicioId])

  const diasDelMes = eachDayOfInterval({
    start: startOfMonth(mesActual),
    end:   endOfMonth(mesActual),
  })
  const hoy    = new Date()
  const offset = startOfMonth(mesActual).getDay() === 0
    ? 6 : startOfMonth(mesActual).getDay() - 1

  const handlePago = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorPago("")
    if (!form.nombreTarjeta || !form.numeroTarjeta || !form.expiracion || !form.cvv) {
      setErrorPago("Completa todos los datos de pago"); return
    }
    if (!fechaSel || !horaSel || !servicioId) {
      setErrorPago("Faltan datos de la cita"); return
    }
    setPagando(true)
    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicio_id: Number(servicioId),
          fecha:       format(fechaSel, "yyyy-MM-dd"),
          hora:        horaSel,
          notas,
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al confirmar")
      setExito(true)
    } catch (err: unknown) {
     setErrorPago(err instanceof Error ? err.message : "Error al confirmar")
    } finally {
      setPagando(false)
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center py-20">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">¡Cita confirmada!</h2>
          <p className="text-gray-600 mb-2"><strong>{servicio?.nombre}</strong></p>
          <p className="text-gray-500 mb-1">
            {fechaSel && format(fechaSel, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
          <p className="text-pink-600 font-bold text-xl mb-8">{horaSel}</p>
          <div className="flex gap-4 justify-center">
            <Link href="/mis-cursos" className="bg-pink-600 text-white font-bold px-8 py-3 rounded-full hover:bg-pink-700 transition">
              Ver mis citas
            </Link>
            <Link href="/servicios" className="border-2 border-pink-200 text-pink-600 font-bold px-8 py-3 rounded-full hover:bg-pink-50 transition">
              Ver servicios
            </Link>
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
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Servicio no encontrado</h2>
          <Link href="/servicios" className="text-pink-600 font-bold hover:underline">Ver todos los servicios</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        <Breadcrumb items={[
          { label: "Servicios", href: "/servicios" },
          { label: servicio?.nombre || "Agendar", href: "#" },
          { label: "Agendar Cita", href: "#", active: true },
        ]} />

        <div className="flex items-center justify-center gap-4 my-8">
          {[{ n: 1, label: "Fecha y hora" }, { n: 2, label: "Pago" }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition ${
                paso >= n ? "bg-pink-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>{n}</div>
              <span className={`text-sm font-medium hidden sm:block ${paso >= n ? "text-pink-600" : "text-gray-400"}`}>{label}</span>
              {n < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {paso === 1 && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Selecciona fecha
                </h2>

                <div className="bg-pink-50/50 rounded-2xl p-5 border border-pink-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-pink-700 capitalize">
                      {format(mesActual, "MMMM yyyy", { locale: es })}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={() => setMesActual(subMonths(mesActual, 1))}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-pink-100 transition border border-pink-100">
                        <ChevronLeft className="w-4 h-4 text-pink-600" />
                      </button>
                      <button onClick={() => setMesActual(addMonths(mesActual, 1))}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-pink-100 transition border border-pink-100">
                        <ChevronRight className="w-4 h-4 text-pink-600" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {["Lu","Ma","Mi","Ju","Vi","Sá","Do"].map(d => (
                      <div key={d} className="text-pink-400 text-xs font-bold uppercase">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
                    {diasDelMes.map(dia => {
                      const pasado    = isBefore(dia, hoy) && !isToday(dia)
                      const esDom     = dia.getDay() === 0
                      const fechaStr  = format(dia, "yyyy-MM-dd")
                      const bloqueado = diasBloqueados.includes(fechaStr)
                      const selected  = fechaSel && isSameDay(dia, fechaSel)
                      const disabled  = pasado || esDom || bloqueado

                      return (
                        <button
                          key={dia.toISOString()}
                          disabled={disabled}
                          onClick={() => setFechaSel(dia)}
                          title={bloqueado ? "Día sin servicio" : undefined}
                          className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all relative ${
                            selected
                              ? "bg-pink-600 text-white shadow-md scale-105"
                              : bloqueado
                              ? "bg-orange-50 text-orange-300 cursor-not-allowed"
                              : disabled
                              ? "text-gray-300 cursor-not-allowed"
                              : isToday(dia)
                              ? "bg-pink-100 text-pink-600 border-2 border-pink-300"
                              : "bg-white hover:bg-pink-100 text-gray-700"
                          }`}
                        >
                          {format(dia, "d")}
                          {bloqueado && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-pink-600 inline-block" /> Seleccionado
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded bg-orange-50 border border-orange-200 inline-block" /> Sin servicio
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Los domingos no hay servicio</p>
                </div>

                {fechaSel && (
                  <div className="mt-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-500" />
                      Horarios para el {format(fechaSel, "EEEE d 'de' MMMM", { locale: es })}
                    </h3>
                    {cargandoHor ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                      </div>
                    ) : horarios.length === 0 ? (
                      <div className="text-center py-6 bg-gray-50 rounded-2xl">
                        <p className="text-gray-500">No hay horarios disponibles para este día</p>
                        <p className="text-xs text-gray-400 mt-1">El administrador aún no ha configurado horarios</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {horarios.map(h => (
                          <button key={h.id} disabled={!h.disponible} onClick={() => setHoraSel(h.hora)}
                            className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                              !h.disponible
                                ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through"
                                : horaSel === h.hora
                                ? "bg-pink-600 text-white border-pink-600 shadow-md"
                                : "bg-white border-pink-100 hover:border-pink-300 text-gray-700"
                            }`}>
                            {h.hora}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {fechaSel && horaSel && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notas adicionales (opcional)</label>
                    <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                      placeholder="Ej: Alergia a ciertos productos, uñas muy cortas..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition resize-none" />
                  </div>
                )}

                <button onClick={() => setPaso(2)} disabled={!fechaSel || !horaSel}
                  className="mt-8 w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-full shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                  Continuar al pago →
                </button>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <button onClick={() => setPaso(1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 mb-6 transition">
                  <ChevronLeft className="w-4 h-4" /> Cambiar fecha u hora
                </button>
                <h2 className="text-xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Datos de pago
                </h2>
                <form onSubmit={handlePago} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre en la tarjeta</label>
                    <input value={form.nombreTarjeta} onChange={e => setForm({ ...form, nombreTarjeta: e.target.value })}
                      placeholder="Ana Karen Gómez"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition" />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de tarjeta</label>
                    <input value={form.numeroTarjeta} onChange={e => setForm({ ...form, numeroTarjeta: e.target.value })}
                      maxLength={19} placeholder="1234 5678 9012 3456"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 pl-12 text-sm focus:outline-none focus:border-pink-400 transition" />
                    <CreditCard className="absolute left-4 top-10 w-5 h-5 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">MM / AA</label>
                      <input value={form.expiracion} onChange={e => setForm({ ...form, expiracion: e.target.value })}
                        placeholder="12/28" maxLength={5}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                      <input value={form.cvv} onChange={e => setForm({ ...form, cvv: e.target.value })}
                        placeholder="123" maxLength={4} type="password"
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-pink-400 transition" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="w-3 h-3" /> Pago seguro con encriptación SSL
                  </div>
                  {errorPago && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorPago}
                    </div>
                  )}
                  <button type="submit" disabled={pagando}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 rounded-full shadow-lg transition flex items-center justify-center gap-3 disabled:opacity-50">
                    {pagando
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</>
                      : <><CheckCircle className="w-5 h-5" /> Pagar ${servicio?.precio?.toLocaleString()} MXN</>
                    }
                  </button>
                </form>
              </div>
            </div>
          )}

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-6 border border-pink-50">
              <h3 className="text-base font-bold text-pink-600 mb-4">Tu cita</h3>
              {cargandoSrv ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              ) : servicio ? (
                <div className="space-y-4">
                  <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100">
                    <p className="font-bold text-gray-800">{servicio.nombre}</p>
                    <p className="text-sm text-gray-500 mt-1">{servicio.duracion}</p>
                    <p className="text-2xl font-black text-pink-600 mt-2">${Number(servicio.precio).toLocaleString()} MXN</p>
                  </div>
                  {fechaSel && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Calendar className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span>{format(fechaSel, "d 'de' MMMM, yyyy", { locale: es })}</span>
                    </div>
                  )}
                  {horaSel && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
                      <Clock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span className="font-bold text-gray-800">{horaSel}</span>
                    </div>
                  )}
                  {!fechaSel && <p className="text-xs text-gray-400 text-center">Selecciona fecha y hora para continuar</p>}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">Servicio no seleccionado</p>
                  <Link href="/servicios" className="text-pink-600 text-sm font-bold mt-2 inline-block hover:underline">Elegir servicio →</Link>
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