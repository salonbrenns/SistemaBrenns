// src/app/admin/configuracion/page.tsx
"use client";

import { useState } from "react";
import { Settings, Upload, Save, Plus, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useSiteConfigStore } from "@/store/siteConfigStore";

type Tab = "general" | "hero" | "contenido" | "ubicacion" | "redes" | "empleados" | "apariencia";

export default function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>("general");

  // Estado para nuevo empleado
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    puesto: "",
    descripcion: "",
    imagen: ""
  });

  const store = useSiteConfigStore();

  const handleAddEmpleado = () => {
    if (!nuevoEmpleado.nombre || !nuevoEmpleado.puesto) {
      alert("Nombre y puesto son obligatorios");
      return;
    }

    store.addEmpleado(
      nuevoEmpleado.nombre,
      nuevoEmpleado.puesto,
      nuevoEmpleado.descripcion || "",
      nuevoEmpleado.imagen || ""
    );

    setNuevoEmpleado({ nombre: "", puesto: "", descripcion: "", imagen: "" });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-pink-900 flex items-center gap-3">
          <Settings className="w-9 h-9 text-pink-600" />
          Configuración del Sitio
        </h1>
        <p className="text-gray-500 mt-1">Personaliza toda la información de Brenn&apos;s</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-pink-50 p-2 rounded-3xl">
        {[
          { id: "general", label: "General" },
          { id: "hero", label: "Hero Principal" },
          { id: "contenido", label: "Misión y Visión" },
          { id: "ubicacion", label: "Ubicación" },
          { id: "redes", label: "Redes Sociales" },
          { id: "empleados", label: "Equipo" },
          { id: "apariencia", label: "Apariencia" },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              tab === id ? "bg-white shadow-md text-pink-700" : "text-gray-600 hover:bg-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-pink-100 p-8">

        {/* ====================== GENERAL ====================== */}
        {tab === "general" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Nombre del Negocio</label>
                <input value={store.nombre} onChange={(e) => store.setNombre(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Slogan</label>
                <input value={store.slogan} onChange={(e) => store.setSlogan(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2">Teléfono de Contacto</label>
              <input value={store.telefono} onChange={(e) => store.setTelefono(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Correo Electrónico</label>
              <input value={store.email} onChange={(e) => store.setEmail(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
            </div>
          </div>
        )}

        {/* ====================== HERO ====================== */}
        {tab === "hero" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Hero Principal (Página de Inicio)</h2>

            <div>
              <label className="block font-semibold mb-2">Título del Hero</label>
              <input value={store.heroTitle} onChange={(e) => store.setHeroTitle(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3 text-lg" />
            </div>

            <div>
              <label className="block font-semibold mb-2">Subtítulo</label>
              <textarea value={store.heroSubtitle} onChange={(e) => store.setHeroSubtitle(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-2xl px-5 py-4" />
            </div>

            <div>
              <label className="block font-semibold mb-3">Imágenes del Hero (Carrusel)</label>
              <CldUploadWidget 
                uploadPreset="brenns_hero"
                onSuccess={(result: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                  if (result?.info?.secure_url) {
                    store.addHeroImage(result.info.secure_url);
                  }
                }}
              >
                {({ open }) => (
                  <button onClick={() => open()} className="w-full border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-3xl py-14 flex flex-col items-center gap-3 transition">
                    <Upload className="w-10 h-10 text-pink-400" />
                    <p className="font-medium">Subir nueva imagen para el carrusel</p>
                  </button>
                )}
              </CldUploadWidget>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {store.heroImages.map((url, i) => (
                <div key={i} className="relative rounded-2xl overflow-hidden border border-gray-100">
                  <img src={url} alt={`Hero ${i}`} className="w-full h-40 object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================== CONTENIDO ====================== */}
        {tab === "contenido" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Misión y Visión</h2>
            <div>
              <label className="block font-semibold mb-2">Misión</label>
              <textarea value={store.mision} onChange={(e) => store.setMision(e.target.value)} rows={6} className="w-full border border-gray-200 rounded-2xl px-5 py-4" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Visión</label>
              <textarea value={store.vision} onChange={(e) => store.setVision(e.target.value)} rows={6} className="w-full border border-gray-200 rounded-2xl px-5 py-4" />
            </div>
          </div>
        )}

        {/* ====================== UBICACIÓN ====================== */}
        {tab === "ubicacion" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Ubicación y Horarios</h2>
            <div>
              <label className="block font-semibold mb-2">Dirección</label>
              <input value={store.direccion} onChange={(e) => store.setDireccion(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Ciudad</label>
                <input value={store.ciudad} onChange={(e) => store.setCiudad(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Estado</label>
                <input value={store.estado} onChange={(e) => store.setEstado(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-2">Link de Google Maps</label>
              <input value={store.googleMapsLink} onChange={(e) => store.setGoogleMapsLink(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
            </div>
            <div>
              <label className="block font-semibold mb-2">Horarios de Atención</label>
              <input value={store.horarios} onChange={(e) => store.setHorarios(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
            </div>
          </div>
        )}

        {/* ====================== REDES ====================== */}
        {tab === "redes" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Redes Sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Instagram</label>
                <input value={store.redes.instagram} onChange={(e) => store.setRedes({ instagram: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Facebook</label>
                <input value={store.redes.facebook} onChange={(e) => store.setRedes({ facebook: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block font-semibold mb-2">WhatsApp</label>
                <input value={store.redes.whatsapp} onChange={(e) => store.setRedes({ whatsapp: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
              <div>
                <label className="block font-semibold mb-2">TikTok</label>
                <input value={store.redes.tiktok} onChange={(e) => store.setRedes({ tiktok: e.target.value })} className="w-full border border-gray-200 rounded-2xl px-5 py-3" />
              </div>
            </div>
          </div>
        )}

        {/* ====================== EMPLEADOS ====================== */}
        {tab === "empleados" && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Equipo de Trabajo</h2>
              <p className="text-sm text-gray-500">Aparecerá en páginas Nosotros&quot;  y Contacto&quot;</p>
            </div>

            {/* Formulario para agregar empleado */}
            <div className="bg-pink-50 border border-pink-100 p-6 rounded-2xl space-y-4">
              <h3 className="font-semibold text-lg">Agregar nuevo miembro</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Nombre completo"
                  value={nuevoEmpleado.nombre}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3"
                />
                <input
                  placeholder="Puesto (ej: Manicurista Senior)"
                  value={nuevoEmpleado.puesto}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, puesto: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-3"
                />
              </div>

              <textarea
                placeholder="Mini descripción o especialidad (opcional)"
                value={nuevoEmpleado.descripcion}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, descripcion: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 h-24"
              />

              <CldUploadWidget 
                uploadPreset="brenns_hero"
                onSuccess={(result: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
                  if (result?.info?.secure_url) {
                    setNuevoEmpleado({ ...nuevoEmpleado, imagen: result.info.secure_url });
                  }
                }}
              >
                {({ open }) => (
                  <button 
                    onClick={() => open()} 
                    className="w-full border-2 border-dashed border-pink-300 hover:border-pink-500 rounded-xl py-6 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    {nuevoEmpleado.imagen ? "✅ Imagen subida" : "Subir foto del empleado"}
                  </button>
                )}
              </CldUploadWidget>

              <button
                onClick={handleAddEmpleado}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3.5 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Agregar al equipo
              </button>
            </div>

            {/* Lista de empleados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {store.empleados.map((emp, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-6">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{emp.nombre}</h3>
                      <p className="text-pink-600">{emp.puesto}</p>
                    </div>
                    <button onClick={() => store.removeEmpleado(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  {emp.descripcion && <p className="mt-3 text-sm text-gray-600">{emp.descripcion}</p>}
                  {emp.imagen && (
                    <img src={emp.imagen} alt={emp.nombre} className="mt-4 w-full h-40 object-cover rounded-xl" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================== APARIENCIA ====================== */}
        {tab === "apariencia" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold">Apariencia del Sitio</h2>

            <div>
              <label className="block font-semibold mb-3">Color Principal</label>
              <input 
                type="color" 
                value={store.primaryColor} 
                onChange={(e) => store.setPrimaryColor(e.target.value)} 
                className="w-24 h-12 rounded-xl cursor-pointer" 
              />
            </div>

            <div>
              <label className="block font-semibold mb-4">Temas por Temporada</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Predeterminado", color: "#FF5BA8" },
                  { name: "Navidad", color: "#D32F2F" },
                  { name: "San Valentín", color: "#E91E63" },
                  { name: "Verano", color: "#FF9800" },
                ].map((t) => (
                  <button
                    key={t.name}
                    onClick={() => store.setPrimaryColor(t.color)}
                    className={`p-4 rounded-2xl border-2 transition-all ${store.primaryColor === t.color ? "border-pink-600 shadow" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <div className="h-10 rounded-xl mb-2" style={{ backgroundColor: t.color }} />
                    <p className="text-sm font-medium">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Botón Guardar */}
        <div className="mt-12 pt-8 border-t flex justify-end">
          <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-12 py-4 rounded-2xl flex items-center gap-3 text-lg">
            <Save className="w-6 h-6" />
            Guardar todos los cambios
          </button>
        </div>
      </div>
    </div>
  );
}