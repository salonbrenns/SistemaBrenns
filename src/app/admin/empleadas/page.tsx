"use client"
import { useEffect, useRef, useState } from "react"
import {
  Users, Plus, Pencil, Power, Eye, EyeOff, X, Check,
  Loader2, Phone, Mail, CalendarCheck, Camera, Trash2, Upload, Star,
} from "lucide-react"
import Image from "next/image"
import { toast } from "@/lib/toast"
import { confirmDialog } from "@/lib/confirm"
import Paginacion from "@/components/ui/paginacion"

// ── Types ──────────────────────────────────────────────────────────────────
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

type MiembroEquipo = {
  id: number
  nombre: string
  puesto: string
  descripcion: string | null
  imagen: string | null
  orden: number
  activo: boolean
}

const EMPTY_EMP = { nombre: "", correo: "", telefono: "", password: "" }
const EMPTY_EQ: Omit<MiembroEquipo, "id" | "activo"> = {
  nombre: "", puesto: "", descripcion: null, imagen: null, orden: 0,
}

// ── Component ──────────────────────────────────────────────────────────────
export default function EmpleadasPage() {
  const [tab, setTab]             = useState<"cuentas" | "nosotros">("cuentas")
  const [paginaEmp, setPaginaEmp] = useState(1)
  const [paginaEq,  setPaginaEq]  = useState(1)
  const POR_PAGINA = 10

  // ── Tab 1: Cuentas ────────────────────────────────────────────────────
  const [empleadas, setEmpleadas]       = useState<Empleada[]>([])
  const [cargandoEmp, setCargandoEmp]   = useState(true)
  const [modalEmp, setModalEmp]         = useState<"crear" | "editar" | null>(null)
  const [seleccionada, setSelec]        = useState<Empleada | null>(null)
  const [formEmp, setFormEmp]           = useState(EMPTY_EMP)
  const [verPass, setVerPass]           = useState(false)
  const [guardandoEmp, setGuardandoEmp] = useState(false)
  const [errorEmp, setErrorEmp]         = useState("")
  const [busqueda, setBusqueda]         = useState("")
  const [subiendoFoto, setSubiendoFoto] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fotoParaId   = useRef<number | null>(null)

  // ── Tab 2: Equipo en Nosotros ─────────────────────────────────────────
  const [equipo, setEquipo]           = useState<MiembroEquipo[]>([])
  const [cargandoEq, setCargandoEq]   = useState(true)
  const [modalEq, setModalEq]         = useState(false)
  const [editandoEq, setEditandoEq]   = useState<MiembroEquipo | null>(null)
  const [formEq, setFormEq]           = useState({ ...EMPTY_EQ })
  const [guardandoEq, setGuardandoEq] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  // ── Loaders ──────────────────────────────────────────────────────────
  const cargarEmp = async () => {
    setCargandoEmp(true)
    try {
      const res = await fetch("/api/admin/empleadas")
      if (!res.ok) throw new Error()
      setEmpleadas(await res.json())
    } catch { setEmpleadas([]) }
    finally { setCargandoEmp(false) }
  }

  const cargarEq = async () => {
    setCargandoEq(true)
    const res = await fetch("/api/admin/equipo")
    if (res.ok) setEquipo(await res.json())
    setCargandoEq(false)
  }

  useEffect(() => { cargarEmp(); cargarEq() }, [])

  // ── Tab 1 actions ────────────────────────────────────────────────────
  const abrirCrear = () => { setFormEmp(EMPTY_EMP); setErrorEmp(""); setModalEmp("crear") }
  const abrirEditar = (e: Empleada) => {
    setSelec(e)
    setFormEmp({ nombre: e.nombre, correo: e.correo, telefono: e.telefono ?? "", password: "" })
    setErrorEmp(""); setModalEmp("editar")
  }
  const cerrarEmp = () => { setModalEmp(null); setSelec(null); setFormEmp(EMPTY_EMP); setErrorEmp("") }

  const guardarEmp = async () => {
    setErrorEmp(""); setGuardandoEmp(true)
    try {
      if (modalEmp === "crear") {
        if (!formEmp.nombre || !formEmp.correo || !formEmp.password) {
          setErrorEmp("Nombre, correo y contraseña son obligatorios"); setGuardandoEmp(false); return
        }
        const res = await fetch("/api/admin/empleadas", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formEmp),
        })
        const data = await res.json()
        if (!res.ok) { setErrorEmp(data.error); setGuardandoEmp(false); return }
      } else if (modalEmp === "editar" && seleccionada) {
        const body: Record<string, string> = {}
        if (formEmp.nombre   !== seleccionada.nombre)           body.nombre   = formEmp.nombre
        if (formEmp.correo   !== seleccionada.correo)           body.correo   = formEmp.correo
        if (formEmp.telefono !== (seleccionada.telefono ?? "")) body.telefono = formEmp.telefono
        if (formEmp.password)                                   body.password = formEmp.password
        if (Object.keys(body).length > 0) {
          const res = await fetch(`/api/admin/empleadas/${seleccionada.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
          })
          if (!res.ok) { const d = await res.json(); setErrorEmp(d.error); setGuardandoEmp(false); return }
        }
      }
      await cargarEmp(); cerrarEmp()
    } finally { setGuardandoEmp(false) }
  }

  const toggleActivoEmp = async (e: Empleada) => {
    await fetch(`/api/admin/empleadas/${e.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !e.activo }),
    })
    cargarEmp()
  }

  const handleFotoClick = (id: number) => { fotoParaId.current = id; fileInputRef.current?.click() }
  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; const id = fotoParaId.current
    if (!file || !id) return
    e.target.value = ""
    setSubiendoFoto(id)
    try {
      const fd = new FormData(); fd.append("file", file)
      const res = await fetch(`/api/admin/empleadas/${id}/foto`, { method: "POST", body: fd })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      setEmpleadas(prev => prev.map(emp => emp.id === id ? { ...emp, image: url } : emp))
    } catch { toast.error("Error al subir la foto. Intenta de nuevo.") }
    finally { setSubiendoFoto(null) }
  }

  const filtradas      = empleadas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.correo.toLowerCase().includes(busqueda.toLowerCase())
  )
  const totalPagsEmp   = Math.ceil(filtradas.length / POR_PAGINA)
  const filtradasPag   = filtradas.slice((paginaEmp - 1) * POR_PAGINA, paginaEmp * POR_PAGINA)

  // Empleadas que aún no están en el equipo de Nosotros
  const sugeridas      = empleadas.filter(e =>
    !equipo.some(m => m.nombre.toLowerCase() === e.nombre.toLowerCase())
  )
  const totalPagsEq    = Math.ceil(equipo.length / POR_PAGINA)
  const equipoPag      = equipo.slice((paginaEq - 1) * POR_PAGINA, paginaEq * POR_PAGINA)

  // ── Tab 2 actions ────────────────────────────────────────────────────
  const abrirNuevoEq = () => { setEditandoEq(null); setFormEq({ ...EMPTY_EQ }); setModalEq(true) }

  // Pre-llena el modal con datos de una empleada existente
  const agregarDesdeEmpleada = (e: Empleada) => {
    setEditandoEq(null)
    setFormEq({ nombre: e.nombre, puesto: "", descripcion: null, imagen: e.image, orden: 0 })
    setModalEq(true)
  }
  const abrirEditarEq = (m: MiembroEquipo) => {
    setEditandoEq(m)
    setFormEq({ nombre: m.nombre, puesto: m.puesto, descripcion: m.descripcion, imagen: m.imagen, orden: m.orden })
    setModalEq(true)
  }
  const cerrarEq = () => { setModalEq(false); setEditandoEq(null) }

  const subirFotoEq = async (file: File) => {
    setSubiendoImg(true)
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const data = await res.json()
    setSubiendoImg(false)
    if (res.ok) setFormEq(f => ({ ...f, imagen: data.url }))
    else toast.error("Error al subir la foto")
  }

  const guardarEq = async () => {
    if (!formEq.nombre.trim()) { toast.error("El nombre es requerido"); return }
    setGuardandoEq(true)
    const url    = editandoEq ? `/api/admin/equipo/${editandoEq.id}` : "/api/admin/equipo"
    const method = editandoEq ? "PUT" : "POST"
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formEq) })
    setGuardandoEq(false)
    if (res.ok) {
      toast.success(editandoEq ? "Actualizado" : "Agregada al equipo")
      cerrarEq(); cargarEq()
    } else {
      const d = await res.json(); toast.error(d.error ?? "Error al guardar")
    }
  }

  const toggleActivoEq = async (m: MiembroEquipo) => {
    const res = await fetch(`/api/admin/equipo/${m.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !m.activo }),
    })
    if (res.ok) { toast.success(m.activo ? "Ocultada del sitio" : "Visible en el sitio"); cargarEq() }
    else toast.error("Error al actualizar")
  }

  const eliminarEq = async (m: MiembroEquipo) => {
    const ok = await confirmDialog(`¿Quitar a ${m.nombre} de la sección Nosotros?`)
    if (!ok) return
    const res = await fetch(`/api/admin/equipo/${m.id}`, { method: "DELETE" })
    if (res.ok) { toast.success("Eliminada del equipo"); cargarEq() }
    else toast.error("Error al eliminar")
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Inputs ocultos para foto */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
      <input ref={imgRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) subirFotoEq(f) }} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" /> Empleadas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestiona el equipo del salón y su presencia en el sitio
          </p>
        </div>
        <button
          onClick={tab === "cuentas" ? abrirCrear : abrirNuevoEq}
          className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm">
          <Plus className="w-4 h-4" />
          {tab === "cuentas" ? "Nueva empleada" : "Agregar al equipo"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
        {([
          { id: "cuentas",  label: "Cuentas de acceso" },
          { id: "nosotros", label: "Equipo en Nosotros" },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.id
                ? "bg-white dark:bg-gray-700 text-pink-700 dark:text-pink-300 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: CUENTAS DE ACCESO ──────────────────────────────── */}
      {tab === "cuentas" && (
        <>
          <input
            value={busqueda} onChange={e => { setBusqueda(e.target.value); setPaginaEmp(1) }}
            placeholder="Buscar por nombre o correo..."
            className="w-full sm:w-80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-pink-400 dark:text-white"
          />

          {cargandoEmp ? (
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
                  {filtradasPag.map(emp => (
                    <tr key={emp.id} className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleFotoClick(emp.id)} disabled={subiendoFoto === emp.id}
                            title="Cambiar foto" className="relative w-10 h-10 rounded-full flex-shrink-0 group focus:outline-none">
                            {subiendoFoto === emp.id ? (
                              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                              </div>
                            ) : emp.image ? (
                              <>
                                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                  <Image src={emp.image} alt={emp.nombre} fill className="object-cover" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera className="w-4 h-4 text-white" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-300 font-bold text-sm">
                                  {emp.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-pink-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera className="w-4 h-4 text-white" />
                                </div>
                              </>
                            )}
                          </button>
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
                            className="p-1.5 rounded-lg bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/40 text-pink-600 dark:text-pink-400 transition" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => toggleActivoEmp(emp)}
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

          <Paginacion
            paginaActual={paginaEmp}
            totalPaginas={totalPagsEmp}
            onChange={setPaginaEmp}
          />

          <p className="text-xs text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" /> Haz clic en el avatar para cambiar la foto de perfil.
          </p>
        </>
      )}

      {/* ── TAB 2: EQUIPO EN NOSOTROS ──────────────────────────────── */}
      {tab === "nosotros" && (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
            Las empleadas activas aquí aparecen en la sección <strong>Nosotros</strong> del sitio público.
          </p>

          {/* Sugeridas: empleadas del sistema que aún no están en Nosotros */}
          {!cargandoEq && !cargandoEmp && sugeridas.length > 0 && (
            <div className="rounded-2xl border border-dashed border-pink-300 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/20 p-4">
              <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mb-3 uppercase tracking-wide">
                Empleadas no agregadas aún
              </p>
              <div className="flex flex-wrap gap-3">
                {sugeridas.map(e => (
                  <button key={e.id} onClick={() => agregarDesdeEmpleada(e)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-pink-400 hover:shadow-sm transition group">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden bg-pink-100 dark:bg-pink-900/30 flex-shrink-0">
                      {e.image ? (
                        <Image src={e.image} alt={e.nombre} fill className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-pink-500">
                          {e.nombre.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                      {e.nombre}
                    </span>
                    <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-pink-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {cargandoEq ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
            </div>
          ) : equipo.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aún no hay empleadas en el equipo de Nosotros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {equipoPag.map(m => (
                <div key={m.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 p-4 flex flex-col items-center gap-3 transition ${!m.activo ? "opacity-50" : ""}`}>
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-pink-50 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    {m.imagen ? (
                      <Image src={m.imagen} alt={m.nombre} fill className="object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-pink-300">{m.nombre.charAt(0)}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{m.nombre}</p>
                    <p className="text-xs text-pink-500 font-medium mt-0.5">{m.puesto}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Orden: {m.orden}</p>
                  </div>
                  <div className="flex gap-1.5 mt-auto">
                    <button onClick={() => toggleActivoEq(m)} title={m.activo ? "Ocultar" : "Mostrar"}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-pink-500 transition">
                      {m.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => abrirEditarEq(m)} title="Editar"
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => eliminarEq(m)} title="Eliminar"
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Paginacion
            paginaActual={paginaEq}
            totalPaginas={totalPagsEq}
            onChange={setPaginaEq}
          />
        </>
      )}

      {/* ── MODAL: Empleada (cuentas) ────────────────────────────────── */}
      {modalEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {modalEmp === "crear" ? "Nueva empleada" : "Editar empleada"}
              </h2>
              <button onClick={cerrarEmp} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Nombre completo *</label>
                <input value={formEmp.nombre} onChange={e => setFormEmp(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="Ej: Ana García López" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Correo electrónico *</label>
                <input type="email" value={formEmp.correo} onChange={e => setFormEmp(f => ({ ...f, correo: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="ana@ejemplo.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                <input value={formEmp.telefono} onChange={e => setFormEmp(f => ({ ...f, telefono: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                  placeholder="961 123 4567" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Contraseña {modalEmp === "editar" && <span className="font-normal text-gray-400">(dejar vacío para no cambiar)</span>}
                </label>
                <div className="relative">
                  <input type={verPass ? "text" : "password"} value={formEmp.password}
                    onChange={e => setFormEmp(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                    placeholder={modalEmp === "crear" ? "Mínimo 6 caracteres" : "Nueva contraseña"} />
                  <button type="button" onClick={() => setVerPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {verPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errorEmp && (
                <p className="text-red-500 text-xs bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  {errorEmp}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={cerrarEmp}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Cancelar
              </button>
              <button onClick={guardarEmp} disabled={guardandoEmp}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold transition disabled:opacity-60">
                {guardandoEmp && <Loader2 className="w-4 h-4 animate-spin" />}
                {modalEmp === "crear" ? "Crear empleada" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Equipo Nosotros ────────────────────────────────────── */}
      {modalEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                {editandoEq ? "Editar en Nosotros" : "Agregar al equipo"}
              </h2>
              <button onClick={cerrarEq} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Foto */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-pink-50 dark:bg-gray-700 flex items-center justify-center">
                  {formEq.imagen ? (
                    <Image src={formEq.imagen} alt="foto" fill className="object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-pink-200">
                      {formEq.nombre ? formEq.nombre.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <button onClick={() => imgRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-700 font-semibold">
                  {subiendoImg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {subiendoImg ? "Subiendo..." : "Subir foto"}
                </button>
              </div>

              {[
                { label: "Nombre *", key: "nombre", placeholder: "Ej. Ana Laura" },
                { label: "Puesto",   key: "puesto",  placeholder: "Ej. Estilista Senior" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input
                    value={(formEq as Record<string, unknown>)[key] as string ?? ""}
                    onChange={e => setFormEq(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-pink-400 outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea
                  value={formEq.descripcion ?? ""}
                  onChange={e => setFormEq(f => ({ ...f, descripcion: e.target.value || null }))}
                  placeholder="Especialidad o frase corta..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-pink-400 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Orden</label>
                <input type="number" min={0} value={formEq.orden}
                  onChange={e => setFormEq(f => ({ ...f, orden: Number(e.target.value) }))}
                  className="w-24 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:border-pink-400 outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Número menor = aparece primero</p>
              </div>

              <button onClick={guardarEq} disabled={guardandoEq}
                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white font-bold py-3 rounded-full transition flex items-center justify-center gap-2">
                {guardandoEq ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
