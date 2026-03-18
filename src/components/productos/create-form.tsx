'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProducto } from '@/lib/actionsproductos'
import Image from 'next/image'
import { ImageIcon, Loader2, Info } from 'lucide-react'

interface Marca {
  id: number
  nombre: string
}
interface Categoria {
  id: number
  nombre: string
}

export default function CreateProductoForm({
  marcas,
  categorias,
}: {
  marcas: Marca[]
  categorias: Categoria[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl border border-rose-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-800 to-pink-700 px-8 py-5">
        <h2 className="text-xl font-semibold text-white tracking-wide">
          Nuevo Producto
        </h2>
        <p className="text-rose-200 text-sm mt-0.5">
          Completa la información del producto
        </p>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            await createProducto(formData)
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Código *
                </label>
                <input
                  name="codigo"
                  required
                  placeholder="Ej. PROD-001"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nombre *
                </label>
                <input
                  name="nombre"
                  required
                  placeholder="Nombre del producto"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Descripción
              </label>
              <textarea
                name="descripcion"
                placeholder="Describe el producto brevemente..."
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Costo *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    name="precio_costo"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Precio Venta *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    $
                  </span>
                  <input
                    name="precio_venta"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Marca + Categoría */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Marca *
                </label>
                <select
                  name="marca_id"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                >
                  <option value="">Seleccionar marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categoría *
                </label>
                <select
                  name="categoria_id"
                  required
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stock + Activo */}
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock *
                </label>
                <input
                  name="stock"
                  type="number"
                  step="1"
                  min="0"
                  required
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-rose-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <span className="text-sm text-gray-600 font-medium">Activo</span>
              </label>
            </div>
          </div>

          {/* Divisor vertical */}
          <div className="w-px bg-rose-100 my-6" />

          {/* ── Columna derecha: imagen ── */}
          <div className="w-64 flex-shrink-0 p-8 flex flex-col items-center gap-4">
            <div className="w-full text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Imagen del Producto
              </p>

              {/* Preview o placeholder */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-rose-200 bg-rose-50 flex items-center justify-center mb-3">
                {preview ? (
                  <>
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-6 h-6 flex items-center justify-center shadow text-gray-500 hover:text-red-500 text-xs font-bold transition"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <ImageIcon className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Sin imagen</p>
                  </div>
                )}
              </div>

              {/* Botón de subida */}
              <label className="block w-full cursor-pointer">
                <span className="block w-full text-center text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-4 py-2 transition">
                  {preview ? 'Cambiar imagen' : 'Subir imagen'}
                </span>
                <span className="block text-center text-xs text-gray-400 mt-1">
                  JPG, PNG, WEBP
                </span>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info card decorativa */}
            <div className="mt-auto w-full rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <Info className="w-3.5 h-3.5 inline-block align-middle mr-1 flex-shrink-0" />
                Usa imágenes cuadradas de al menos <strong>400×400 px</strong> para mejor calidad.
              </p>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
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
                Guardando...
              </span>
            ) : (
              'Guardar Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}