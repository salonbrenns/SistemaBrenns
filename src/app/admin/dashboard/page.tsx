"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  Users, CalendarCheck, ShoppingBag, Calendar,
  Shield, GraduationCap, Briefcase, UserCircle,
  ChevronDown, Plus, X, Eye, EyeOff, Loader2, CheckCircle
} from "lucide-react"

type KPIs = {
  citasHoy: number
  citasMes: number
  pedidosMes: number
  clientesTotal: number
}

type Usuario = {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  rol: string
  activo: boolean
  fecha_registro: string
}

type Permiso = {
  key: string
  label: string
  categoria: string
  activo: boolean
}

const ROL_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ADMIN:    { label: "Administrador", color: "bg-purple-100 text-purple-700", icon: <Shield className="w-3 h-3" /> },
  DOCENTE:  { label: "Docente",       color: "bg-blue-100 text-blue-700",    icon: <GraduationCap className="w-3 h-3" /> },
  EMPLEADO: { label: "Empleado",      color: "bg-orange-100 text-orange-700",icon: <Briefcase className="w-3 h-3" /> },
  CLIENTE:  { label: "Cliente",       color: "bg-pink-100 text-pink-700",    icon: <UserCircle className="w-3 h-3" /> },
}

const CATEGORIA_COLOR: Record<string, string> = {
  Ventas:     "bg-blue-100 text-blue-700",
  Inventario: "bg-yellow-100 text-yellow-700",
  Productos:  "bg-green-100 text-green-700",
  Clientes:   "bg-red-100 text-red-700",
  Agenda:     "bg-purple-100 text-purple-700",
  Otros:      "bg-gray-100 text-gray-600",
}

