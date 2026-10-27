"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  User, Mail, Phone, BookOpen, Clock,
  CheckCircle2, Loader2, ArrowLeft, Banknote,
  GraduationCap, AlertCircle, Calendar, Upload,
  ImageIcon, ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useSiteConfig } from "@/hooks/useSiteConfig"

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
  const router      = useRouter()
  const siteConfig  = useSiteConfig()

  // Paso 1: inscripción
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [pagoId, setPagoId]     = useState<number | null>(null)
  const [monto, setMonto]       = useState<number>(0)

  // Paso 2: upload comprobante
  const [archivo, setArchivo]           = useState<File | null>(null)
  const [preview, setPreview]           = useState<string | null>(null)
  const [subiendo, setSubiendo]         = useState(false)
  const [errorUpload, setErrorUpload]   = useState<string | null>(null)
  const [compSubido, setCompSubido]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const cupoDisponible = curso.cupo_maximo - curso.inscritos

  const nombreCompleto = [usuario.nombre, usuario.appaterno, usuario.apmaterno]
    .filter(Boolean)
    .join(" ")

  const formatDate = (d: string | null) => {
    if (!d) return "Por definir"
    return new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })
  }

  const bancoCfg = {
    banco:   siteConfig.banco_banco   || "BBVA",
    titular: siteConfig.banco_titular || "Ruth Barrientos Angeles",
    cuenta:  siteConfig.banco_cuenta  || "154 792 8563",
    clabe:   siteConfig.banco_clabe   || "012 290 01547928563 4",
  }

  // ── Paso 1: Inscribirse ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/cursos/${curso.id}/inscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipoPago: "COMPLETO", metodoPago: "TRANSFERENCIA" }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al procesar la inscripción")
        return
      }

      setPagoId(data.pagoId)
      setMonto(data.monto)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: Procesar archivo seleccionado ─────────────────────────────────
  const procesarArchivo = (f: File) => {
    setErrorUpload(null)
    const TIPOS = ["image/jpeg","image/png","image/webp","image/heic","application/pdf"]
    if (!TIPOS.includes(f.type)) {
      setErrorUpload("Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorUpload("El archivo no debe superar 10 MB.")
      return
    }
    setArchivo(f)
    if (f.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(f))
    } else {
      setPreview(null)
    }
  }

  // ── Paso 2: Subir comprobante ─────────────────────────────────────────────
  const subirComprobante = async () => {
    if (!archivo || !pagoId) return
    setSubiendo(true)
    setErrorUpload(null)
    try {
      const fd = new FormData()
      fd.append("file", archivo)
      const res  = await fetch(`/api/pagos-curso/${pagoId}/comprobante`, { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        setErrorUpload(data.error || "Error al subir comprobante")
        return
      }
      setCompSubido(data.url)
    } catch {
      setErrorUpload("Error de conexión. Intenta de nuevo.")
    } finally {
      setSubiendo(false)
    }
  }

  // ── Pantalla: comprobante enviado con éxito ───────────────────────────────
  if (compSubido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 border border-rose-100 dark:border-gray-700 shadow-2xl shadow-rose-100/40 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">¡Comprobante enviado!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Revisaremos tu transferencia y te confirmaremos por correo a <strong>{usuario.correo}</strong>.
          </p>
          <a href={compSubido} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold mb-8">
            <ExternalLink className="w-4 h-4" /> Ver comprobante enviado
          </a>
          <button
            onClick={() => router.push("/mis-cursos")}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-[2rem] font-black text-base hover:bg-rose-600 dark:hover:bg-rose-100 transition-all"
          >
            Ver mis cursos
          </button>
        </div>
      </div>
    )
  }

  // ── Pantalla: upload de comprobante (después de inscribirse) ──────────────
  if (pagoId !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white dark:from-gray-950 dark:to-gray-900 py-10 px-4">
        <div className="max-w-lg mx-auto">

          {/* Encabezado */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Banknote className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">¡Inscripción registrada!</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Ahora transfiere y sube tu comprobante para activar tu lugar.
            </p>
          </div>

          {/* Datos bancarios */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl p-5 space-y-2 mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300 mb-3">
              Datos para transferencia / SPEI
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Banco: <strong>{bancoCfg.banco}</strong></p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Titular: <strong>{bancoCfg.titular}</strong></p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Cuenta: <strong>{bancoCfg.cuenta}</strong></p>
            <p className="text-sm text-blue-700 dark:text-blue-300">CLABE: <strong>{bancoCfg.clabe}</strong></p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Monto: <strong className="text-rose-600 text-base">${monto.toLocaleString("es-MX")} MXN</strong>
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Concepto: <strong>{nombreCompleto} — {curso.titulo}</strong>
            </p>
          </div>

          {/* Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <p className="text-sm font-black text-gray-800 dark:text-white">Sube tu comprobante</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Una foto o captura de pantalla de tu transferencia. Aceptamos JPG, PNG, WEBP o PDF (máx. 10 MB).
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) procesarArchivo(f) }}
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-rose-200 dark:border-gray-600 rounded-2xl p-8 cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-gray-700/40 transition-all"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-contain" />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-rose-300" />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {archivo ? archivo.name : "Seleccionar imagen del comprobante"}
                  </span>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) procesarArchivo(f) }}
            />

            {errorUpload && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorUpload}
              </p>
            )}

            <button
              onClick={subirComprobante}
              disabled={!archivo || subiendo}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              {subiendo
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                : <><Upload className="w-5 h-5" /> Enviar comprobante</>
              }
            </button>

            <button
              onClick={() => router.push("/mis-cursos")}
              className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
            >
              Subir después desde Mis Cursos →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Formulario de inscripción ─────────────────────────────────────────────
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
              <p className="text-gray-500 dark:text-gray-400 mt-1">Revisa tus datos y confirma para continuar al pago</p>
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

              {/* Método de pago */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Método de pago</p>
                <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 dark:bg-rose-900/20">
                  <Banknote className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="font-black text-sm text-rose-600">Transferencia bancaria</p>
                    <p className="text-gray-400 text-xs">Depósito o SPEI — subirás el comprobante en el siguiente paso</p>
                  </div>
                </div>
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
                    Continuar al pago — ${curso.precio_total.toLocaleString("es-MX")} MXN
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

              <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Total a pagar</span>
                  <span className="text-xl font-black text-rose-600">
                    ${curso.precio_total.toLocaleString("es-MX")} MXN
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
