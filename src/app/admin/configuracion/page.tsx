// src/app/admin/configuracion/page.tsx
"use client"

import { useState } from "react"
import { Settings, Upload, MapPin, Share2, Palette, Globe, Instagram, Facebook } from "lucide-react"

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<"general" | "ubicacion" | "redes" | "apariencia">("general")

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-pink-500" /> Configuración
        </h1>
        <p className="text-sm text-gray-500 mt-1">Personaliza la información y apariencia de tu negocio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-pink-50 rounded-2xl p-1">
        {[
          { id: "general",    label: "General",    icon: Globe     },
          { id: "ubicacion",  label: "Ubicación",  icon: MapPin    },
          { id: "redes",      label: "Redes",      icon: Share2    },
          { id: "apariencia", label: "Apariencia", icon: Palette   },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as typeof tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all ${
              tab === id ? "bg-white text-pink-700 shadow-sm" : "text-gray-500 hover:text-pink-600"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">

        {/* ── GENERAL ── */}
        {tab === "general" && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-800 mb-4">Información general</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo del negocio</label>
              <div className="border-2 border-dashed border-pink-200 rounded-2xl p-8 text-center hover:border-pink-400 transition cursor-pointer bg-pink-50/50">
                <Upload className="w-8 h-8 text-pink-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Arrastra o haz clic para subir logo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — máx 2MB</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del negocio</label>
              <input defaultValue="Brenn's" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slogan</label>
              <input defaultValue="Academia • Distribuidora • Salón" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono de contacto</label>
              <input placeholder="961 000 0000" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correo de contacto</label>
              <input placeholder="contacto@brenns.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
          </div>
        )}

        {/* ── UBICACIÓN ── */}
        {tab === "ubicacion" && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-800 mb-4">Ubicación del negocio</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dirección</label>
              <input placeholder="Ej. Calle Allende #123, Col. Centro" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ciudad</label>
                <input placeholder="Tuxtla Gutiérrez" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Estado</label>
                <input placeholder="Chiapas" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link de Google Maps</label>
              <input placeholder="https://maps.google.com/..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
            </div>
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Vista previa del mapa</p>
                <p className="text-xs mt-1">Agrega el link de Google Maps</p>
              </div>
            </div>
          </div>
        )}

        {/* ── REDES SOCIALES ── */}
        {tab === "redes" && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-800 mb-4">Redes sociales</h2>
            {[
              { label: "Instagram", placeholder: "@brenns_salon", icon: Instagram, color: "text-pink-500" },
              { label: "Facebook",  placeholder: "facebook.com/brenns", icon: Facebook, color: "text-blue-500" },
              { label: "WhatsApp",  placeholder: "961 000 0000", icon: Share2, color: "text-green-500" },
              { label: "TikTok",    placeholder: "@brenns", icon: Globe, color: "text-gray-700" },
            ].map(({ label, placeholder, icon: Icon, color }) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className={`absolute left-3 top-2.5 w-5 h-5 ${color}`} />
                  <input placeholder={placeholder} className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── APARIENCIA ── */}
        {tab === "apariencia" && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-800 mb-4">Apariencia de la página</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tema por época</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Predeterminado", color: "from-pink-400 to-rose-500" },
                  { label: "Navidad",         color: "from-red-500 to-green-600" },
                  { label: "San Valentín",    color: "from-pink-400 to-red-400"  },
                  { label: "Verano",          color: "from-yellow-400 to-orange-500" },
                ].map(({ label, color }) => (
                  <button key={label} className="p-3 rounded-xl border-2 border-gray-100 hover:border-pink-300 transition text-left">
                    <div className={`w-full h-8 rounded-lg bg-gradient-to-r ${color} mb-2`} />
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner principal</label>
              <div className="border-2 border-dashed border-pink-200 rounded-2xl p-6 text-center hover:border-pink-400 transition cursor-pointer bg-pink-50/50">
                <Upload className="w-6 h-6 text-pink-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Subir imagen de banner</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón guardar */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2 mb-4">
            ⚠️ Esta sección está en desarrollo. Los cambios aún no se guardan.
          </p>
          <button className="w-full bg-pink-600 text-white font-bold py-3 rounded-full hover:bg-pink-700 transition">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}