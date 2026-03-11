// src/app/(frontend)/recuperar-contraseña/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react"

export default function RecuperarContrasenaPage() {
  const [correo,   setCorreo]   = useState("")
  const [enviado,  setEnviado]  = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error,    setError]    = useState("")

  const handleSubmit = async () => {
    setError("")
    if (!correo) { setError("Ingresa tu correo electrónico"); return }

    setCargando(true)
    try {
      const res = await fetch("/api/auth/recuperar-contrasena", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ correo }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al enviar")
      setEnviado(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al enviar")
    } finally {
      setCargando(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Correo enviado!</h2>
          <p className="text-gray-500 mb-2">
            Si <strong>{correo}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-sm text-gray-400 mb-8">Revisa también tu carpeta de spam.</p>
          <Link href="/login"
            className="inline-flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">¿Olvidaste tu contraseña?</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={correo}
                onChange={e => setCorreo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={cargando}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2">
            {cargando ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : "Enviar enlace"}
          </button>
        </div>

        <div className="text-center mt-6">
          <Link href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-600 transition font-medium">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}