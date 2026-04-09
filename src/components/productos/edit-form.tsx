'use client'

import { useTransition } from 'react'
import { updateProducto } from '@/lib/actionsproductos'
import { useRouter } from 'next/navigation'
import { Loader2, Info } from 'lucide-react'
import ImageUpload from '@/../src/components/productos/ImageUpload'

interface Marca {
  id: number
  nombre: string
}

interface Categoria {
  id: number
  nombre: string
}

interface Producto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  precio_costo: number
  precio_venta: number
  imagenes: string[]
  marca_id: number | null
  categoria_id: number | null
  stock: number
  activo: boolean | null
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition'
const labelClass =
  'text-xs font-semibold text-gray-500 uppercase tracking-wider'

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

  const initialImages = producto.imagenes
  

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-rose-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 to-pink-700 px-8 py-5">
        <h2 className="text-xl font-semibold text-white tracking-wide">
          Editar Producto
        </h2>
        <p className="text-rose-200 text-sm mt-0.5">
          Modifica la información del producto
        </p>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            await updateProducto(producto.id, formData)
            router.push('/admin/productos')
          })
        }}
      >
        <div className="flex gap-0">
          {/* ── Columna izquierda: campos ── */}
          <div className="flex-1 p-8 space-y-4">
            {/* Código + Nombre */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Código *</label>
                <input
                  name="codigo"
                  required
                  defaultValue={producto.codigo}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Nombre *</label>
                <input
                  name="nombre"
                  required
                  defaultValue={producto.nombre}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Descripción</label>
              <textarea
                name="descripcion"
                defaultValue={producto.descripcion ?? ''}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

           
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Precio Costo *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    name="precio_costo"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={producto.precio_costo}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Precio Venta *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    name="precio_venta"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={producto.precio_venta}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Marca *</label>
                <select
                  name="marca_id"
                  required
                  defaultValue={producto.marca_id ?? ''}
                  className={inputClass}
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Categoría *</label>
                <select
                  name="categoria_id"
                  required
                  defaultValue={producto.categoria_id ?? ''}
                  className={inputClass}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock + Activo */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className={labelClass}>Stock *</label>
                <input
                  name="stock"
                  type="number"
                  required
                  defaultValue={producto.stock}
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
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
                <span className="text-sm text-gray-600 font-medium">Activo</span>
              </label>
            </div>
          </div>

          <div className="w-px bg-rose-100 my-6" />

          {/* ── Columna derecha: COMPONENTE MULTI-IMAGEN ── */}
          <div className="w-64 flex-shrink-0 p-8 flex flex-col items-center gap-4">
            
            <ImageUpload initialImages={initialImages} />

            <div className="mt-auto w-full rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <Info className="w-3.5 h-3.5 inline-block align-middle mr-1 flex-shrink-0" />
                Puedes gestionar hasta 4 fotos. Las imágenes actuales se mantendrán a menos que las elimines.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Actualizando...
              </span>
            ) : (
              'Actualizar Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}