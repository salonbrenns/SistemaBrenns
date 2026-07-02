"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, BookOpen, Clock,
  CheckCircle2, Loader2, ArrowLeft, CreditCard, Banknote,
  GraduationCap, AlertCircle, Calendar
} from "lucide-react"
import Link from "next/link"

type Usuario = {
  id: number
  nombre: string
  appaterno: string | null
  apmaterno: string | null
  correo: string
  telefono: string | null
}

type Curso = {
  id: number
  titulo: string
  nivel: string | null
  duracion_horas: number | null
  precio_total: number
  cupo_maximo: number
  inscritos: number
  fecha_inicio: string | null
  fecha_fin: string | null
  imagenes: string[]
}

export default function InscribirseClient({
  usuario,
  curso,
}: {
  usuario: Usuario
  curso: Curso
}) {
  const router = useRouter()
  const [tipoPago, setTipoPago]     = useState<"ANTICIPO" | "COMPLETO">("COMPLETO")
  const [metodoPago, setMetodoPago] = useState<"TRANSFERENCIA" | "TARJETA">("TARJETA")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [exito, setExito]           = useState(false)
  const [pagoInfo, setPagoInfo]     = useState<{ monto: number; metodoPago: string; tipoPago: string } | null>(null)

  const cupoDisponible = curso.cupo_maximo - curso.inscritos
  const montoAnticipo  = curso.precio_total * 0.5
  const montoSeleccionado = tipoPago === "ANTICIPO" ? montoAnticipo : curso.precio_total

  const nombreCompleto = [usuario.nombre, usuario.appaterno, usuario.apmaterno]
    .filter(Boolean)
    .join(" ")

  const formatDate = (d: string | null) => {
    if (!d) return "Por definir"
    return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/cursos/${curso.id}/inscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoPago, metodoPago }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al procesar la inscripción")
        return
      }

      setPagoInfo({ monto: data.monto, metodoPago, tipoPago })
      setExito(true)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // ── Pantalla de éxito ─────────────────────────────────────────
  if (exito && pagoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-rose-100 dark:border-gray-700 shadow-2xl shadow-rose-100/40 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">¡Inscripción Exitosa!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Bienvenida al curso, <span className="font-bold text-gray-700 dark:text-gray-200">{usuario.nombre}</span>
            </p>

            <div className="bg-rose-50 dark:bg-gray-900 rounded-2xl p-6 text-left space-y-3 mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-3">Resumen</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Curso</span>
                <span className="font-bold text-gray-900 dark:text-white text-right max-w-[200px]">{curso.titulo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Alumna</span>
                <span className="font-bold text-gray-900 dark:text-white">{nombreCompleto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Pago</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {pagoInfo.tipoPago === "ANTICIPO" ? "Anticipo 50%" : "Pago completo"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Método</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {pagoInfo.metodoPago === "TRANSFERENCIA" ? "Transferencia bancaria" : "Tarjeta"}
                </span>
              </div>
              <div className="border-t border-rose-100 dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-bold text-gray-700 dark:text-gray-300">Total pagado</span>
                <span className="text-xl font-black text-rose-600">
                  ${pagoInfo.monto.toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>

            {pagoInfo.metodoPago === "TRANSFERENCIA" && (
              <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 mb-6 text-left">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Tu pago por transferencia está <strong>pendiente de verificación</strong>. Te confirmaremos cuando se acredite.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push("/mis-cursos")}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-[2rem] font-black text-base hover:bg-rose-600 dark:hover:bg-rose-100 transition-all"
            >
              Ver mis cursos
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulario ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white dark:from-gray-950 dark:to-gray-900 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href={`/curso/${curso.id}`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-600 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al curso
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* ── Columna izquierda: formulario ─ */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">Confirmar Inscripción</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Revisa tus datos y elige cómo pagar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Datos personales — solo lectura */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Tus datos</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Nombre completo</p>
                      <p className="font-bold text-gray-900 dark:text-white">{nombreCompleto || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Correo</p>
                      <p className="font-bold text-gray-900 dark:text-white">{usuario.correo}</p>
                    </div>
                  </div>
                  {usuario.telefono && (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Teléfono</p>
                        <p className="font-bold text-gray-900 dark:text-white">{usuario.telefono}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  ¿Datos incorrectos?{" "}
                  <Link href="/perfil" className="text-rose-500 hover:underline font-semibold">
                    Edita tu perfil
                  </Link>
                </p>
              </div>

              {/* Tipo de pago */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Tipo de pago</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["COMPLETO", "ANTICIPO"] as const).map((tipo) => {
                    const monto = tipo === "ANTICIPO" ? montoAnticipo : curso.precio_total
                    const label = tipo === "ANTICIPO" ? "Anticipo 50%" : "Pago completo"
                    const desc  = tipo === "ANTICIPO"
                      ? "Pagas la mitad ahora"
                      : "Pagas todo de una vez"
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setTipoPago(tipo)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          tipoPago === tipo
                            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                            : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                        }`}
                      >
                        <p className={`font-black text-sm ${tipoPago === tipo ? "text-rose-600" : "text-gray-700 dark:text-gray-300"}`}>
                          {label}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{desc}</p>
                        <p className={`text-lg font-black mt-2 ${tipoPago === tipo ? "text-rose-600" : "text-gray-900 dark:text-white"}`}>
                          ${monto.toLocaleString("es-MX")} MXN
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Método de pago</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { value: "TARJETA",       label: "Tarjeta",      desc: "Visa / Mastercard",   Icon: CreditCard },
                    { value: "TRANSFERENCIA", label: "Transferencia", desc: "Depósito bancario",   Icon: Banknote   },
                  ] as const).map(({ value, label, desc, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMetodoPago(value)}
                      className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all ${
                        metodoPago === value
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                          : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${metodoPago === value ? "text-rose-500" : "text-gray-400"}`} />
                      <div>
                        <p className={`font-black text-sm ${metodoPago === value ? "text-rose-600" : "text-gray-700 dark:text-gray-300"}`}>
                          {label}
                        </p>
                        <p className="text-gray-400 text-xs">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {metodoPago === "TRANSFERENCIA" && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-700">
                    Tu inscripción quedará <strong>pendiente</strong> hasta que confirmemos tu transferencia.
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cupoDisponible <= 0}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-[2rem] font-black text-base flex items-center justify-center gap-3 hover:bg-rose-600 dark:hover:bg-rose-100 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Procesando...</>
                ) : (
                  <>
                    <GraduationCap className="w-5 h-5" />
                    Inscribirme — ${montoSeleccionado.toLocaleString("es-MX")} MXN
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Columna derecha: resumen del curso ─ */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-7 border border-rose-100 dark:border-gray-700 shadow-xl shadow-rose-50/50 sticky top-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Resumen del curso</p>

              <h2 className="text-xl font-black text-gray-900 dark:text-white leading-snug mb-5">
                {curso.titulo}
              </h2>

              <div className="space-y-3 mb-6">
                {curso.nivel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <span className="capitalize">{curso.nivel}</span>
                  </div>
                )}
                {curso.duracion_horas && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-rose-400" />
                    <span>{curso.duracion_horas} horas</span>
                  </div>
                )}
                {curso.fecha_inicio && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    <span>Inicia {formatDate(curso.fecha_inicio)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Precio total</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${curso.precio_total.toLocaleString("es-MX")} MXN
                  </span>
                </div>
                {tipoPago === "ANTICIPO" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Resto a pagar</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ${montoAnticipo.toLocaleString("es-MX")} MXN
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Pagas ahora</span>
                  <span className="text-xl font-black text-rose-600">
                    ${montoSeleccionado.toLocaleString("es-MX")} MXN
                  </span>
                </div>
              </div>

              {cupoDisponible <= 5 && cupoDisponible > 0 && (
                <div className="mt-5 flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3 text-rose-600 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  ¡Solo {cupoDisponible} lugar{cupoDisponible > 1 ? "es" : ""} disponible{cupoDisponible > 1 ? "s" : ""}!
                </div>
              )}
              {cupoDisponible <= 0 && (
                <div className="mt-5 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl p-3 text-gray-500 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Cupo completo
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