function AccionesMenu({ usuario, onReset, onEliminar, onPermisos }: {
  usuario: Usuario
  onReset: (u: Usuario) => void
  onEliminar: (u: Usuario) => void
  onPermisos: (u: Usuario) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
            <button onClick={() => { setOpen(false); onPermisos(usuario) }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <Shield className="w-4 h-4 text-purple-500" />
              Ver/editar permisos
            </button>
            <div className="border-t border-gray-100" />
            <button onClick={() => { setOpen(false); onReset(usuario) }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Resetear contraseña
            </button>
            <div className="border-t border-gray-100" />
            <button onClick={() => { setOpen(false); onEliminar(usuario) }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar usuario
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingKpis, setLoadingKpis] = useState(true)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [filtroRol, setFiltroRol] = useState("TODOS")
  const [cambiandoRol, setCambiandoRol] = useState<number | null>(null)

  // Modal nuevo usuario
  const [showModal, setShowModal] = useState(false)
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoCorreo, setNuevoCorreo] = useState("")
  const [nuevoTelefono, setNuevoTelefono] = useState("")
  const [nuevoPassword, setNuevoPassword] = useState("")
  const [nuevoRol, setNuevoRol] = useState("EMPLEADO")
  const [showPass, setShowPass] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorModal, setErrorModal] = useState("")
  const [exitoModal, setExitoModal] = useState("")

  // Modal permisos
  const [showPermisos, setShowPermisos] = useState(false)
  const [usuarioPermisos, setUsuarioPermisos] = useState<Usuario | null>(null)
  const [permisos, setPermisos] = useState<Permiso[]>([])
  const [loadingPermisos, setLoadingPermisos] = useState(false)
  const [guardandoPermiso, setGuardandoPermiso] = useState<string | null>(null)

  const cargarUsuarios = () => {
    setLoadingUsuarios(true)
    fetch("/api/admin/usuarios?todos=true")
      .then(r => r.json())
      .then(data => { setUsuarios(Array.isArray(data) ? data : []); setLoadingUsuarios(false) })
      .catch(() => setLoadingUsuarios(false))
  }

  useEffect(() => {
    fetch("/api/admin/estadisticas/kpis")
      .then(r => r.json())
      .then(data => { setKpis(data); setLoadingKpis(false) })
      .catch(() => setLoadingKpis(false))
    cargarUsuarios()
  }, [])

  const handleCambiarRol = async (id: number, nuevoRol: string) => {
    setCambiandoRol(id)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rol: nuevoRol }),
      })
      if (res.ok) setUsuarios(prev => prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u))
    } finally {
      setCambiandoRol(null)
    }
  }

  const handleToggleActivo = async (id: number, activo: boolean) => {
    setCambiandoRol(id)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo: !activo }),
      })
      if (res.ok) setUsuarios(prev => prev.map(u => u.id === id ? { ...u, activo: !activo } : u))
    } finally {
      setCambiandoRol(null)
    }
  }

  const handleResetPassword = async (u: Usuario) => {
    if (!confirm(`¿Enviar correo de recuperación a ${u.nombre}?`)) return
    try {
      await fetch("/api/auth/recuperar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: u.correo }),
      })
      alert(`Correo enviado a ${u.correo}`)
    } catch {
      alert("Error al enviar correo")
    }
  }

  const handleEliminar = async (u: Usuario) => {
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/admin/usuarios?id=${u.id}`, { method: "DELETE" })
      if (res.ok) setUsuarios(prev => prev.filter(x => x.id !== u.id))
      else alert("No se puede eliminar este usuario")
    } catch {
      alert("Error al eliminar usuario")
    }
  }

  const handleVerPermisos = async (u: Usuario) => {
    setUsuarioPermisos(u)
    setShowPermisos(true)
    setLoadingPermisos(true)
    try {
      const res = await fetch(`/api/admin/permisos?usuario_id=${u.id}`)
      const data = await res.json()
      setPermisos(data)
    } finally {
      setLoadingPermisos(false)
    }
  }

  const handleTogglePermiso = async (key: string, activo: boolean) => {
    if (!usuarioPermisos) return
    setGuardandoPermiso(key)
    try {
      await fetch("/api/admin/permisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: usuarioPermisos.id, permiso: key, activo: !activo }),
      })
      setPermisos(prev => prev.map(p => p.key === key ? { ...p, activo: !activo } : p))
    } finally {
      setGuardandoPermiso(null)
    }
  }

  const handleAgregarUsuario = async () => {
    setErrorModal("")
    setExitoModal("")
    if (!nuevoNombre || !nuevoCorreo || !nuevoPassword || !nuevoTelefono) {
      setErrorModal("Todos los campos son requeridos"); return
    }
    if (nuevoPassword.length < 6) {
      setErrorModal("La contraseña debe tener al menos 6 caracteres"); return
    }
    setGuardando(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nuevoNombre,
          email: nuevoCorreo,
          password: nuevoPassword,
          telefono: nuevoTelefono,
          rol: nuevoRol,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorModal(data.error || "Error al crear usuario"); return }
      setExitoModal("Usuario creado exitosamente")
      setNuevoNombre(""); setNuevoCorreo(""); setNuevoTelefono("")
      setNuevoPassword(""); setNuevoRol("EMPLEADO")
      cargarUsuarios()
      setTimeout(() => { setShowModal(false); setExitoModal("") }, 1500)
    } catch {
      setErrorModal("Error inesperado")
    } finally {
      setGuardando(false)
    }
  }

  const usuariosFiltrados = filtroRol === "TODOS" ? usuarios : usuarios.filter(u => u.rol === filtroRol)
  const contarPorRol = (rol: string) => usuarios.filter(u => u.rol === rol).length
  const categorias = [...new Set(permisos.map(p => p.categoria))]
  const permisosActivos = permisos.filter(p => p.activo).length

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenid@, <span className="text-pink-600">{session?.user?.name?.split(" ")[0]}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Citas hoy",        value: kpis?.citasHoy,      icon: <Calendar className="w-6 h-6" />,      color: "from-pink-500 to-rose-500" },
          { label: "Citas este mes",   value: kpis?.citasMes,      icon: <CalendarCheck className="w-6 h-6" />, color: "from-purple-500 to-indigo-500" },
          { label: "Pedidos del mes",  value: kpis?.pedidosMes,    icon: <ShoppingBag className="w-6 h-6" />,   color: "from-orange-400 to-amber-500" },
          { label: "Clientes totales", value: kpis?.clientesTotal, icon: <Users className="w-6 h-6" />,         color: "from-emerald-400 to-teal-500" },
        ].map((kpi, i) => (
          <div key={i} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-md`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">{kpi.label}</span>
              <div className="bg-white/20 p-2 rounded-xl">{kpi.icon}</div>
            </div>
            <div className="text-4xl font-bold">
              {loadingKpis ? "..." : (kpi.value ?? 0)}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen por rol */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(ROL_CONFIG)
          .filter(([rol]) => rol !== "CLIENTE")
          .map(([rol, cfg]) => (
            <div key={rol} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cfg.color}`}>{cfg.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{cfg.label}s</p>
                <p className="text-2xl font-bold text-gray-800">{contarPorRol(rol)}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Tabla usuarios */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-500" /> Usuarios del sistema
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {["TODOS", "ADMIN", "DOCENTE", "EMPLEADO"].map(rol => (
                <button key={rol} onClick={() => setFiltroRol(rol)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    filtroRol === rol ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}>
                  {rol === "TODOS" ? "Todos" : ROL_CONFIG[rol]?.label}
                  {rol !== "TODOS" && ` (${contarPorRol(rol)})`}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowModal(true); setErrorModal(""); setExitoModal("") }}
              className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-pink-700 transition-all shadow-sm">
              <Plus className="w-4 h-4" /> Nuevo usuario
            </button>
          </div>
        </div>

        {loadingUsuarios ? (
          <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando usuarios...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No hay usuarios</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="px-5 py-3 text-left">Usuario</th>
                  <th className="px-5 py-3 text-left">Teléfono</th>
                  <th className="px-5 py-3 text-left">Rol</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Registro</th>
                  <th className="px-5 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuariosFiltrados.map(u => {
                  const cfg = ROL_CONFIG[u.rol]
                  return (
                    <tr key={u.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{u.nombre}</p>
                            <p className="text-xs text-gray-400">{u.correo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{u.telefono || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="relative inline-block">
                          <select value={u.rol} disabled={cambiandoRol === u.id}
                            onChange={e => handleCambiarRol(u.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer appearance-none pr-6 ${cfg?.color} disabled:opacity-50`}>
                            {Object.entries(ROL_CONFIG)
                              .filter(([r]) => r !== "CLIENTE")
                              .map(([rol, c]) => (
                                <option key={rol} value={rol}>{c.label}</option>
                              ))}
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggleActivo(u.id, u.activo)}
                            disabled={cambiandoRol === u.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                              u.activo ? "bg-green-500" : "bg-gray-300"
                            }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              u.activo ? "translate-x-6" : "translate-x-1"
                            }`} />
                          </button>
                          <span className="text-xs text-gray-500">{u.activo ? "Activo" : "Inactivo"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(u.fecha_registro).toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-5 py-4">
                        <AccionesMenu usuario={u} onReset={handleResetPassword}
                          onEliminar={handleEliminar} onPermisos={handleVerPermisos} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal Permisos ── */}
      {showPermisos && usuarioPermisos && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                  {usuarioPermisos.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{usuarioPermisos.nombre}</h3>
                  <p className="text-xs text-gray-400">{usuarioPermisos.correo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!loadingPermisos && (
                  <span className="text-sm text-gray-500">
                    <span className="font-bold text-pink-600">{permisosActivos}</span> / {permisos.length} activos
                  </span>
                )}
                <button onClick={() => setShowPermisos(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 border-b border-gray-100 flex gap-2 flex-wrap">
              {Object.entries(CATEGORIA_COLOR).map(([cat, color]) => (
                <span key={cat} className={`text-xs font-medium px-2 py-1 rounded-md ${color}`}>{cat}</span>
              ))}
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingPermisos ? (
                <div className="p-10 text-center text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Cargando permisos...
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0 bg-white">
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                      <th className="px-5 py-3 text-left w-8">#</th>
                      <th className="px-5 py-3 text-left">Permiso</th>
                      <th className="px-5 py-3 text-left">Categoría</th>
                      <th className="px-5 py-3 text-center">Acceso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorias.map(categoria => (
                      <>
                        <tr key={`cat-${categoria}`}>
                          <td colSpan={4} className="px-5 py-2 bg-gray-50">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${CATEGORIA_COLOR[categoria]}`}>
                              {categoria}
                            </span>
                          </td>
                        </tr>
                        {permisos.filter(p => p.categoria === categoria).map((p, i) => (
                          <tr key={p.key} className="hover:bg-pink-50/30 transition-colors border-t border-gray-50">
                            <td className="px-5 py-3 text-xs text-gray-400">{i + 1}</td>
                            <td className="px-5 py-3 text-sm text-gray-700 font-medium">{p.label}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-medium px-2 py-1 rounded-md ${CATEGORIA_COLOR[p.categoria]}`}>
                                {p.categoria}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-center">
                              <button onClick={() => handleTogglePermiso(p.key, p.activo)}
                                disabled={guardandoPermiso === p.key}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                                  p.activo ? "bg-green-500" : "bg-gray-300"
                                }`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  p.activo ? "translate-x-6" : "translate-x-1"
                                }`} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-700">
                        Total permisos activos
                      </td>
                      <td className="px-5 py-3 text-center text-sm font-bold text-pink-600">
                        {permisosActivos} / {permisos.length}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowPermisos(false)}
                className="px-6 py-2 rounded-full bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-all">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nuevo usuario ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">Nuevo usuario</h3>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre completo</label>
                <input type="text" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Ana García López"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Correo electrónico</label>
                <input type="email" value={nuevoCorreo} onChange={e => setNuevoCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                <input type="text" value={nuevoTelefono}
                  onChange={e => setNuevoTelefono(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10 dígitos" maxLength={10} inputMode="numeric"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} value={nuevoPassword}
                    onChange={e => setNuevoPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                <select value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all text-sm">
                  {Object.entries(ROL_CONFIG)
                    .filter(([rol]) => rol !== "CLIENTE")
                    .map(([rol, cfg]) => (
                      <option key={rol} value={rol}>{cfg.label}</option>
                    ))}
                </select>
              </div>
              {errorModal && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{errorModal}</div>
              )}
              {exitoModal && (
                <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm border border-green-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {exitoModal}
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleAgregarUsuario} disabled={guardando}
                className="flex-1 px-4 py-2 rounded-full bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {guardando ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Crear usuario"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}