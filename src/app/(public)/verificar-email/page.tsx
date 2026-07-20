"use client"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, CheckCircle2, XCircle, MailCheck } from "lucide-react"

function VerificarContenido() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [estado, setEstado] = useState<"cargando" | "ok" | "error" | "expirado" | "sinToken">(
    () => (token ? "cargando" : "sinToken")
  )
  const [errorMsg, setErrorMsg] = useState("")
  const [reenviando, setReenviando] = useState(false)
  const [correoInput, setCorreoInput] = useState("")
  const [reenviado, setReenviado] = useState(false)

  useEffect(() => {
    if (!token) return

    fetch(`/api/auth/verificar-email?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.ok) {
          setEstado("ok")
        } else if (data.code === "TOKEN_EXPIRED") {
          setEstado("expirado")
        } else {
          setErrorMsg(data.error ?? "Token inválido")
          setEstado("error")
        }
      })
      .catch(() => { setErrorMsg("Error de conexión"); setEstado("error") })
  }, [token])

  const handleReenviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setReenviando(true)
    await fetch("/api/auth/reenviar-verificacion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correoInput }),
    })
    setReenviando(false)
    setReenviado(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      {/* Logo arriba */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg">
              B
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Brenn&apos;s</span>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 text-center">

          {/* Cargando */}
          {estado === "cargando" && (
            <>
              <Loader2 className="w-14 h-14 text-pink-500 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white">Verificando tu correo...</h2>
            </>
          )}

          {/* Éxito */}
          {estado === "ok" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Correo verificado!</h2>
              <p className="text-gray-400 mb-8">Tu cuenta está activa. Ya puedes iniciar sesión.</p>
              <Link
                href="/login"
                className="inline-block w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 px-10 rounded-2xl shadow hover:shadow-lg hover:from-pink-500 hover:to-rose-500 transition-all"
              >
                Iniciar sesión
              </Link>
            </>
          )}

          {/* Token inválido */}
          {estado === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-9 h-9 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enlace inválido</h2>
              <p className="text-gray-400 mb-6">{errorMsg}</p>
              <ReenviarForm
                correoInput={correoInput}
                setCorreoInput={setCorreoInput}
                reenviando={reenviando}
                reenviado={reenviado}
                onSubmit={handleReenviar}
              />
            </>
          )}

          {/* Token expirado */}
          {estado === "expirado" && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-9 h-9 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enlace expirado</h2>
              <p className="text-gray-400 mb-6">El enlace de verificación venció. Solicita uno nuevo:</p>
              <ReenviarForm
                correoInput={correoInput}
                setCorreoInput={setCorreoInput}
                reenviando={reenviando}
                reenviado={reenviado}
                onSubmit={handleReenviar}
              />
            </>
          )}

          {/* Sin token — recién registrado */}
          {estado === "sinToken" && (
            <>
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-9 h-9 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Revisa tu correo</h2>
              <p className="text-gray-400 mb-6">
                Te enviamos un enlace de verificación.<br />
                Haz clic en él para activar tu cuenta.
              </p>
              <ReenviarForm
                correoInput={correoInput}
                setCorreoInput={setCorreoInput}
                reenviando={reenviando}
                reenviado={reenviado}
                onSubmit={handleReenviar}
              />
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-500">
            ¿Ya verificaste?{" "}
            <Link href="/login" className="text-pink-400 font-medium hover:text-pink-300 transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReenviarForm({
  correoInput, setCorreoInput, reenviando, reenviado, onSubmit,
}: {
  correoInput: string
  setCorreoInput: (v: string) => void
  reenviando: boolean
  reenviado: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  if (reenviado) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
        <p className="text-emerald-400 text-sm font-medium">
          ✅ Si el correo existe y no está verificado, recibirás un nuevo enlace en minutos.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={correoInput}
        onChange={e => setCorreoInput(e.target.value)}
        placeholder="tu@correo.com"
        className="w-full px-4 py-3 rounded-2xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none text-sm transition-colors"
      />
      <button
        type="submit"
        disabled={reenviando}
        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-3 rounded-2xl shadow hover:from-pink-500 hover:to-rose-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {reenviando
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          : "Reenviar enlace"
        }
      </button>
    </form>
  )
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    }>
      <VerificarContenido />
    </Suspense>
  )
}
