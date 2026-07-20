"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface Props {
  children: React.ReactNode
  label?: string
}

export default function DropdownAcciones({ children, label = "Acciones" }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-pink-300 dark:hover:border-pink-700 hover:bg-pink-50 dark:hover:bg-pink-950/20 transition"
      >
        {label} <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-30 min-w-[190px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
          <div className="p-1.5 space-y-0.5" onClick={() => setOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Item de acción ── */
export function DropdownItem({
  onClick,
  icon,
  label,
  danger = false,
  disabled = false,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition disabled:opacity-50
        ${danger
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          : "text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:text-pink-700 dark:hover:text-pink-400"
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

/* ── Separador ── */
export function DropdownSeparator() {
  return <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
}
