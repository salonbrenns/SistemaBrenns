'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  UserCircle, Mail, Phone, Lock, Eye, EyeOff,
  Upload, Loader2, CheckCircle2, AlertCircle, Save,
} from 'lucide-react'

interface CustomUser {
  id?:       number | string
  name?:     string | null
  email?:    string | null
  image?:    string | null
  telefono?: string | null
}

type Tab = 'datos' | 'password'

export default function MiCuentaPage() {
  const { data: session, update } = useSession()
  const user = session?.user as CustomUser | undefined

  const [tab, setTab] = useState<Tab>('datos')

  /* ── Datos personales ── */
  const [nombre,      setNombre]      = useState('')
  const [correo,      setCorreo]      = useState('')
  const [telefono,    setTelefono]    = useState('')
  const [fotoActual,  setFotoActual]  = useState<string | null>(null)
  const [nuevaFoto,   setNuevaFoto]   = useState<File | null>(null)
  const [preview,     setPreview]     = useState<string | null>(null)
  const [subiendoF,   setSubiendoF]   = useState(false)
  const [guardando,   setGuardando]   = useState(false)
  const [exitoDatos,  setExitoDatos]  = useState(false)
  const [errorDatos,  setErrorDatos]  = useState<string | null>(null)

  /* ── Contraseña ── */
  const [passActual,   setPassActual]   = useState('')
  const [passNueva,    setPassNueva]    = useState('')
  const [passConfirm,  setPassConfirm]  = useState('')
  const [showActual,   setShowActual]   = useState(false)
  const [showNueva,    setShowNueva]    = useState(false)
  const [guardandoP,   setGuardandoP]   = useState(false)
  const [exitoPass,    setExitoPass]    = useState(false)
  const [errorPass,    setErrorPass]    = useState<string | null>(null)

  const fotoKey = (id?: number | string) => `brenns_foto_perfil_${id ?? 'anon'}`

  /* Cargar sesión + foto de localStorage */
  useEffect(() => {
    if (user) {
      setNombre(user.name  ?? '')
      setCorreo(user.email ?? '')
      setTelefono((user.telefono as string | null) ?? '')
      // Prioridad: session.user.image → localStorage
      const cached = localStorage.getItem(fotoKey(user.id))
      setFotoActual(user.image ?? cached ?? null)
    }
  }, [user])

  /* Preview foto nueva */
  useEffect(() => {
    if (nuevaFoto) setPreview(URL.createObjectURL(nuevaFoto))
  }, [nuevaFoto])

  /* ── Handlers ── */
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setNuevaFoto(file)
  }

  const subirFoto = async (file: File): Promise<string> => {
    const fd = new FormData()
    fd.append('file', file)
    const res  = await fetch('/api/usuario/upload-foto', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Error al subir la foto')
    return data.url
  }

  const guardarFotoEnBD = async (imageUrl: string) => {
    await fetch('/api/usuario/foto', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: imageUrl }),
    })
  }

  const handleGuardarDatos = async () => {
    setErrorDatos(null)
    setExitoDatos(false)
    if (!nombre.trim() || !correo.trim()) {
      setErrorDatos('Nombre y correo son requeridos')
      return
    }
    setGuardando(true)
    let imageUrl: string | null = fotoActual
    try {
      // 1. Subir foto si hay una nueva
      if (nuevaFoto) {
        setSubiendoF(true)
        imageUrl = await subirFoto(nuevaFoto)
        setSubiendoF(false)
        // Guardar URL en BD y localStorage
        await guardarFotoEnBD(imageUrl)
        if (user?.id) localStorage.setItem(fotoKey(user.id), imageUrl)
      }

      // 2. Guardar datos personales
      const res  = await fetch('/api/usuario/perfil', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, correo, telefono }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al guardar')

      // 3. Actualizar sesión
      await update({ name: nombre, email: correo, image: imageUrl })
      setFotoActual(imageUrl)
      setNuevaFoto(null)
      setPreview(null)
      setExitoDatos(true)
      setTimeout(() => setExitoDatos(false), 3000)
    } catch (err: unknown) {
      setErrorDatos(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setGuardando(false)
      setSubiendoF(false)
    }
  }

  const handleCambiarPassword = async () => {
    setErrorPass(null)
    setExitoPass(false)
    if (!passActual || !passNueva || !passConfirm) {
      setErrorPass('Completa todos los campos')
      return
    }
    if (passNueva !== passConfirm) {
      setErrorPass('Las contraseñas nuevas no coinciden')
      return
    }
    if (passNueva.length < 8) {
      setErrorPass('Mínimo 8 caracteres')
      return
    }
    setGuardandoP(true)
    try {
      const res  = await fetch('/api/usuario/password', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ passwordActual: passActual, passwordNueva: passNueva }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cambiar contraseña')
      setExitoPass(true)
      setPassActual(''); setPassNueva(''); setPassConfirm('')
      setTimeout(() => setExitoPass(false), 3000)
    } catch (err: unknown) {
      setErrorPass(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setGuardandoP(false)
    }
  }

  const fotoMostrar = preview ?? fotoActual
  const inicial     = nombre ? nombre.charAt(0).toUpperCase() : 'A'

  return (
    <div className="max-w-2xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-pink-500" /> Mi Cuenta
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Administra tu información personal y contraseña
        </p>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-6">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-pink-100 dark:border-pink-900 shadow-md flex-shrink-0">
          {fotoMostrar ? (
            <Image src={fotoMostrar} alt="Foto" fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-3xl font-black">
              {inicial}
            </div>
          )}
          {subiendoF && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="font-bold text-gray-900 dark:text-white text-lg">{nombre || 'Sin nombre'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{correo}</p>
          <label className="cursor-pointer inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-semibold text-sm mt-1">
            <Upload className="w-4 h-4" />
            {nuevaFoto ? nuevaFoto.name : 'Cambiar foto'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit border border-gray-200 dark:border-gray-700">
        {([
          { id: 'datos',    label: 'Datos personales' },
          { id: 'password', label: 'Contraseña'       },
        ] as { id: Tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-pink-600 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Datos ── */}
      {tab === 'datos' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <Field label="Nombre completo" icon={<UserCircle className="w-4 h-4 text-gray-400" />}>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className={INPUT_CLS}
              placeholder="Tu nombre"
            />
          </Field>

          <Field label="Correo electrónico" icon={<Mail className="w-4 h-4 text-gray-400" />}>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              className={INPUT_CLS}
              placeholder="correo@ejemplo.com"
            />
          </Field>

          <Field label="Teléfono" icon={<Phone className="w-4 h-4 text-gray-400" />} optional>
            <input
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              className={INPUT_CLS}
              placeholder="Ej. 9211234567"
            />
          </Field>

          {errorDatos && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorDatos}
            </div>
          )}
          {exitoDatos && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Datos actualizados correctamente
            </div>
          )}

          <button
            onClick={handleGuardarDatos}
            disabled={guardando}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
          >
            {guardando
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
              : <><Save className="w-4 h-4" /> Guardar cambios</>
            }
          </button>
        </div>
      )}

      {/* ── Tab: Contraseña ── */}
      {tab === 'password' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
          <PasswordField
            label="Contraseña actual"
            value={passActual}
            onChange={setPassActual}
            show={showActual}
            onToggle={() => setShowActual(v => !v)}
          />
          <PasswordField
            label="Nueva contraseña"
            value={passNueva}
            onChange={setPassNueva}
            show={showNueva}
            onToggle={() => setShowNueva(v => !v)}
            hint="Mínimo 8 caracteres"
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            value={passConfirm}
            onChange={setPassConfirm}
            show={showNueva}
            onToggle={() => setShowNueva(v => !v)}
          />

          {errorPass && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorPass}
            </div>
          )}
          {exitoPass && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Contraseña actualizada correctamente
            </div>
          )}

          <button
            onClick={handleCambiarPassword}
            disabled={guardandoP}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition"
          >
            {guardandoP
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando...</>
              : <><Lock className="w-4 h-4" /> Cambiar contraseña</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Componentes pequeños ── */
const INPUT_CLS =
  'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition'

function Field({
  label, icon, children, optional,
}: {
  label: string; icon: React.ReactNode; children: React.ReactNode; optional?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}{optional && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        {children}
      </div>
    </div>
  )
}

function PasswordField({
  label, value, onChange, show, onToggle, hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  show: boolean; onToggle: () => void; hint?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-200 transition"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
