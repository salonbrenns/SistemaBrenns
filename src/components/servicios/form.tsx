'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

const CATEGORIAS = ['Manicura', 'Pedicura', 'Uñas', 'Tratamiento', 'Otro']

interface ServicioData {
  id: number
  nombre: string
  descripcion: string
  precio: number
  duracion: string
  categoria: string
  imagen: string
  activo: boolean
}

interface Props {
  servicio?: ServicioData
}

export default function ServicioForm({ servicio }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const esEditar = !!servicio

  const [form, setForm] = useState({
    nombre:      servicio?.nombre      || '',
    descripcion: servicio?.descripcion || '',
    precio:      servicio?.precio?.toString() || '',
    duracion:    servicio?.duracion    || '',
    categoria:   servicio?.categoria   || 'Manicura',
    activo:      servicio?.activo      ?? true,
  })

  const [imagenPreview, setImagenPreview] = useState<string>(servicio?.imagen || '')
  const [imagenFile,    setImagenFile]    = useState<File | null>(null)
  const [guardando,     setGuardando]     = useState(false)
  const [errores,       setErrores]       = useState<Record<string, string>>({})
  const [errorGeneral,  setErrorGeneral]  = useState('')

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
  }

  const validar = () => {
    const errs: Record<string, string> = {}
    if (!form.nombre.trim())   errs.nombre  = 'El nombre es obligatorio'
    if (!form.precio)          errs.precio  = 'El precio es obligatorio'
    if (isNaN(Number(form.precio)) || Number(form.precio) <= 0) 
      errs.precio = 'Precio inválido'
    if (!form.duracion.trim()) errs.duracion = 'La duración es obligatoria'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrores({})
    setErrorGeneral('')

    const errs = validar()
    if (Object.keys(errs).length > 0) {
      setErrores(errs)
      return
    }

    setGuardando(true)
    try {
      let imagenUrl = servicio?.imagen || null

      if (imagenFile) {
        const fd = new FormData()
        fd.append('file', imagenFile)
        const upRes = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error('Error al subir la imagen')
        imagenUrl = upData.url
      }

      const body = {
        nombre:      form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio:      Number(form.precio),
        duracion:    form.duracion.trim(),
        categoria:   form.categoria,
        imagen:      imagenUrl,
        activo:      form.activo,
      }

      const url    = esEditar ? `/api/admin/servicios/${servicio!.id}` : '/api/admin/servicios'
      const method = esEditar ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al guardar')
      }

      router.push('/admin/servicios')
      router.refresh()
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error inesperado'
      setErrorGeneral(mensaje)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/admin/servicios"
            className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium transition"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver a Servicios
          </Link>
        
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda - Imagen (ocupa 5/12) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 h-fit sticky top-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4">Imagen del Servicio</label>
              
              <div
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer group w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-pink-400 bg-gray-50 overflow-hidden transition-all"
              >
                {imagenPreview ? (
                  <Image
                    src={imagenPreview}
                    alt="preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mb-4">
                      <PhotoIcon className="h-10 w-10 text-pink-500" />
                    </div>
                    <p className="font-medium text-gray-700">Subir imagen</p>
                    <p className="text-sm text-gray-500 mt-1 px-8">JPG, PNG o WEBP • Recomendado 1000×1000 px</p>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <span className="text-white font-medium px-6 py-2 bg-black/50 rounded-full">Cambiar imagen</span>
                </div>
              </div>

              <input 
                ref={fileRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFile} 
                className="hidden" 
              />

              <p className="text-xs text-gray-500 text-center mt-4">
                La imagen se mostrará en la tienda y en el catálogo
              </p>
            </div>
          </div>

          {/* Columna Derecha - Datos del formulario (ocupa 7/12) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8">

              {/* Nombre */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Servicio <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Manicure Semipermanente con Diseño"
                  className={`w-full px-5 py-3.5 text-base rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-200 transition ${
                    errores.nombre ? 'border-red-400' : 'border-gray-200'
                  }`}
                />
                {errores.nombre && <p className="mt-1.5 text-sm text-red-600">{errores.nombre}</p>}
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={4}
                  placeholder="Describe detalladamente el servicio, materiales incluidos, duración aproximada y cuidados posteriores..."
                  className="w-full px-5 py-3.5 text-base rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                />
              </div>

              {/* Precio y Duración */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio (MXN) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.precio}
                      onChange={e => setForm({ ...form, precio: e.target.value })}
                      placeholder="380"
                      className={`w-full pl-9 pr-5 py-3.5 text-base rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-200 transition ${
                        errores.precio ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {errores.precio && <p className="mt-1.5 text-sm text-red-600">{errores.precio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duración <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.duracion}
                    onChange={e => setForm({ ...form, duracion: e.target.value })}
                    placeholder="60 minutos"
                    className={`w-full px-5 py-3.5 text-base rounded-2xl border focus:outline-none focus:ring-2 focus:ring-pink-200 transition ${
                      errores.duracion ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errores.duracion && <p className="mt-1.5 text-sm text-red-600">{errores.duracion}</p>}
                </div>
              </div>

              {/* Categoría y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                    className="w-full px-5 py-3.5 text-base rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-200 bg-white"
                  >
                    {CATEGORIAS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Toggle Activo / Inactivo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Estado</label>
                  <div 
                    onClick={() => setForm({ ...form, activo: !form.activo })}
                    className={`flex items-center justify-between px-6 py-4 rounded-2xl border cursor-pointer transition-all ${
                      form.activo 
                        ? 'border-pink-300 bg-pink-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${form.activo ? 'bg-pink-600' : 'bg-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800">
                          {form.activo ? 'Activo' : 'Inactivo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {form.activo ? 'Visible en la tienda' : 'Oculto para clientes'}
                        </p>
                      </div>
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Error general */}
            {errorGeneral && (
              <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 text-sm">
                {errorGeneral}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 mt-8">
              <Link
                href="/admin/servicios"
                className="flex-1 py-4 text-center rounded-2xl border border-gray-300 font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={guardando}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 rounded-2xl hover:from-pink-700 hover:to-rose-700 transition disabled:opacity-50"
              >
                {guardando 
                  ? 'Guardando servicio...' 
                  : esEditar 
                    ? 'Guardar Cambios' 
                    : 'Crear Servicio'
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}