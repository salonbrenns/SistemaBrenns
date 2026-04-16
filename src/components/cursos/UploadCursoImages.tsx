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
  | { type: 'new'; url: string; fileIndex: number }

export default function UploadCursoImages({ value, onChange }: Props) {
  const [slots, setSlots] = useState<Slot[]>(() =>
    (Array.isArray(value) ? value : [])
      .filter((u) => typeof u === 'string' && u.startsWith('http'))
      .slice(0, MAX)
      .map((url) => ({ type: 'existing' as const, url }))
  )

  const filesRef = useRef<(File | null)[]>([])
  const dragIndex = useRef<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)

  // Cleanup URLs temporales al desmontar
  useEffect(() => {
    const currentSlots = slots
    return () => {
      currentSlots.forEach((slot) => {
        if (slot.type === 'new') URL.revokeObjectURL(slot.url)
      })
    }
  }, [slots])

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
    onChange(slots.map(s => s.url)) // Actualizar orden en padre
  }

  const handleDragEnd = () => {
    dragIndex.current = null
    setDragOver(null)
  }

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return

    const freeSlots = MAX - slots.length
    const toAdd = files.slice(0, freeSlots)

    const newSlots: Slot[] = toAdd.map((file, idx) => {
      const fileIndex = filesRef.current.length
      filesRef.current.push(file)
      return {
        type: 'new' as const,
        url: URL.createObjectURL(file),
        fileIndex
      }
    })

    const updatedSlots = [...slots, ...newSlots]
    setSlots(updatedSlots)
    
    // Actualizar padre con las URLs
    onChange(updatedSlots.map(s => s.url))
    e.target.value = ''
  }, [slots, onChange])

  const removeSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const slot = prev[index]
      if (slot.type === 'new') {
        URL.revokeObjectURL(slot.url)
        filesRef.current[slot.fileIndex] = null
      }
      const newSlots = prev.filter((_, i) => i !== index)
      onChange(newSlots.map(s => s.url))
      return newSlots
    })
  }, [onChange])

  return (
    <div className="w-full space-y-4">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Imágenes del Curso <span className="font-normal normal-case text-gray-400">(máx. {MAX})</span>
        </p>
        {slots.length > 1 && (
          <p className="text-[10px] text-pink-500 flex items-center gap-1 mt-1">
            <GripVertical className="w-3 h-3" />
            Arrastra para reordenar • La primera imagen es la principal
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot, i) => (
          <div
            key={`slot-${i}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-2xl overflow-hidden border-2 bg-pink-50 shadow-sm group cursor-grab active:cursor-grabbing transition-all ${
              dragOver === i ? 'border-pink-600 scale-105 shadow-lg' : 'border-pink-200'
            }`}
          >
            <Image
              src={slot.url}
              alt={`Imagen ${i + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 180px"
            />

            {/* Indicador de imagen principal */}
            {i === 0 && (
              <span className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-pink-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                <Star className="w-3 h-3 fill-white" />
                Principal
              </span>
            )}

            {/* Número de imagen secundaria */}
            {i > 0 && (
              <span className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {i + 1}
              </span>
            )}

            {/* Botón eliminar */}
            <button
              type="button"
              onClick={() => removeSlot(i)}
              className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:text-pink-600"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icono de arrastrar */}
            <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-5 h-5 text-white drop-shadow" />
            </div>

            {/* Input oculto para mantener archivos */}
            {slot.type === 'new' && (
              <input
                type="hidden"
                name="imagenes"
                value={filesRef.current[slot.fileIndex]?.name || ''}
              />
            )}
          </div>
        ))}

        {/* Botón Añadir más */}
        {slots.length < MAX && (
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-2xl hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-all group">
            <Plus className="w-8 h-8 text-pink-300 group-hover:text-pink-500 transition-colors" />
            <span className="text-xs text-pink-400 font-semibold mt-2">Añadir foto</span>
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
        Puedes seleccionar varias fotos a la vez. La primera será la imagen principal.
      </p>
    </div>
  )
}
