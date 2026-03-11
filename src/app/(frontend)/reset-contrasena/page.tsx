// src/app/(frontend)/reset-contraseña/page.tsx
"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle } from "lucide-react"

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password,   setPassword]   = useState("")
  const [confirmar,  setConfirmar]  = useState("")
  const [verPass,    setVerPass]    = useState(false)
  const [verConf,    setVerConf]    = useState(false)
  const [cargando,   setCargando]   = useState(false)
  const [error,      setError]      = useState("")
  const [exito,      setExito]      = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!password) { setError("Ingresa una contraseña"); return }
    if (password.length < 6) { setError("Mínimo 6 caracteres"); return }
    if (password !== confirmar) { setError("Las contraseñas no coinciden"); return }
    if (!token) { setError("Token inválido"); return }

    setCargando(true)
    try {
      const res = await fetch("/api/auth/reset-contrasena", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al restablecer")
      setExito(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al restablecer")
    } finally {
      setCargando(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Enlace inválido</h2>
        <p className="text-gray-500 mb-6 text-sm">Este enlace no es válido o ya expiró.</p>
        <Link href="/recuperar-contraseña"
          className="bg-pink-600 text-white font-bold px-6 py-3 rounded-full hover:bg-pink-700 transition">
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (exito) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">¡Contraseña actualizada!</h2>
        <p className="text-gray-500 mb-8 text-sm">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Link href="/login"
          className="bg-pink-600 text-white font-bold px-8 py-3 rounded-full hover:bg-pink-700 transition">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Nueva contraseña</h1>
        <p className="text-gray-500 mt-2 text-sm">Elige una contraseña segura para tu cuenta.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={verPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 text-sm"
            />
            <button onClick={() => setVerPass(!verPass)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              {verPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type={verConf ? "text" : "password"}
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Repite la contraseña"
              className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-400 text-sm"
            />
            <button onClick={() => setVerConf(!verConf)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              {verConf ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={cargando}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2">
          {cargando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar contraseña"}
        </button>
      </div>
    </>
  )
}

export default function ResetContrasenaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full">
        <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-pink-400 animate-spin" /></div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}