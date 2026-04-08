'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, Plus, Star, GripVertical } from 'lucide-react'

interface ImageUploadProps {
  initialImages?: string[]
}

const MAX = 4

type Slot =
  | { type: 'existing'; url: string }
  | { type: 'new'; url: string; fileIndex: number }

export default function ImageUpload({ initialImages = [] }: ImageUploadProps) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (Array.isArray(initialImages) ? initialImages : [])
      .filter((u) => typeof u === 'string' && u.startsWith('http'))
      .slice(0, MAX)
      .map((url) => ({ type: 'existing' as const, url }))
  )

  const filesRef = useRef<(File | null)[]>([])

  // índice del slot que se está arrastrando
  const dragIndex = useRef<number | null>(null)
  // slot sobre el que estamos hovereando
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
      return next
    })

    dragIndex.current = null
    setDragOver(null)
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOver(null)
  }


  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [slots.length]
  )

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
      <p className={labelClass}>
        Imágenes del Producto
        <span className="ml-1 font-normal normal-case text-gray-400">(máx. {MAX})</span>
      </p>

      {/* Hint de drag */}
      {slots.length > 1 && (
        <p className="text-[10px] text-rose-400 flex items-center gap-1">
          <GripVertical className="w-3 h-3" />
          Arrastra para cambiar el orden · la primera es la principal
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <div
            key={`slot-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}   // necesario para que onDrop funcione
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-rose-50 shadow-sm group cursor-grab active:cursor-grabbing transition-all duration-150 ${
              dragOver === i
                ? 'border-rose-500 scale-105 shadow-lg'
                : 'border-rose-100'
            }`}
          >
            <Image
              src={slot.url}
              alt={`Imagen ${i + 1}`}
              fill
              className="object-cover pointer-events-none"
              sizes="(max-width: 768px) 50vw, 200px"
            />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 z-10 flex items-center gap-0.5 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                <Star className="w-2.5 h-2.5 fill-white" />
                Principal
              </span>
            )}

            {i > 0 && (
              <span className="absolute top-1.5 left-1.5 z-10 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {i + 1}
              </span>
            )}

            <div className="absolute bottom-1.5 left-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-4 h-4 text-white drop-shadow" />
            </div>

            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="absolute top-1.5 right-1.5 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow hover:text-rose-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Inputs ocultos para FormData */}
            {slot.type === 'existing' ? (
              <input type="hidden" name="existing_images[]" value={slot.url} />
            ) : (
              <HiddenFileInput file={filesRef.current[slot.fileIndex]} />
            )}
          </div>
        ))}

        {/* Slot añadir */}
        {slots.length < MAX && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-400 cursor-pointer transition-colors group">
            <Plus className="w-7 h-7 text-rose-300 group-hover:text-rose-500 transition-colors" />
            <span className="text-[11px] text-rose-400 font-semibold mt-1">Añadir foto</span>
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
        Puedes seleccionar varias fotos a la vez.
      </p>
    </div>
  )
}

function HiddenFileInput({ file }: { file: File | null }) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!ref.current || !file) return
    try {
      const dt = new DataTransfer()
      dt.items.add(file)
      ref.current.files = dt.files
    } catch {
      console.warn('DataTransfer no soportado')
    }
  }, [file])

  if (!file) return null

  return (
    <input
      ref={ref}
      type="file"
      name="imagenes"
      accept="image/*"
      className="hidden"
      onChange={() => {}}
    />
  )
}

const labelClass = 'text-xs font-bold text-gray-500 uppercase tracking-widest block'