"use client"

import { useState, useEffect, useCallback } from "react"
import { confirmDialog } from "@/lib/confirm"
import { Tag, Plus, Percent, Calendar, ToggleLeft, ToggleRight,
         Trash2, Edit, X, Save, Loader2, Search, Package } from "lucide-react"
import { SkeletonAdminCardList } from "@/components/ui/SkeletonCard"

interface Producto { id: number; nombre: string; marca?: { nombre: string } | null }
interface Promocion {
  id: number; nombre: string; tipo: string; descuento: number
  codigo: string | null; fecha_inicio: string; fecha_fin: string; activo: boolean
  productos: { producto: { id: number; nombre: string } }[]
}

const TIPOS = ["PRODUCTO", "CODIGO"]
const formVacio = { nombre: "", tipo: "PRODUCTO", descuento: "", codigo: "", fecha_inicio: "", fecha_fin: "" }

export default function PromocionesPage() {
  const [tab, setTab]             = useState<"lista" | "nueva">("lista")
  const [promos, setPromos]       = useState<Promocion[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]         = useState("")
  const [form, setForm]           = useState(formVacio)
  const [editando, setEditando]   = useState<Promocion | null>(null)
  const [idsSeleccionados, setIdsSeleccionados] = useState<number[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState("")

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [rPromos, rProductos] = await Promise.all([
        fetch("/api/admin/promociones").then(r => r.json()),
        fetch("/api/productos").then(r => r.json()),
      ])
      setPromos(rPromos)
      setProductos(Array.isArray(rProductos) ? rProductos : [])
    } catch { setError("Error al cargar datos") }
    finally { setCargando(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
  )

  const toggleProducto = (id: number) =>
    setIdsSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  const handleGuardar = async () => {
    setError("")
    if (!form.nombre || !form.tipo || !form.descuento || !form.fecha_inicio || !form.fecha_fin) {
      setError("Completa todos los campos obligatorios"); return
    }
    setGuardando(true)
    try {
      const url    = editando ? `/api/admin/promociones/${editando.id}` : "/api/admin/promociones"
      const method = editando ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          descuento:   parseFloat(form.descuento as string),
          producto_ids: idsSeleccionados,
        }),
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || "Error al guardar"); return }
      setForm(formVacio); setEditando(null); setIdsSeleccionados([]); setTab("lista")
      await cargar()
    } catch { setError("Error de conexión") }
    finally { setGuardando(false) }
  }

  const handleToggle = async (p: Promocion) => {
    await fetch(`/api/admin/promociones/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !p.activo }),
    })
    await cargar()
  }

  const handleEliminar = async (id: number) => {
    if (!(await confirmDialog("¿Eliminar esta promoción? Ya no se podrá aplicar el descuento.", {
      danger: true, confirmLabel: "Eliminar",
    }))) return
    await fetch(`/api/admin/promociones/${id}`, { method: "DELETE" })
    await cargar()
  }

  const handleEditar = (p: Promocion) => {
    setEditando(p)
    setForm({
      nombre: p.nombre, tipo: p.tipo, descuento: String(p.descuento),
      codigo: p.codigo || "",
      fecha_inicio: p.fecha_inicio.split("T")[0],
      fecha_fin:    p.fecha_fin.split("T")[0],
    })
    setIdsSeleccionados(p.productos.map(pp => pp.producto.id))
    setTab("nueva")
  }

  const handleCancelar = () => {
    setForm(formVacio); setEditando(null)
    setIdsSeleccionados([]); setError(""); setTab("lista")
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
            <Tag className="w-6 h-6 text-pink-500" /> Promociones
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona descuentos por producto</p>
        </div>
        {tab === "lista" && (
          <button onClick={() => setTab("nueva")}
            className="flex items-center gap-2 bg-pink-600 text-white font-bold px-5 py-2.5 rounded-full hover:bg-pink-700 transition text-sm">
            <Plus className="w-4 h-4" /> Nueva promoción
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-100">
        {[{ id: "lista", label: "Lista de promociones" },
          { id: "nueva", label: editando ? "Editar promoción" : "Crear nueva" }
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === t.id ? "border-pink-600 text-pink-700" : "border-transparent text-gray-400 hover:text-pink-600"
            }`}>{t.label}</button>
        ))}
      </div>

      {/* LISTA */}
      {tab === "lista" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Activas",   count: promos.filter(p => p.activo).length,  color: "bg-green-500" },
              { label: "Inactivas", count: promos.filter(p => !p.activo).length, color: "bg-gray-400" },
              { label: "Total",     count: promos.length,                         color: "bg-pink-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold`}>{count}</div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {cargando ? (
            <SkeletonAdminCardList cantidad={4} />
          ) : promos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No hay promociones registradas</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-pink-50 dark:bg-gray-900 border-b border-pink-100 dark:border-gray-700">
                  <tr>
                    {["Nombre","Tipo","Descuento","Código","Productos","Vigencia","Estado","Acciones"].map(h => (
                      <th key={h} className="text-left text-pink-600 dark:text-pink-400 font-semibold px-4 py-3 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {promos.map((p, i) => (
                    <tr key={p.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/50"}`}>
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{p.nombre}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          p.tipo === "PRODUCTO" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        }`}>{p.tipo}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-pink-600 font-bold">
                          <Percent className="w-3 h-3" />{p.descuento}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.codigo || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Package className="w-3 h-3" />
                          {p.productos.length === 0
                            ? <span className="text-amber-500">Sin asignar</span>
                            : `${p.productos.length} producto${p.productos.length !== 1 ? "s" : ""}`
                          }
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {p.fecha_inicio.split("T")[0]} → {p.fecha_fin.split("T")[0]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(p)}
                          className="flex items-center gap-1 text-xs font-bold transition hover:opacity-70">
                          {p.activo
                            ? <><ToggleRight className="w-4 h-4 text-green-500" /><span className="text-green-600">Activa</span></>
                            : <><ToggleLeft className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Inactiva</span></>
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditar(p)}
                            className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEliminar(p.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO */}
      {tab === "nueva" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Datos de la promoción */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-5">
              {editando ? "Editar promoción" : "Nueva promoción"}
            </h2>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">{error}</div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Nombre <span className="text-pink-500">*</span></label>
                <input value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Descuento de Verano"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tipo <span className="text-pink-500">*</span></label>
                  <select value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Descuento (%) <span className="text-pink-500">*</span></label>
                  <input type="number" value={form.descuento}
                    onChange={e => setForm(f => ({ ...f, descuento: e.target.value }))}
                    placeholder="10" min={1} max={100}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Código <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                  placeholder="Ej. VERANO2026"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Fecha inicio <span className="text-pink-500">*</span></label>
                  <input type="date" value={form.fecha_inicio}
                    onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Fecha fin <span className="text-pink-500">*</span></label>
                  <input type="date" value={form.fecha_fin}
                    onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCancelar}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-3 rounded-full hover:bg-gray-50 dark:bg-gray-900 transition text-sm">
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button onClick={handleGuardar} disabled={guardando}
                  className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition disabled:opacity-60 text-sm">
                  {guardando
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    : <><Save className="w-4 h-4" /> {editando ? "Actualizar" : "Guardar"}</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Selector de productos */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 dark:text-white">Productos incluidos</h2>
              {idsSeleccionados.length > 0 && (
                <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {idsSeleccionados.length} seleccionados
                </span>
              )}
            </div>

            {/* Buscador */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={busquedaProducto}
                onChange={e => setBusquedaProducto(e.target.value)}
                placeholder="Buscar producto..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-pink-400"
              />
            </div>

            {/* Lista */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {productosFiltrados.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-6">Sin resultados</p>
              ) : productosFiltrados.map(p => {
                const seleccionado = idsSeleccionados.includes(p.id)
                return (
                  <button key={p.id} onClick={() => toggleProducto(p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                      seleccionado
                        ? "bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-300"
                        : "bg-gray-50 dark:bg-gray-900 border border-transparent hover:border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                    <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all ${
                      seleccionado ? "bg-pink-600 border-pink-600" : "border-gray-300"
                    }`}>
                      {seleccionado && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="font-medium truncate">{p.nombre}</span>
                  </button>
                )
              })}
            </div>

            {idsSeleccionados.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mt-3">
                ⚠️ Sin productos seleccionados, la promoción no se aplicará a ningún producto.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}