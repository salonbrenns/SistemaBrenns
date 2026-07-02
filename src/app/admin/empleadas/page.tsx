"use client"
import { useEffect, useState } from "react"
import { Users, Plus, Pencil, Power, Eye, EyeOff, X, Check, Loader2, Phone, Mail, CalendarCheck } from "lucide-react"

type Empleada = {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  activo: boolean
  fecha_registro: string
  image: string | null
  _count: { citasComoEmpleado: number }
}

const EMPTY = { nombre: "", correo: "", telefono: "", password: "" }

export default function EmpleadasPage() {
  const [empleadas, setEmpleadas]   = useState<Empleada[]>([])
  const [cargando, setCargando]     = useState(true)
  const [modal, setModal]           = useState<"crear" | "editar" | null>(null)
  const [seleccionada, setSelec]    = useState<Empleada | null>(null)
  const [form, setForm]             = useState(EMPTY)
  const [verPass, setVerPass]       = useState(false)
  const [guardando, setGuardando]   = useState(false)
  const [error, setError]           = useState("")
  const [busqueda, setBusqueda]     = useState("")

  const cargar = async () => {
    setCargando(true)
    const res = await fetch("/api/admin/empleadas")
    setEmpleadas(await res.json())
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const abrirCrear = () => {
    setForm(EMPTY); setError(""); setModal("crear")
  }

  const abrirEditar = (e: Empleada) => {
    setSelec(e)
    setForm({ nombre: e.nombre, correo: e.correo, telefono: e.telefono ?? "", password: "" })
    setError(""); setModal("editar")
  }

  const cerrar = () => { setModal(null); setSelec(null); setForm(EMPTY); setError("") }

  const guardar = async () => {
    setError(""); setGuardando(true)
    try {
      if (modal === "crear") {
        if (!form.nombre || !form.correo || !form.password) { setError("Nombre, correo y contraseña son obligatorios"); setGuardando(false); return }
        const res = await fetch("/api/admin/empleadas", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setGuardando(false); return }
      } else if (modal === "editar" && seleccionada) {
        const body: Record<string, string> = {}
        if (form.nombre   !== seleccionada.nombre)              body.nombre   = form.nombre
        if (form.correo   !== seleccionada.correo)              body.correo   = form.correo
        if (form.telefono !== (seleccionada.telefono ?? ""))    body.telefono = form.telefono
        if (form.password)                                       body.password = form.password
        if (Object.keys(body).length > 0) {
          const res = await fetch(`/api/admin/empleadas/${seleccionada.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
          })
          if (!res.ok) { const d = await res.json(); setError(d.error); setGuardando(false); return }
        }
      }
      await cargar(); cerrar()
    } finally { setGuardando(false) }
  }

  const toggleActivo = async (e: Empleada) => {
    await fetch(`/api/admin/empleadas/${e.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !e.activo }),
    })
    cargar()
  }

  const filtradas = empleadas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.correo.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" /> Empleadas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona el equipo del salón</p>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm">
          <Plus className="w-4 h-4" /> Nueva empleada
        </button>
      </div>

      {/* Buscador */}
      <input
        value={busqueda} onChange={e => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o correo..."
        className="w-full sm:w-80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-pink-400 dark:text-white"
      />

      {/* Tabla */}
      {cargando ? (
        <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-pink-400 animate-spin" /></div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          {busqueda ? "No se encontraron empleadas con ese criterio" : "Aún no hay empleadas registradas"}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-rose-900 dark:bg-rose-950">
              <tr>
                {["Empleada", "Contacto", "Citas totales", "Estado", "Acciones"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {filtradas.map(emp => (
                <tr key={emp.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-300 font-bold text-sm flex-shrink-0">
                        {emp.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">{emp.nombre}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          Desde {new Date(emp.fecha_registro).toLocaleDateString("es-MX", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-gray-400" />{emp.correo}
                      </p>
                      {emp.telefono && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-gray-400" />{emp.telefono}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <CalendarCheck className="w-4 h-4 text-pink-400" />
                      {emp._count.citasComoEmpleado}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      emp.activo
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      {emp.activo ? <><Check className="w-3 h-3" /> Activa</> : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEditar(emp)}
                        className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-pink-600 dark:text-pink-400 transition"
                        title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActivo(emp)}
                        className={`p-1.5 rounded-lg transition ${emp.activo
                          ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-500"
                          : "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 text-green-600"}`}
                        title={emp.activo ? "Desactivar" : "Activar"}>
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {modal === "crear" ? "Nueva empleada" : "Editar empleada"}
              </h2>
              <button onClick={cerrar} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre completo *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="Ej: Ana García López" />
              </div>
              {/* Correo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Correo electrónico *</label>
                <input type="email" value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="ana@ejemplo.com" />
              </div>
              {/* Teléfono */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                <input value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="961 123 4567" />
              </div>
              {/* Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Contraseña {modal === "editar" && <span className="font-normal text-gray-400">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input type={verPass ? "text" : "password"} value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                    placeholder={modal === "crear" ? "Mínimo 6 caracteres" : "Nueva contraseña"} />
                  <button type="button" onClick={() => setVerPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={cerrar}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition disabled:opacity-60">
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                {modal === "crear" ? "Crear empleada" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
