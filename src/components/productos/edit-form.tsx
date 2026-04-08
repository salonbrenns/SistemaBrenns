'use client'

import { useTransition } from 'react'
import { updateProducto } from '@/lib/actionsproductos'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ImageUpload from '@/components/productos/ImageUpload'
import VariantesEditor, { type VarianteForm } from '@/components/productos/variantesEditor'

interface Marca     { id: number; nombre: string }
interface Categoria { id: number; nombre: string }

interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  marca_id: number | null
  categoria_id: number | null
  activo: boolean | null
  imagenes: string[]
  variantes: VarianteForm[]
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function EditProductoForm({
  producto,
  marcas,
  categorias,
}: {
  producto: Producto
  marcas: Marca[]
  categorias: Categoria[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl border border-rose-100 overflow-hidden">
      <div className="bg-gradient-to-r from-rose-800 to-pink-700 px-8 py-5">
        <h2 className="text-xl font-semibold text-white tracking-wide">Editar Producto</h2>
        <p className="text-rose-200 text-sm mt-0.5">Modifica la información y gestiona las variantes</p>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            await updateProducto(producto.id, formData)
            router.push('/admin/productos')
          })
        }}
      >
        <div className="p-8 space-y-8">

          {/* ── Información general ── */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Información general
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className={labelClass}>Nombre del producto *</label>
                <input
                  name="nombre"
                  required
                  defaultValue={producto.nombre}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Marca *</label>
                <select name="marca_id" required defaultValue={producto.marca_id ?? ''} className={inputClass}>
                  <option value="">Seleccionar marca</option>
                  {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Categoría *</label>
                <select name="categoria_id" required defaultValue={producto.categoria_id ?? ''} className={inputClass}>
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="col-span-2 space-y-1">
                <label className={labelClass}>Descripción</label>
                <textarea
                  name="descripcion"
                  defaultValue={producto.descripcion ?? ''}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  name="activo"
                  defaultChecked={producto.activo ?? true}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-rose-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Producto activo</span>
            </label>
          </section>

          {/* ── Imágenes ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Imágenes del producto
            </h3>
            <ImageUpload initialImages={producto.imagenes} />
          </section>

          {/* ── Variantes ── */}
          <section className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
              Variantes
              <span className="ml-2 normal-case font-normal text-gray-400">
                (tono, presentación, precio y stock por variante)
              </span>
            </h3>
            <VariantesEditor initialVariantes={producto.variantes} />
          </section>

        </div>

        <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/admin/productos')}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-rose-700 to-pink-600 text-white text-sm font-semibold shadow-md hover:from-rose-800 hover:to-pink-700 disabled:opacity-60 transition"
          >
            {isPending
              ? <span className="flex items-center gap-2"><Loader2 className="animate-spin w-4 h-4" />Actualizando...</span>
              : 'Actualizar Producto'}
          </button>
        </div>
      </form>
    </div>
  )
}