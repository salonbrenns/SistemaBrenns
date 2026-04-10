"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { X, Eye, EyeOff, User, Mail, Phone, Lock, ShieldAlert } from "lucide-react"

// 1. Definimos la interfaz para extender el usuario de NextAuth
interface CustomUser {
  name?: string | null
  email?: string | null
  image?: string | null
  telefono?: string | null
}

interface EditarPerfilModalProps {
  onClose: () => void
  onActualizado: (datos: { nombre: string; correo: string; telefono?: string | null }) => void
}

type Tab = "datos" | "password"

export default function EditarPerfilModal({ onClose, onActualizado }: EditarPerfilModalProps) {
  const { data: session, update } = useSession()
  const [tab, setTab] = useState<Tab>("datos")

  const user = session?.user as CustomUser | undefined

  // Estados de Datos personales
  const [nombre, setNombre] = useState(user?.name || "")
  const [correo, setCorreo] = useState(user?.email || "")
  const [telefono, setTelefono] = useState(user?.telefono || "")
  const [loadingDatos, setLoadingDatos] = useState(false)
  const [errorDatos, setErrorDatos] = useState<string | null>(null)
  const [errorRasp, setErrorRasp] = useState<string | null>(null) // ← NUEVO: error específico del RASP
  const [exitoDatos, setExitoDatos] = useState(false)

  // Estados de Contraseña
  const [passwordActual, setPasswordActual] = useState("")
  const [passwordNueva, setPasswordNueva] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showActual, setShowActual] = useState(false)
  const [showNueva, setShowNueva] = useState(false)
  const [loadingPass, setLoadingPass] = useState(false)
  const [errorPass, setErrorPass] = useState<string | null>(null)
  const [exitoPass, setExitoPass] = useState(false)

  const handleGuardarDatos = async () => {
    setErrorDatos(null)
    setErrorRasp(null) // ← NUEVO: limpiar error RASP previo
    setExitoDatos(false)

    if (!nombre.trim() || !correo.trim()) {
      setErrorDatos("Nombre y correo son requeridos")
      return
    }

    setLoadingDatos(true)
    try {
      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, telefono }),
      })

      const data = await res.json()

      // ← NUEVO: si el RASP bloqueó la petición, mostrar error especial
      if (res.status === 403) {
        setErrorRasp(data.error ?? "Tu solicitud fue bloqueada por seguridad. Revisa los datos ingresados.")
        return
      }

      if (!res.ok) throw new Error(data.error || "Error al guardar")

      await update({ name: nombre, email: correo })
      setExitoDatos(true)
      onActualizado({ nombre, correo, telefono })
      setTimeout(() => setExitoDatos(false), 3000)

    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error inesperado"
      setErrorDatos(mensaje)
    } finally {
      setLoadingDatos(false)
    }
  }

  const handleCambiarPassword = async () => {
    setErrorPass(null)
    setExitoPass(false)

    if (!passwordActual || !passwordNueva || !passwordConfirm) {
      setErrorPass("Completa todos los campos")
      return
    }
    if (passwordNueva !== passwordConfirm) {
      setErrorPass("Las contraseñas nuevas no coinciden")
      return
    }
    if (passwordNueva.length < 8) {
      setErrorPass("La contraseña debe tener mínimo 8 caracteres")
      return
    }

    setLoadingPass(true)
    try {
      const res = await fetch("/api/usuario/password", {
        method: "PUT",
        headers: { "Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña")

      setExitoPass(true)
      setPasswordActual("")
      setPasswordNueva("")
      setPasswordConfirm("")
      setTimeout(() => setExitoPass(false), 3000)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : "Error inesperado"
      setErrorPass(mensaje)
    } finally {
      setLoadingPass(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Editar Perfil</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab("datos")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "datos"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setTab("password")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "password"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Contraseña
          </button>
        </div>

        <div className="p-6 space-y-4">
          {tab === "datos" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => { setNombre(e.target.value); setErrorRasp(null) }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => { setCorreo(e.target.value); setErrorRasp(null) }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => { setTelefono(e.target.value); setErrorRasp(null) }}
                    placeholder="10 dígitos"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                  />
                </div>
              </div>

              {/* ← NUEVO: Alerta de bloqueo RASP */}
              {errorRasp && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Solicitud bloqueada por seguridad</p>
                    <p className="text-red-600 mt-0.5">{errorRasp}</p>
                  </div>
                </div>
              )}

              {errorDatos && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                  {errorDatos}
                </p>
              )}
              {exitoDatos && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg">
                  ✓ Datos actualizados correctamente
                </p>
              )}

              <button
                onClick={handleGuardarDatos}
                disabled={loadingDatos}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
              >
                {loadingDatos ? "Guardando..." : "Guardar Cambios"}
              </button>
            </>
          )}

          {tab === "password" && (
            <>
              {[
                { id: "pa", label: "Contraseña actual", value: passwordActual, setter: setPasswordActual, show: showActual, toggle: () => setShowActual(!showActual) },
                { id: "pn", label: "Nueva contraseña", value: passwordNueva, setter: setPasswordNueva, show: showNueva, toggle: () => setShowNueva(!showNueva) },
                { id: "pc", label: "Confirmar nueva contraseña", value: passwordConfirm, setter: setPasswordConfirm, show: showNueva, toggle: () => setShowNueva(!showNueva) },
              ].map(({ id, label, value, setter, show, toggle }) => (
                <div key={id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={show ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm"
                    />
                    <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {errorPass && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded-lg">
                  {errorPass}
                </p>
              )}
              {exitoPass && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg">
                  ✓ Contraseña actualizada correctamente
                </p>
              )}

              <button
                onClick={handleCambiarPassword}
                disabled={loadingPass}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-full transition disabled:opacity-50"
              >
                {loadingPass ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}