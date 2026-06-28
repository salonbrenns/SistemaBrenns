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
      <div className="flex-1 bg-gradient-to-br from-pink-500 to-rose-600 p-8 md:p-12 flex flex-col justify-center items-start text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="z-10 relative">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-pink-600 font-bold">B</div>
            <span className="text-xl font-bold tracking-wide">{"Brenn's"}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Bienvenida <br />
            <span className="text-pink-200">de Nuevo</span>
          </h1>
          <p className="text-lg md:text-xl text-pink-50 max-w-lg leading-relaxed">
            Accede a tu cuenta para continuar aprendiendo, gestionar tus citas o comprar material de la mejor calidad.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-pink-50 dark:bg-gray-900 p-8 flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-pink-100 dark:border-gray-700">
          <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">Iniciar Sesion</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Ingresa tus credenciales para entrar</p>

          <button
            onClick={handleGoogle}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-full py-3 px-4 hover:bg-gray-50 dark:bg-gray-900 transition-all mb-6 font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-sm text-gray-400">o inicia con correo</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Correo Electronico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearErrors() }}
                placeholder="tucorreo@ejemplo.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contrasena</label>
                <Link href="/recuperar-contrasena" className="text-xs text-pink-600 hover:underline">
                  Olvidaste tu contrasena?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearErrors() }}
                  placeholder="..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (() => {
              const isLocked   = errorCode === "ACCOUNT_LOCKED" || errorCode === "ACCOUNT_INACTIVE"
              const isEmail    = errorCode === "USER_NOT_FOUND"
              const isPassword = errorCode === "WRONG_PASSWORD"

              if (isLocked) return (
                <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Acceso restringido</p>
                    <p className="text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )

              if (isEmail) return (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-3 text-sm">
                  <Mail className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-semibold">Correo no encontrado</p>
                    <p className="mt-0.5">{error}</p>
                    <Link href="/register" className="underline text-pink-600 font-medium mt-1 inline-block">
                      Crear una cuenta
                    </Link>
                  </div>
                </div>
              )

              if (isPassword) return (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <Lock className="w-5 h-5 mt-0.5 shrink-0 text-red-400" />
                  <div>
                    <p className="font-semibold">Contrasena incorrecta</p>
                    <p className="mt-0.5">{error}</p>
                    <Link href="/recuperar-contrasena" className="underline text-pink-600 font-medium mt-1 inline-block">
                      Recuperar contrasena
                    </Link>
                  </div>
                </div>
              )

              return (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100">
                  {error}
                </div>
              )
            })()}

            <button
              type="submit"
              disabled={loading || errorCode === "ACCOUNT_LOCKED" || errorCode === "ACCOUNT_INACTIVE"}
              className="w-full bg-pink-600 text-white py-3 rounded-full font-bold text-lg shadow-lg hover:bg-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                  Verificando...
                </>
              ) : "Entrar"}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-gray-100 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No tienes cuenta?{" "}
              <Link href="/register" className="text-pink-600 font-bold hover:text-pink-800 hover:underline transition-colors">
                Registrate aqui
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
      </div>
    }>
      <LoginContenido />
    </Suspense>
  )
}
