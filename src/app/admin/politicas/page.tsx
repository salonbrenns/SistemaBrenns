// src/app/admin/politicas/page.tsx
"use client"

import { useState } from "react"
import { HelpCircle, FileText, Plus, ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react"

const FAQS_DEMO = [
  { pregunta: "¿Cómo puedo agendar una cita?", respuesta: "Puedes agendar una cita desde la sección de Servicios, seleccionando el servicio de tu preferencia y eligiendo fecha y hora disponible." },
  { pregunta: "¿Cuál es la política de cancelación?", respuesta: "Las cancelaciones deben realizarse con al menos 24 horas de anticipación. Cancelaciones con menos tiempo podrán generar un cargo." },
  { pregunta: "¿Aceptan tarjeta de crédito?", respuesta: "Sí, aceptamos pagos en efectivo, transferencia bancaria y tarjeta de crédito/débito." },
  { pregunta: "¿Tienen estacionamiento?", respuesta: "Contamos con estacionamiento disponible frente al local sin costo adicional." },
]

export default function PoliticasPage() {
  const [tab,      setTab]      = useState<"faq" | "politicas">("faq")
  const [abierto,  setAbierto]  = useState<number | null>(null)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-pink-500" /> FAQ y Políticas
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona las preguntas frecuentes y políticas del negocio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-pink-100">
        {[{ id: "faq", label: "❓ Preguntas frecuentes" }, { id: "politicas", label: "📄 Políticas y condiciones" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 text-sm font-semibold transition-all border-b-2 -mb-px ${
              tab === t.id ? "border-pink-600 text-pink-700" : "border-transparent text-gray-400 hover:text-pink-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "faq" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-pink-600 text-white font-bold px-4 py-2 rounded-full hover:bg-pink-700 transition text-sm">
              <Plus className="w-4 h-4" /> Nueva pregunta
            </button>
          </div>

          {FAQS_DEMO.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setAbierto(abierto === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-pink-50 transition">
                <span className="font-semibold text-gray-800 text-sm">{faq.pregunta}</span>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {abierto === i
                    ? <ChevronUp className="w-4 h-4 text-pink-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </button>
              {abierto === i && (
                <div className="px-5 pb-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
                  {faq.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "politicas" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-pink-600 text-white font-bold px-4 py-2 rounded-full hover:bg-pink-700 transition text-sm">
              <Plus className="w-4 h-4" /> Nueva política
            </button>
          </div>

          {[
            { titulo: "Política de privacidad",         icono: "🔒" },
            { titulo: "Términos y condiciones",         icono: "📋" },
            { titulo: "Política de devoluciones",       icono: "↩️" },
            { titulo: "Política de cancelaciones",      icono: "❌" },
          ].map(({ titulo, icono }) => (
            <div key={titulo} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{icono}</span>
                <div>
                  <p className="font-semibold text-gray-800">{titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Sin contenido — haz clic en editar para agregar</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 border border-pink-200 text-pink-600 rounded-xl hover:bg-pink-50 transition text-xs font-semibold">
                  <Edit className="w-3.5 h-3.5" /> Editar
                </button>
                <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
        ⚠️ Esta sección está en desarrollo. Los cambios aún no se guardan ni se muestran en el frontend.
      </p>
    </div>
  )
}