"use client"
import React, { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Loader2, ShieldAlert, Mail, Lock } from "lucide-react"

type ErrorCode = "USER_NOT_FOUND" | "WRONG_PASSWORD" | "ACCOUNT_LOCKED" | "ACCOUNT_INACTIVE" | "MISSING_FIELDS" | "SERVER_ERROR" | null

function LoginContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<ErrorCode>(null)
  const [showPassword, setShowPassword] = useState(false)

  const clearErrors = () => { setError(null); setErrorCode(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearErrors()

    if (!email || !password) {
      setError("Por favor completa todos los campos.")
      setErrorCode("MISSING_FIELDS")
      return
    }

    setLoading(true)

    try {
      const check = await fetch("/api/auth/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, password }),
      })

      if (!check.ok) {
        const data = await check.json().catch(() => ({}))
        setError(data.error || "Error al iniciar sesion.")
        setErrorCode((data.code as ErrorCode) || null)
        setLoading(false)
        return
      }

      const result = await signIn("credentials", {
        correo: email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        const next = searchParams?.get("next")
        if (next) { router.push(decodeURIComponent(next)); return }

        await new Promise((r) => setTimeout(r, 800))

        const sessionRes = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
        const session    = await sessionRes.json()
        const role       = session?.user?.role

        if (role === "ADMIN")         router.push("/admin/dashboard")
        else if (role === "EMPLEADO") router.push("/empleado/dashboard")
        else if (role === "DOCENTE")  router.push("/docente/dashboard")
        else                          router.push("/perfil")

        router.refresh()
        return
      }

      setError("Error al iniciar sesion. Intenta de nuevo.")
    } catch {
      setError("Error de conexion con el servidor. Intenta mas tarde.")
      setErrorCode("SERVER_ERROR")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoadingGoogle(true)
    const next = searchParams?.get("next")
    await signIn("google", {
      callbackUrl: next ? decodeURIComponent(next) : "/perfil"
    })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* ── Panel izquierdo — Rosa ── */}
      <div className="hidden md:flex flex-1 relative overflow-hidden flex-col justify-center bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 px-10 py-10">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-pink-300/15 blur-3xl pointer-events-none" />

        {/* Logo + Texto — bloque centrado */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-rose-600 font-black text-base shadow-lg">B</div>
            <span className="text-white font-bold tracking-wide">Brenn&apos;s</span>
          </div>
          <p className="text-rose-100/70 text-xs font-bold uppercase tracking-widest mb-4">Academia · Salón · Distribuidora</p>
          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            Bienvenida<br />
            <span className="text-rose-100">de Nuevo</span>
          </h1>
          <p className="text-white/65 text-base leading-relaxed max-w-[340px]">
            Accede a tu cuenta para continuar aprendiendo, gestionar tus citas o comprar material de la mejor calidad.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 absolute bottom-6 left-10">
          <p className="text-white/25 text-xs">© 2026 Brenn&apos;s · Huejutla de Reyes, Hidalgo</p>
        </div>
      </div>

      {/* ── Panel derecho — Formulario ── */}
      <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-1 text-center text-gray-800 dark:text-white">Iniciar Sesión</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-5">Ingresa tus credenciales para entrar</p>

          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-2.5 px-4 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 transition-all mb-4 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingGoogle ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loadingGoogle ? "Redirigiendo..." : "Continuar con Google"}
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-sm text-gray-400">o inicia con correo</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors() }}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:bg-gray-800 dark:text-white transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
                <Link href="/recuperar-contrasena" className="text-xs text-pink-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErrors() }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 dark:bg-gray-800 dark:text-white transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (() => {
              const isLocked   = errorCode === "ACCOUNT_LOCKED" || errorCode === "ACCOUNT_INACTIVE"
              const isEmail    = errorCode === "USER_NOT_FOUND"
              const isPassword = errorCode === "WRONG_PASSWORD"

              if (isLocked) return (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Acceso restringido</p>
                    <p className="text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )
              if (isEmail) return (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                  <Mail className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-semibold">Correo no encontrado</p>
                    <p className="mt-0.5">{error}</p>
                    <Link href="/register" className="underline text-pink-600 font-medium mt-1 inline-block">Crear una cuenta</Link>
                  </div>
                </div>
              )
              if (isPassword) return (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <Lock className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
                  <div>
                    <p className="font-semibold">Contraseña incorrecta</p>
                    <p className="mt-0.5">{error}</p>
                    <Link href="/recuperar-contrasena" className="underline text-pink-600 font-medium mt-1 inline-block">Recuperar contraseña</Link>
                  </div>
                </div>
              )
              return (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center border border-red-100">{error}</div>
              )
            })()}

            <button
              type="submit"
              disabled={loading || errorCode === "ACCOUNT_LOCKED" || errorCode === "ACCOUNT_INACTIVE"}
              className="w-full bg-pink-600 text-white py-3 rounded-full font-bold text-lg shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin inline mr-2" />Verificando...</>
              ) : "Entrar"}
            </button>
          </form>

          <div className="mt-5 text-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-pink-600 font-bold hover:text-pink-800 hover:underline transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    }>
      <LoginContenido />
    </Suspense>
  )
}
