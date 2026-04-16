'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Star, GripVertical } from 'lucide-react'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
}

const MAX = 4

type Slot =
  | { type: 'existing'; url: string }
  | { type: 'new'; url: string; fileIndex: number; fileName: string }

export default function UploadCursoImages({ value, onChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (Array.isArray(value) ? value : [])
      .filter((u) => typeof u === 'string' && u.startsWith('http'))
      .slice(0, MAX)
      .map((url) => ({ type: 'existing', url }))
  )

  const filesRef = useRef<(File | null)[]>([])
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

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

    const newSlots: Slot[] = toAdd.map((file) => {
      const fileIndex = filesRef.current.length
      filesRef.current.push(file)

      return {
        type: 'new',
        url: URL.createObjectURL(file),
        fileIndex,
        fileName: file.name
      }
    })

    const updated = [...slots, ...newSlots]
    setSlots(updated)

    // solo UI
    onChange(updated.map((s) => s.url))

    e.target.value = ''
  }, [slots, onChange])

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const slot = prev[index]

      if (slot.type === 'new') {
        URL.revokeObjectURL(slot.url)
        filesRef.current[slot.fileIndex] = null
      }

      const next = prev.filter((_, i) => i !== index)
      onChange(next.map((s) => s.url))

      return next
    })
  }, [onChange])

  const handleDragStart = (index: number) => {
    dragIndex.current = index
  }

  const handleDragEnter = (index: number) => {
    if (dragIndex.current === null || dragIndex.current === index) return
    setDragOver(index)
  }

  const handleDrop = (dropIndex: number) => {
    const from = dragIndex.current

    if (from === null || from === dropIndex) {
      dragIndex.current = null
      setDragOver(null)
      return
    }

    setSlots((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(dropIndex, 0, moved)

      onChange(next.map((s) => s.url))
      return next
    })

    dragIndex.current = null
    setDragOver(null)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOver(null)
  }

  return (
    <div className="w-full space-y-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Imágenes del Curso (máx. {MAX})
      </p>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className="relative aspect-square rounded-2xl overflow-hidden border-2 bg-pink-50"
          >
            <Image
              src={slot.url}
              alt=""
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
              className="absolute top-2 right-2 bg-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 🔥 CLAVE: enviar al backend */}
            {slot.type === 'existing' ? (
              <input type="hidden" name="existing_images[]" value={slot.url} />
            ) : (
              <HiddenFileInput file={filesRef.current[slot.fileIndex]} />
            )}
          </div>
        ))}

        {slots.length < MAX && (
          <label className="aspect-square flex items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer">
            <Plus />
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
    </div>
  )
}

function HiddenFileInput({ file }: { file: File | null }) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref.current || !file) return

    const dt = new DataTransfer()
    dt.items.add(file)
    ref.current.files = dt.files
  }, [file])

  if (!file) return null

  return (
    <input
      ref={ref}
      type="file"
      name="imagenes"
      className="hidden"
    />
  )
}
