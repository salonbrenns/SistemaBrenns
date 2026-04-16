'use client'

import { useState, useTransition } from 'react'

import { Loader2, Info } from 'lucide-react'
import UploadCursoImages from './UploadCursoImages'
import Link from 'next/link'
import { createCurso, updateCurso } from '@/lib/actionscursos'

interface Curso {
  id?: number
  codigo: string
  titulo: string
  descripcion?: string
  precio_total: number
  cupo_maximo: number
  duracion_horas?: number
  nivel?: string
  fecha_inicio?: string
  fecha_fin?: string
  activo: boolean
  imagenes: string[]
}

const inputClass = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition'
const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wider'

export default function CursoForm({ curso }: { curso?: Curso }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<Curso>(
    curso || {
      codigo: '', titulo: '', descripcion: '', precio_total: 0, cupo_maximo: 0,
      duracion_horas: 0, nivel: '', fecha_inicio: '', fecha_fin: '', activo: true, imagenes: []
    }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // El checkbox no se añade automáticamente si es custom, lo forzamos:
    formData.set('activo', String(form.activo))

    startTransition(async () => {
      try {
        if (curso?.id) {
          await updateCurso(curso.id, formData)
        } else {
          await createCurso(formData)
        }
      } catch (error) {
        alert("Error al guardar el curso")
      }
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white shadow-2xl border border-pink-100 overflow-hidden">
      <div className="bg-gradient-to-r from-pink-700 to-pink-600 px-10 py-6">
        <h2 className="text-2xl font-semibold text-white tracking-wide">
          {curso ? 'Editar Curso' : 'Nuevo Curso'}
        </h2>
        <p className="text-pink-100 text-sm mt-1">Completa la información del curso</p>
      </div>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="flex gap-0 flex-col md:flex-row">
          {/* COLUMNA IZQUIERDA */}
          <div className="flex-1 p-10 space-y-8">
            <section className="space-y-6">
              <h3 className={labelClass}>Información General</h3>
              <div className="space-y-1">
                <label className={labelClass}>Código *</label>
                <input name="codigo" value={form.codigo} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Título del curso *</label>
                <input name="titulo" value={form.titulo} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={4} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Precio (MXN) *</label>
                  <input type="number" name="precio_total" value={form.precio_total} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Cupo máximo *</label>
                  <input type="number" name="cupo_maximo" value={form.cupo_maximo} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className={labelClass}>Detalles</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Duración (horas)</label>
                  <input type="number" name="duracion_horas" value={form.duracion_horas} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Nivel</label>
                  <select name="nivel" value={form.nivel} onChange={handleChange} className={inputClass}>
                    <option value="">Seleccionar nivel</option>
                    <option value="BASICO">Básico</option>
                    <option value="INTERMEDIO">Intermedio</option>
                    <option value="AVANZADO">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className={labelClass}>Fecha Inicio</label>
                  <input type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Fecha Fin</label>
                  <input type="date" name="fecha_fin" value={form.fecha_fin} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </section>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.activo} onChange={() => setForm(prev => ({ ...prev, activo: !prev.activo }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-pink-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700">Curso activo</span>
            </label>
          </div>

          {/* COLUMNA DERECHA - IMÁGENES */}
          <div className="w-full md:w-96 p-10 bg-gray-50/50">
            <UploadCursoImages value={form.imagenes} />
            <div className="mt-8 rounded-2xl bg-amber-50 border border-amber-100 p-5">
              <p className="text-xs text-amber-700 flex gap-2">
                <Info className="w-4 h-4 mt-0.5" />
                Máximo 4 imágenes. La primera será la principal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 px-10 py-6 bg-gray-50 border-t">
          <Link href="/admin/cursos" className="px-6 py-3 rounded-xl border text-sm font-medium hover:bg-gray-100 transition">
            Cancelar
          </Link>
          <button type="submit" disabled={isPending} className="px-8 py-3 rounded-xl bg-pink-700 text-white font-semibold hover:bg-pink-800 disabled:opacity-60 transition flex items-center gap-2">
            {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : curso ? 'Actualizar Curso' : 'Crear Curso'}
          </button>
        </div>
      </form>
    </div>
  )
}