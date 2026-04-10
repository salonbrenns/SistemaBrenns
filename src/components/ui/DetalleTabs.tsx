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
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: "descripcion", label: "Descripción" },
          { id: "beneficios", label: "Beneficios" },
          { id: "incluye", label: "Incluye" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "descripcion" | "beneficios" | "incluye")}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-pink-600 text-pink-600" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="text-gray-700 leading-relaxed text-[17px] min-h-[200px]">
        {activeTab === "descripcion" && (
          <p>{descripcion || "No hay descripción disponible para este servicio."}</p>
        )}

        {activeTab === "beneficios" && (
          <ul className="space-y-3">{formatList(beneficios)}</ul>
        )}

        {activeTab === "incluye" && (
          <ul className="space-y-3">{formatList(incluye)}</ul>
        )}
      </div>
    </div>
  )
}