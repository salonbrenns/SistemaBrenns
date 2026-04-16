'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Star, GripVertical } from 'lucide-react'

interface Props {
  value?: string[] // URLs iniciales (existentes)
  onChange?: (urls: string[]) => void
}

const MAX = 4

type Slot =
  | { type: 'existing'; url: string }
  | { type: 'new'; url: string; fileIndex: number }

export default function UploadCursoImages({ value = [] }: Props) {
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
    const current = slots
    return () => {
      current.forEach((s) => {
        if (s.type === 'new') URL.revokeObjectURL(s.url)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDragStart = (index: number) => { dragIndex.current = index }
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
      return next
    })
    dragIndex.current = null
    setDragOver(null)
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const free = MAX - slots.length
    const toAdd = files.slice(0, free)

    const newSlots: Slot[] = toAdd.map((file) => {
      const fileIndex = filesRef.current.length
      filesRef.current.push(file)
      return { type: 'new', url: URL.createObjectURL(file), fileIndex }
    })

    setSlots((prev) => [...prev, ...newSlots])
    e.target.value = ''
  }, [slots.length])

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const slot = prev[index]
      if (slot.type === 'new') {
        URL.revokeObjectURL(slot.url)
        filesRef.current[slot.fileIndex] = null
      }
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  return (
    <div className="w-full space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Imágenes del Curso <span className="text-gray-400 font-normal">(máx. {MAX})</span>
      </p>

      {slots.length > 1 && (
        <p className="text-[10px] text-pink-500 flex items-center gap-1">
          <GripVertical className="w-3 h-3" />
          Arrastra para reordenar · La primera es la principal
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <div
            key={`curso-slot-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={() => { dragIndex.current = null; setDragOver(null) }}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-pink-50 shadow-sm group cursor-grab active:cursor-grabbing transition-all ${
              dragOver === i ? 'border-pink-500 scale-105 z-20' : 'border-pink-100'
            }`}
          >
            <Image
              src={slot.url}
              alt={`Curso ${i}`}
              fill
              className="object-cover pointer-events-none"
              sizes="200px"
            />
            
            {i === 0 && (
              <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-pink-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-white" /> Principal
              </span>
            )}

            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1 shadow hover:text-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 🔥 ENVÍO AL BACKEND: Mismo nombre que en productos */}
            {slot.type === 'existing' ? (
              <input type="hidden" name="existing_images[]" value={slot.url} />
            ) : (
              <HiddenFileInput file={filesRef.current[slot.fileIndex]} />
            )}
          </div>
        ))}

        {slots.length < MAX && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-2xl hover:bg-pink-50 cursor-pointer transition-colors group">
            <Plus className="w-7 h-7 text-pink-300 group-hover:text-pink-500" />
            <span className="text-[11px] text-pink-400 font-semibold mt-1">Añadir foto</span>
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
  return <input ref={ref} type="file" name="imagenes" className="hidden" />
}
