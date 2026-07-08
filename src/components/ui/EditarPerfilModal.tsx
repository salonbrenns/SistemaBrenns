"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Eye, EyeOff, User, Mail, Phone, Lock, ShieldAlert, Upload, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface CustomUser {
  id?:       number | string
  name?:     string | null
  email?:    string | null
  image?:    string | null
  telefono?: string | null
}

// ✅ Tipo correcto en lugar de any
interface DatosActualizados {
  name:      string
  email:     string
  telefono:  string
  image:     string | null
}

interface EditarPerfilModalProps {
  onClose:       () => void
  onActualizado: (datos: DatosActualizados) => void
}

type Tab = "datos" | "password"

// ✅ Misma función que en PerfilPage para consistencia
function fotoKey(userId?: number | string) {
  return `brenns_foto_perfil_${userId ?? "anon"}`
}

export default function EditarPerfilModal({ onClose, onActualizado }: EditarPerfilModalProps) {
  const { data: session, update } = useSession()
  const [tab, setTab] = useState<Tab>("datos")

  const user = session?.user as CustomUser | undefined

  const [nombre,      setNombre]      = useState(user?.name      ?? "")
  const [correo,      setCorreo]      = useState(user?.email     ?? "")
  const [telefono,    setTelefono]    = useState(user?.telefono  ?? "")
  const [fotoActual,  setFotoActual]  = useState<string | null>(user?.image ?? null)
  const [nuevaFoto,   setNuevaFoto]   = useState<File | null>(null)
  const [previewFoto, setPreviewFoto] = useState<string | null>(null)

  const [loadingDatos,     setLoadingDatos]     = useState(false)
  const [errorDatos,       setErrorDatos]       = useState<string | null>(null)
  const [errorRasp,        setErrorRasp]        = useState<string | null>(null)
  const [exitoDatos,       setExitoDatos]       = useState(false)
  const [subiendoFoto,     setSubiendoFoto]     = useState(false)
  const [errorCloudinary,  setErrorCloudinary]  = useState<string | null>(null)

  const [passwordActual,  setPasswordActual]  = useState("")
  const [passwordNueva,   setPasswordNueva]   = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showActual,      setShowActual]      = useState(false)
  const [showNueva,       setShowNueva]       = useState(false)
  const [loadingPass,     setLoadingPass]     = useState(false)
  const [errorPass,       setErrorPass]       = useState<string | null>(null)
  const [exitoPass,       setExitoPass]       = useState(false)

  useEffect(() => {
    if (nuevaFoto) setPreviewFoto(URL.createObjectURL(nuevaFoto))
  }, [nuevaFoto])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setNuevaFoto(file); setErrorCloudinary(null) }
  }

  const subirFotoCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    const res  = await fetch("/api/usuario/upload-foto", { method: "POST", body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Error al subir la foto")
    return data.url
  }

  const handleGuardarDatos = async () => {
    setErrorDatos(null)
    setErrorRasp(null)
    setErrorCloudinary(null)
    setExitoDatos(false)

    if (!nombre.trim() || !correo.trim()) {
      setErrorDatos("Nombre y correo son requeridos")
      return
    }

    setLoadingDatos(true)
    let imageUrl: string | null = fotoActual

    try {
      if (nuevaFoto) {
        setSubiendoFoto(true)
        imageUrl = await subirFotoCloudinary(nuevaFoto)
      }

      const res = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, telefono, image: imageUrl }),
      })
      const data = await res.json()

      if (res.status === 403) {
        setErrorRasp(data.error ?? "Tu solicitud fue bloqueada por seguridad.")
        return
      }
      if (!res.ok) throw new Error(data.error || "Error al guardar los datos")

      // ✅ Actualizar sesión
      await update({ name: nombre, email: correo, image: imageUrl })

      // ✅ Guardar foto en localStorage para que persista entre navegaciones
      if (imageUrl && user?.id) {
        localStorage.setItem(fotoKey(user.id), imageUrl)
      }

      setFotoActual(imageUrl)
      setNuevaFoto(null)
      setPreviewFoto(null)
      setExitoDatos(true)

      // ✅ Keys correctas: name/email en lugar de nombre/correo
      onActualizado({ name: nombre, email: correo, telefono, image: imageUrl })

      setTimeout(() => setExitoDatos(false), 2500)

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado"
      if (msg.includes("Cloudinary") || msg.includes("NEXT_PUBLIC_CLOUDINARY")) {
        setErrorCloudinary(msg)
      } else {
        setErrorDatos(msg)
      }
    } finally {
      setLoadingDatos(false)
      setSubiendoFoto(false)
    }
  }

  const handleCambiarPassword = async () => {
    setErrorPass(null)
    setExitoPass(false)

    if (!passwordActual || !passwordNueva || !passwordConfirm) {
      setErrorPass("Completa todos los campos"); return
    }
    if (passwordNueva !== passwordConfirm) {
      setErrorPass("Las contraseñas nuevas no coinciden"); return
    }
    if (passwordNueva.length < 8) {
      setErrorPass("La contraseña debe tener mínimo 8 caracteres"); return
    }

    setLoadingPass(true)
    try {
      const res  = await fetch("/api/usuario/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordActual, passwordNueva }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña")

      setExitoPass(true)
      setPasswordActual(""); setPasswordNueva(""); setPasswordConfirm("")
      setTimeout(() => setExitoPass(false), 3000)
    } catch (err: unknown) {
      setErrorPass(err instanceof Error ? err.message : "Error inesperado")
    } finally {
      setLoadingPass(false)
    }
  }

  const fotoParaMostrar = previewFoto ?? fotoActual

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Editar Perfil</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button onClick={() => setTab("datos")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "datos" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"
            }`}>
            Datos Personales
          </button>
          <button onClick={() => setTab("password")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              tab === "password" ? "text-pink-600 border-b-2 border-pink-600" : "text-gray-500 hover:text-gray-700"
            }`}>
            Contraseña
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── Tab: Datos ── */}
          {tab === "datos" && (
            <>
              {/* Foto */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-pink-100 shadow">
                  {fotoParaMostrar ? (
                    <Image src={fotoParaMostrar} alt="Foto de perfil" width={96} height={96}
                      className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-pink-600 flex items-center justify-center text-white text-5xl font-black">
                      {nombre ? nombre.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                <label className="mt-4 cursor-pointer flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold text-sm">
                  <Upload className="w-5 h-5" />
                  {nuevaFoto ? "Cambiar foto seleccionada" : "Cambiar foto de perfil"}
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                </label>
                {subiendoFoto && <p className="text-pink-600 text-xs mt-1">Subiendo foto...</p>}
              </div>

              {/* Campos */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Correo</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)}
                      placeholder="Ej. 9211234567"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm" />
                  </div>
                </div>
              </div>

              {/* Errores y éxito */}
              {errorCloudinary && (
                <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-2xl text-sm flex gap-2">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{errorCloudinary}</span>
                </div>
              )}
              {errorRasp && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Solicitud bloqueada por seguridad</p>
                    <p className="text-red-600 mt-0.5">{errorRasp}</p>
                  </div>
                </div>
              )}
              {errorDatos && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{errorDatos}</p>
              )}
              {exitoDatos && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                  ✓ Datos y foto actualizados correctamente
                </p>
              )}

              <button onClick={handleGuardarDatos} disabled={loadingDatos}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-bold py-3.5 rounded-full transition flex items-center justify-center gap-2">
                {loadingDatos
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Guardando...</>
                  : "Guardar Cambios"}
              </button>
            </>
          )}

          {/* ── Tab: Contraseña ── */}
          {tab === "password" && (
            <div className="space-y-4">
              {[
                { id: "pa", label: "Contraseña actual",          value: passwordActual,  setter: setPasswordActual,  show: showActual, toggle: () => setShowActual(v => !v) },
                { id: "pn", label: "Nueva contraseña",           value: passwordNueva,   setter: setPasswordNueva,   show: showNueva,  toggle: () => setShowNueva(v => !v)  },
                { id: "pc", label: "Confirmar nueva contraseña", value: passwordConfirm, setter: setPasswordConfirm, show: showNueva,  toggle: () => setShowNueva(v => !v)  },
              ].map(({ id, label, value, setter, show, toggle }) => (
                <div key={id}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={show ? "text" : "password"} value={value}
                      onChange={e => setter(e.target.value)} placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 text-sm" />
                    <button type="button" onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}

              {errorPass && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">{errorPass}</p>
              )}
              {exitoPass && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                  ✓ Contraseña actualizada correctamente
                </p>
              )}

              <button onClick={handleCambiarPassword} disabled={loadingPass}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-bold py-3.5 rounded-full transition">
                {loadingPass ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}