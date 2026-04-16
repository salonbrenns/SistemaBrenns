'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Plus } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

const MAX = 4

type Slot =
  | { type: 'existing'; url: string }
  | { type: 'new'; url: string; file: File; fileName: string }

export default function UploadCursoImages({ value, onChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (Array.isArray(value) ? value : [])
      .filter((u) => typeof u === 'string' && u.startsWith('http'))
      .slice(0, MAX)
      .map((url) => ({ type: 'existing', url }))
  )

  useEffect(() => {
    return () => {
      slots.forEach((s) => {
        if (s.type === 'new') URL.revokeObjectURL(s.url)
      })
    }
  }, [slots])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const freeSlots = MAX - slots.length
    const toAdd = files.slice(0, freeSlots)

    const newSlots: Slot[] = toAdd.map((file) => ({
      type: 'new',
      url: URL.createObjectURL(file),
      file,
      fileName: file.name
    }))

    const updated = [...slots, ...newSlots]
    setSlots(updated)

    // solo preview UI
    onChange(updated.map((s) => s.url))

    e.target.value = ''
  }, [slots, onChange])

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const slot = prev[index]

      if (slot.type === 'new') {
        URL.revokeObjectURL(slot.url)
      }

      const next = prev.filter((_, i) => i !== index)
      onChange(next.map((s) => s.url))

      return next
    })
  }, [onChange])

  return (
    <div className="w-full space-y-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Imágenes del Curso (máx. {MAX})
      </p>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 bg-pink-50"
          >
            <Image
              src={slot.url}
              alt={`Imagen ${i + 1}`}
              fill
              className="object-cover"
            />

            {i === 0 && (
              <span className="absolute top-2 left-2 bg-pink-700 text-white text-[10px] px-2 py-0.5 rounded">
                Principal
              </span>
            )}

            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 🔥 ENVÍO AL BACKEND */}
            {slot.type === 'existing' ? (
              <input type="hidden" name="existing_images[]" value={slot.url} />
            ) : (
              <HiddenFileInput file={slot.file} />
            )}
          </div>
        ))}

        {slots.length < MAX && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-2xl cursor-pointer hover:bg-pink-50">
            <Plus className="w-6 h-6 text-pink-400" />
            <span className="text-xs text-pink-400 mt-1">Añadir</span>

            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      <p className="text-[10px] text-gray-400 italic">
        Puedes subir hasta {MAX} imágenes.
      </p>
    </div>
  )
}

/* 🔥 INPUT OCULTO PARA FORM DATA */
function HiddenFileInput({ file }: { file: File }) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const dt = new DataTransfer()
    dt.items.add(file)
    ref.current.files = dt.files
  }, [file])

  return (
    <input
      ref={ref}
      type="file"
      name="imagenes"
      className="hidden"
    />
  )
}