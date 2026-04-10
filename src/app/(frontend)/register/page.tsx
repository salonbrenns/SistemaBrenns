"use client"
import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { validarRegistro } from "@/lib/validation"
import { Eye, EyeOff,Loader2, Sparkles } from "lucide-react"

function RegisterContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [appaterno, setAppaterno] = useState("")
  const [apmaterno, setApmaterno] = useState("")
  const [telefono, setTelefono] = useState("")
  const [countryCode, setCountryCode] = useState("+52")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false,
  })

  const handleNameChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "")
      setter(value)
    }

  useEffect(() => {
    if (password) {
      setPasswordRequirements({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password),
      })
    } else {
      setPasswordRequirements({ length: false, uppercase: false, lowercase: false, number: false, symbol: false })
    }
  }, [password])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    if (value.length <= 10) setTelefono(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (telefono.length !== 10) {
      setError("El teléfono debe tener exactamente 10 dígitos")
      return
    }

    if (!acceptTerms) {
      setError("Debes aceptar los Términos y Condiciones")
      return
    }

    const validacion = validarRegistro({ nombre: name, email, password })
    if (!validacion.valido) {
      setError("Por favor completa correctamente todos los campos")
      return
    }

    setLoading(true)

    try {
      const fullPhone = `${countryCode}${telefono}`
      const fullName = `${name} ${appaterno} ${apmaterno}`.trim()

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: fullName, 
          email, 
          password, 
          telefono: fullPhone 
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Error en el registro")

      const { signIn } = await import("next-auth/react")
      const result = await signIn("credentials", { 
        correo: email, 
        password, 
        redirect: false 
      })

      if (result?.error) throw new Error(result.error)

      const next = searchParams?.get("next")
      router.push(next ? decodeURIComponent(next) : "/perfil")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const allRequirementsMet = Object.values(passwordRequirements).every((v) => v)
  const isFormValid = name && appaterno && email && password && 
                      allRequirementsMet && 
                      telefono.length === 10 && 
                      acceptTerms

  return (
    <div className="min-h-screen flex font-sans bg-pink-50">
      {/* Columna Izquierda - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#ffffff15_0%,transparent_70%)]" />
        
        <div className="relative z-10 max-w-md text-center px-8">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-pink-600 font-black text-5xl shadow-2xl">
              B
            </div>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Bienvenida a<br />Brenn&apos;s
          </h1>
          <p className="text-pink-100 text-xl">
            Crea tu cuenta y comienza tu formación profesional en manicure y belleza
          </p>
          <div className="mt-12 flex justify-center gap-2 text-pink-200">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm">+500 alumnas capacitadas</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-2xl">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">Crear Cuenta</h2>
                <p className="text-gray-500 mt-2">Regístrate para comenzar tu camino en el mundo de la belleza Brenn&apos;s</p>
              </div>
              <div className="hidden md:block">
            
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Sección 1: Información Personal */}
            <div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange(setName)}
                    placeholder="Brenda"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Paterno</label>
                  <input
                    type="text"
                    value={appaterno}
                    onChange={handleNameChange(setAppaterno)}
                    placeholder="García"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido Materno</label>
                  <input
                    type="text"
                    value={apmaterno}
                    onChange={handleNameChange(setApmaterno)}
                    placeholder="Hernández"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg"
                  />
                </div>
                
                {/* --- AQUI SE INTERCAMBIÓ EL CORREO POR EL TELÉFONO --- */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-24 px-2 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 bg-white text-base outline-none cursor-pointer"
                    >
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+57">🇨🇴 +57</option>
                    </select>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={handlePhoneChange}
                      placeholder="5512345678"
                      className="flex-1 px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* --- AQUI SE INTERCAMBIÓ EL TELÉFONO POR EL CORREO --- */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg"
                />
              </div>
            </div>

            {/* Sección 2: Seguridad */}
            <div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none text-lg pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>

                {password && (
                  <div className="mt-4 bg-pink-50 p-5 rounded-3xl border border-pink-100">
                    <p className="text-xs font-semibold text-pink-700 mb-3">LA CONTRASEÑA DEBE CONTENER:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm">
                      {[
                        { key: "length", label: "Mínimo 8 caracteres" },
                        { key: "uppercase", label: "Una letra mayúscula" },
                        { key: "lowercase", label: "Una letra minúscula" },
                        { key: "number", label: "Un número" },
                        { key: "symbol", label: "Un símbolo especial" },
                      ].map(({ key, label }) => (
                        <div key={key} className={`flex items-center gap-3 ${passwordRequirements[key as keyof typeof passwordRequirements] ? "text-emerald-600" : "text-gray-400"}`}>
                          <div className={`w-3 h-3 rounded-full ${passwordRequirements[key as keyof typeof passwordRequirements] ? "bg-emerald-500" : "bg-gray-300"}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>


            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 text-lg rounded-3xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>            
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-5 h-5 accent-pink-600 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                Acepto los{" "}
                <Link href="/terminos" className="text-pink-600 hover:underline font-medium">
                  Términos y Condiciones
                </Link>{" "}
                de Brenn&apos;s
              </label>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-pink-600 font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    }>
      <RegisterContenido />
    </Suspense>
  )
}