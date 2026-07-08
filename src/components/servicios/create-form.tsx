'use client'

// src/components/servicios/create-form.tsx
import { useTransition } from 'react'
import { useRouter }     from 'next/navigation'
import { Loader2, Info } from 'lucide-react'
import ImageUploadServicio from '@/components/servicios/ImageUploadServicio'

interface Categoria {
  id:     number
  nombre: string
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition'
const labelClass =
  'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function CreateServicioForm({
  categorias,
}: {
  categorias: Categoria[]
}) {
  const router                       = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-pink-100 dark:border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 to-pink-700 px-8 py-5">
        <h2 className="text-xl font-semibold text-white tracking-wide">
          Nuevo Servicio
        </h2>
        <p className="text-pink-200 text-sm mt-0.5">
          Completa la información del servicio
        </p>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            // Subir imágenes a Cloudinary primero
            const imageFiles = formData.getAll('imagenes') as File[]
            const urls: string[] = []

            // Mantener imágenes existentes
            const existing = formData.getAll('existing_images[]') as string[]
            urls.push(...existing)

            // Subir nuevas
            for (const file of imageFiles) {
              if (!file || file.size === 0) continue
              const fd = new FormData()
              fd.append('file', file)
              const res = await fetch('/api/admin/upload-servicio', { method: 'POST', body: fd })
              if (res.ok) {
                const data = await res.json()
                urls.push(data.url)
              }
            }

            const body = {
              nombre:       formData.get('nombre'),
              descripcion:  formData.get('descripcion') || null,
              precio:       Number(formData.get('precio')),
              duracion:     formData.get('duracion'),
              beneficios:   formData.get('beneficios') || null,
              incluye:      formData.get('incluye')    || null,
              activo:       formData.get('activo') === 'on',
              categoria_id: formData.get('categoria_id')
                              ? Number(formData.get('categoria_id'))
                              : null,
              imagen:       urls[0] ?? null,   // primera imagen como principal
            }

            const res = await fetch('/api/admin/servicios', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify(body),
            })

            if (res.ok) router.push('/admin/servicios')
            else        alert('Error al crear el servicio')
          })
        }}
      >
        <div className="flex gap-0">

          {/* ── Columna izquierda: campos ── */}
          <div className="flex-1 p-8 space-y-4">

            <div className="space-y-1">
              <label className={labelClass}>Nombre *</label>
              <input
                name="nombre"
                required
                placeholder="Ej. Uñas esculturales"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Descripción</label>
              <textarea
                name="descripcion"
                placeholder="Describe el servicio brevemente..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Precio *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Duración *</label>
                <input
                  name="duracion"
                  required
                  placeholder="Ej. 60 min"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Categoría</label>
              <select name="categoria_id" className={inputClass}>
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Beneficios</label>
              <textarea
                name="beneficios"
                placeholder="Lista los beneficios del servicio..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>¿Qué incluye?</label>
              <textarea
                name="incluye"
                placeholder="Describe qué incluye el servicio..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <div className="relative">
                <input type="checkbox" name="activo" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-pink-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm text-gray-600 font-medium">Activo</span>
            </label>
          </div>

          <div className="w-px bg-pink-100 my-6" />

          {/* ── Columna derecha: imagen ── */}
          <div className="w-64 flex-shrink-0 p-8 flex flex-col items-center gap-4">
            <ImageUploadServicio />
            <div className="mt-auto w-full rounded-lg bg-amber-50 border border-amber-100 p-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <Info className="w-3.5 h-3.5 inline-block align-middle mr-1 flex-shrink-0" />
                Puedes subir hasta <strong>4 imágenes</strong> para el servicio.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-8 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/admin/servicios')}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-800 to-pink-600 text-white text-sm font-semibold shadow-md hover:from-pink-900 hover:to-pink-700 disabled:opacity-60 transition"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Guardando...
              </span>
            ) : 'Guardar Servicio'}
          </button>
        </div>
      </form>
    </div>
  )
}