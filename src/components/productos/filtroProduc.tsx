'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef, useState, useEffect } from 'react'
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid'

type Option = {
  id: number
  nombre: string
}

type Props = {
  categorias: Option[]
  marcas: Option[]
}

function FilterDropdown({
  label,
  paramKey,
  options,
  activeId,
  onSelect,
}: {
  label: string
  paramKey: string
  options: Option[]
  activeId: string
  onSelect: (key: string, value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeLabel = options.find((o) => String(o.id) === activeId)?.nombre

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer
          ${
            activeId
              ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
          }`}
      >
        <span>{activeLabel ? `${label}: ${activeLabel}` : label}</span>
        {activeId ? (
          <span
            role="button"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(paramKey, '')
              setOpen(false)
            }}
            className="ml-1 rounded-full hover:bg-pink-500 p-0.5 transition-colors"
          >
            <XMarkIcon className="h-3.5 w-3.5" />
          </span>
        ) : (
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-52 rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
          <div className="py-1">
            {/* Opción "Todos" */}
            <button
              onClick={() => {
                onSelect(paramKey, '')
                setOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
                ${!activeId ? 'bg-pink-50 text-pink-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <span
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0
                  ${!activeId ? 'border-pink-600' : 'border-gray-300'}`}
              >
                {!activeId && <span className="h-2 w-2 rounded-full bg-pink-600" />}
              </span>
              Todos
            </button>

            <div className="my-1 border-t border-gray-100" />

            {/* Opciones */}
            {options.map((opt) => {
              const isActive = activeId === String(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelect(paramKey, String(opt.id))
                    setOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer
                    ${isActive ? 'bg-pink-50 text-pink-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0
                      ${isActive ? 'border-pink-600' : 'border-gray-300'}`}
                  >
                    {isActive && <span className="h-2 w-2 rounded-full bg-pink-600" />}
                  </span>
                  {opt.nombre}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductoFilters({ categorias, marcas }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const categoriaActiva = searchParams.get('categoria') || ''
  const marcaActiva = searchParams.get('marca') || ''

  const handleSelect = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, pathname, router]
  )

  const hasFilters = categoriaActiva || marcaActiva

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <FilterDropdown
        label="Categoría"
        paramKey="categoria"
        options={categorias}
        activeId={categoriaActiva}
        onSelect={handleSelect}
      />
      <FilterDropdown
        label="Marca"
        paramKey="marca"
        options={marcas}
        activeId={marcaActiva}
        onSelect={handleSelect}
      />
      {hasFilters && (
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            params.delete('categoria')
            params.delete('marca')
            params.delete('page')
            router.push(`${pathname}?${params.toString()}`)
          }}
          className="text-sm text-gray-400 hover:text-pink-600 transition-colors cursor-pointer underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}