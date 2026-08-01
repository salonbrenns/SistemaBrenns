// src/app/admin/roles/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Shield, User, Crown, Check, X, Briefcase, Loader2, AlertCircle, Search } from "lucide-react"
import { SkeletonTablaFila } from "@/components/ui/SkeletonCard"

const ROLES_INFO = [
  { nombre: "ADMIN",    icon: Crown,        color: "bg-pink-500",  border: "border-pink-200 dark:border-pink-900",   badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",   descripcion: "Acceso completo al sistema",    permisos: ["Ver y editar todos los módulos","Gestionar usuarios y roles","Ver reportes y estadísticas","Configurar el sistema","Gestionar pagos"] },
  { nombre: "EMPLEADO", icon: Briefcase,    color: "bg-amber-500", border: "border-amber-200 dark:border-amber-900",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", descripcion: "Acceso a citas y agenda",        permisos: ["Ver y gestionar sus citas","Agendar citas para clientes","Ver su perfil y horarios","Sin acceso a configuración","Sin acceso a reportes"] },
  { nombre: "CLIENTE",  icon: User,         color: "bg-green-500", border: "border-green-200 dark:border-green-900",  badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", descripcion: "Acceso al portal de clientes",  permisos: ["Ver y comprar productos","Agendar citas","Ver sus pedidos y citas","Editar su perfil","Sin acceso al admin"] },
]

type Usuario = { id: number; nombre: string; correo: string; telefono: string | null; rol: string; activo: boolean }
const ROLES_OPCIONES = ["ADMIN", "EMPLEADO", "CLIENTE"]

function badgeColor(rol: string) {
  return ROLES_INFO.find(r => r.nombre === rol)?.badge || "bg-gray-100 text-gray-600 dark:text-gray-400"
}

export default function RolesPage() {
  const [usuarios, setUsuarios]     = useState<Usuario[]>([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState("")
  const [guardando, setGuardando]   = useState<number | null>(null)
  const [exito, setExito]           = useState<number | null>(null)
  const [busqueda, setBusqueda]     = useState("")
  const [busResults, setBusResults] = useState<Usuario[]>([])
  const [buscando, setBuscando]     = useState(false)

  useEffect(() => {
    fetch("/api/admin/usuarios?todos=true")
      .then(r => r.json())
      .then(data => { setUsuarios(Array.isArray(data) ? data : []); setCargando(false) })
      .catch(() => { setError("Error cargando usuarios"); setCargando(false) })
  }, [])

  useEffect(() => {
    if (!busqueda.trim()) { setBusResults([]); return }
    const timer = setTimeout(() => {
      setBuscando(true)
      fetch(`/api/admin/usuarios?q=${encodeURIComponent(busqueda)}`)
        .then(r => r.json())
        .then(data => { setBusResults(Array.isArray(data) ? data : []); setBuscando(false) })
        .catch(() => setBuscando(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [busqueda])

  async function cambiarRol(id: number, nuevoRol: string, origen: "lista" | "busqueda") {
    setGuardando(id); setExito(null)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rol: nuevoRol }),
      })
      if (!res.ok) throw new Error()
      const updated: Usuario = await res.json()
      if (origen === "lista") setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: updated.rol ?? nuevoRol } : u))
      if (origen === "busqueda") {
        setBusResults(prev => prev.map(u => u.id === id ? { ...u, rol: updated.rol ?? nuevoRol } : u))
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: updated.rol ?? nuevoRol } : u))
      }
      setExito(id); setTimeout(() => setExito(null), 2000)
    } catch {
      setError("No se pudo actualizar el rol"); setTimeout(() => setError(""), 3000)
    } finally {
      setGuardando(null)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
          <Shield className="w-6 h-6 text-pink-500" /> Roles y permisos
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los niveles de acceso del sistema</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {ROLES_INFO.map(({ nombre, icon: Icon, color, border, descripcion, permisos }) => (
          <div key={nombre} className={`bg-white dark:bg-gray-800 rounded-2xl border-2 ${border} shadow-sm p-5`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{nombre}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{descripcion}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {permisos.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {i < 3 ? <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> : <X className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                  <span className={i < 3 ? "text-gray-700 dark:text-gray-300" : "text-gray-400"}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden bg-white dark:bg-gray-800">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">Personal del sistema</h3>
            <p className="text-xs text-gray-400 mt-0.5">Administradores y Empleados</p>
          </div>
          {cargando && <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
              {["Usuario","Correo","Rol actual","Cambiar rol"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <>{Array.from({length:5}).map((_,i)=><SkeletonTablaFila key={i} columnas={4}/>)}</>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400 text-sm">No hay personal registrado</td></tr>
            ) : (
              usuarios.map(u => (
                <tr key={u.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{u.nombre}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">{u.correo}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor(u.rol)}`}>{u.rol}</span>
                    {exito === u.id && <span className="ml-2 text-xs text-green-600 font-semibold">✓ Guardado</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.rol}
                        onChange={e => cambiarRol(u.id, e.target.value, "lista")}
                        disabled={guardando === u.id}
                        className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400 disabled:opacity-50"
                      >
                        {ROLES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {guardando === u.id && <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-800 dark:text-white">Cambiar rol a un cliente</h3>
          <p className="text-xs text-gray-400 mt-0.5">Busca un cliente por nombre o correo para cambiar su rol</p>
        </div>
        <div className="px-5 py-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Nombre o correo del cliente..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 rounded-xl text-sm focus:outline-none focus:border-pink-400"
            />
            {buscando && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400 animate-spin" />}
          </div>
          {busResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {busResults.map(u => (
                <div key={u.id} className="flex items-center justify-between border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-pink-100 dark:hover:border-pink-900 transition-colors dark:bg-gray-800/50">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{u.nombre}</p>
                    <p className="text-xs text-gray-400">{u.correo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor(u.rol || "CLIENTE")}`}>{u.rol || "CLIENTE"}</span>
                    <select
                      defaultValue={u.rol || "CLIENTE"}
                      onChange={e => cambiarRol(u.id, e.target.value, "busqueda")}
                      disabled={guardando === u.id}
                      className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pink-400 disabled:opacity-50"
                    >
                      {ROLES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    {guardando === u.id && <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />}
                    {exito === u.id && <span className="text-xs text-green-600 font-semibold">✓</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          {busqueda && !buscando && busResults.length === 0 && (
            <p className="mt-3 text-sm text-gray-400">Sin resultados para &ldquo;{busqueda}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  )
}
