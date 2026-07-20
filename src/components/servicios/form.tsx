'use client'

// src/components/servicios/form.tsx
import { useTransition } from 'react'
import { useRouter }     from 'next/navigation'
import { toast } from '@/lib/toast'
import { Loader2 }       from 'lucide-react'

interface Categoria {
  id:     number
  nombre: string
}

interface ServicioData {
  id:           number
  nombre:       string
  descripcion:  string
  precio:       number
  duracion:     string
  imagen:       string
  activo:       boolean
  beneficios:   string
  incluye:      string
  categoria_id: number | null
}

interface Props {
  categorias: Categoria[]
  servicio?:  ServicioData
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition'
const labelClass =
  'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function ServicioForm({ categorias, servicio }: Props) {
  const router               = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing            = !!servicio

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const url    = isEditing ? `/api/servicios/${servicio!.id}` : '/api/servicios'
      const method = isEditing ? 'PUT' : 'POST'

      const body = {
        nombre:       formData.get('nombre'),
        descripcion:  formData.get('descripcion'),
        precio:       Number(formData.get('precio')),
        duracion:     formData.get('duracion'),
        imagen:       formData.get('imagen'),
        beneficios:   formData.get('beneficios'),
        incluye:      formData.get('incluye'),
        activo:       formData.get('activo') === 'on',
        categoria_id: formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null,
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (res.ok) router.push('/admin/servicios')
      else        toast.error('Error al guardar el servicio')
    })
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-pink-100 dark:border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 to-pink-700 px-8 py-5">
        <h2 className="text-xl font-semibold text-white tracking-wide">
          {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h2>
        <p className="text-pink-200 text-sm mt-0.5">
          {isEditing ? 'Modifica la información del servicio' : 'Completa la información del servicio'}
        </p>
      </div>

      <form action={handleSubmit}>
        <div className="p-8 space-y-4">

          {/* Nombre */}
          <div className="space-y-1">
            <label className={labelClass}>Nombre *</label>
            <input
              name="nombre"
              required
              defaultValue={servicio?.nombre ?? ''}
              placeholder="Ej. Uñas esculturales"
              className={inputClass}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className={labelClass}>Descripción</label>
            <textarea
              name="descripcion"
              defaultValue={servicio?.descripcion ?? ''}
              placeholder="Describe el servicio brevemente..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Precio + Duración */}
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
                  defaultValue={servicio?.precio ?? ''}
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
                defaultValue={servicio?.duracion ?? ''}
                placeholder="Ej. 60 min"
                className={inputClass}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Categoría</label>
              <select
                name="categoria_id"
                defaultValue={servicio?.categoria_id ?? ''}
                className={inputClass}
              >
                <option value="">Sin categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>Imagen (URL)</label>
              <input
                name="imagen"
                defaultValue={servicio?.imagen ?? ''}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Beneficios */}
          <div className="space-y-1">
            <label className={labelClass}>Beneficios</label>
            <textarea
              name="beneficios"
              defaultValue={servicio?.beneficios ?? ''}
              placeholder="Lista los beneficios del servicio..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Incluye */}
          <div className="space-y-1">
            <label className={labelClass}>¿Qué incluye?</label>
            <textarea
              name="incluye"
              defaultValue={servicio?.incluye ?? ''}
              placeholder="Describe qué incluye el servicio..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Activo toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
            <div className="relative">
              <input
                type="checkbox"
                name="activo"
                defaultChecked={servicio?.activo ?? true}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-pink-600 transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-gray-600 font-medium">Activo</span>
          </label>

        </div>

        {/* Footer */}
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
            ) : isEditing ? 'Actualizar Servicio' : 'Guardar Servicio'}
          </button>
        </div>
      </form>
    </div>
  )
}