// src/components/ui/DetalleTabs.tsx
"use client"

import { useState } from "react"

interface DetalleTabsProps {
  descripcion: string
  beneficios: string
  incluye: string
}

export default function DetalleTabs({ descripcion, beneficios, incluye }: DetalleTabsProps) {
  const [activeTab, setActiveTab] = useState<"descripcion" | "beneficios" | "incluye">("descripcion")

  const formatList = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No hay información disponible.</p>
    return text.split('\n').map((line, i) => (
      <li key={i} className="flex gap-3 mb-2">
        • {line.trim()}
      </li>
    ))
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {[
          { id: "descripcion", label: "Descripción" },
          { id: "beneficios",  label: "Beneficios"  },
          { id: "incluye",     label: "Incluye"     },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "descripcion" | "beneficios" | "incluye")}
            className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-pink-600 text-pink-600 dark:text-pink-400 dark:border-pink-400"
                : "border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-base min-h-[140px]">
        {activeTab === "descripcion" && (
          <p className="whitespace-pre-line">
            {descripcion || <span className="italic text-gray-400">Sin descripción disponible.</span>}
          </p>
        )}

        {activeTab === "beneficios" && (
          <ul className="space-y-2.5">{formatList(beneficios)}</ul>
        )}

        {activeTab === "incluye" && (
          <ul className="space-y-2.5">{formatList(incluye)}</ul>
        )}
      </div>
    </div>
  )
}