"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Upload, CheckCircle, Loader2, ImageIcon, Info } from "lucide-react"

export default function CertificadosAdminPage() {
  const [plantilla,  setPlantilla]  = useState<string | null>(null)
  const [subiendo,   setSubiendo]   = useState(false)
  const [guardado,   setGuardado]   = useState(false)
  const [error,      setError]      = useState("")
  const [preview,    setPreview]    = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/admin/certificados/plantilla")
      .then(r => r.json())
      .then(d => setPlantilla(d.plantilla))
      .catch(() => {})
  }, [])

  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubir = async () => {
    const file = inputRef.current?.files?.[0]
    if (!file) return
    setSubiendo(true)
    setError("")
    setGuardado(false)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/admin/certificados/plantilla", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPlantilla(data.url)
      setPreview(null)
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
      if (inputRef.current) inputRef.current.value = ""
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Plantilla de Certificados</h1>

      {/* Info */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl px-5 py-4">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-bold">¿Cómo funciona?</p>
          <p>Sube la imagen de fondo del certificado (JPG o PNG). El sistema pondrá automáticamente la <strong>foto y el nombre del alumno</strong>, el <strong>nombre del curso</strong> y la <strong>fecha</strong> sobre esta plantilla.</p>
          <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Recomendado: imagen horizontal (1240 × 877 px), con espacio en blanco para el nombre y la foto.</p>
        </div>
      </div>

      {/* Plantilla actual */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-pink-50 dark:border-gray-700">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-pink-500" />
            Plantilla actual
          </h2>
        </div>
        <div className="p-6">
          {plantilla ? (
            <div className="relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
              <Image
                src={plantilla}
                alt="Plantilla del certificado"
                width={800}
                height={566}
                className="w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">Sin plantilla aún</p>
              <p className="text-xs text-gray-300 dark:text-gray-500 mt-1">Sube una imagen para usarla como fondo del certificado</p>
            </div>
          )}
        </div>
      </div>

      {/* Subir nueva */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
        <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-pink-500" />
          {plantilla ? "Cambiar plantilla" : "Subir plantilla"}
        </h2>

        {/* Drop area */}
        <label
          htmlFor="plantilla-input"
          className="flex flex-col items-center justify-center border-2 border-dashed border-pink-200 dark:border-gray-600 rounded-2xl p-8 cursor-pointer hover:border-pink-400 dark:hover:border-pink-700 hover:bg-pink-50/40 dark:hover:bg-pink-950/10 transition group"
        >
          {preview ? (
            <div className="relative w-full rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="w-full object-contain max-h-60" />
              <p className="text-xs text-center text-gray-400 mt-2">Vista previa · Haz clic para cambiar</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-pink-300 group-hover:text-pink-500 mb-3 transition" />
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Arrastra una imagen o haz clic</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG — Máximo 10 MB</p>
            </>
          )}
          <input
            id="plantilla-input"
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubir}
            disabled={!preview || subiendo}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {subiendo ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Guardar plantilla</>}
          </button>
          {guardado && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" /> Plantilla guardada
            </span>
          )}
        </div>
      </div>

      {/* Preview de cómo se verá */}
      {plantilla && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-gray-700 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Ejemplo de certificado generado
          </h2>
          <a
            href="/certificado/demo"
            target="_blank"
            className="text-sm text-pink-600 hover:underline font-medium"
          >
            Ver ejemplo de cómo se verá el certificado →
          </a>
        </div>
      )}
    </div>
  )
}
