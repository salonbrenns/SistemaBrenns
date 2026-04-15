"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Settings, Save, Loader2, Globe, MapPin, Share2,
  ImageIcon, Users, Upload, Image as ImageIcon2,
} from "lucide-react"
import { SiteConfig, DEFAULTS } from "@/hooks/useSiteConfig"
import Image from 'next/image'

// ── Tipos ──────────────────────────────────────────────────────────────────
type HeroSlide = {
  imagen:       string
  etiqueta:     string
  titulo:       string
  tituloAcento: string
  descripcion:  string
  ctaLabel:     string
  ctaHref:      string
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    imagen:       "/hero/salon.jpg",
    etiqueta:     "Salón de Belleza",
    titulo:       "Tu Belleza,",
    tituloAcento: "Nuestra Pasión",
    descripcion:  "Uñas, cabello, manicura y pedicura.",
    ctaLabel:     "Agendar cita",
    ctaHref:      "/servicios",
  },
  {
    imagen:       "/hero/academia.jpg",
    etiqueta:     "Academia Brenn's",
    titulo:       "Aprende el Arte",
    tituloAcento: "de las Uñas",
    descripcion:  "Cursos para todos los niveles.",
    ctaLabel:     "Ver cursos",
    ctaHref:      "/cursos",
  },
  {
    imagen:       "/hero/distribuidora.jpg",
    etiqueta:     "Distribuidora",
    titulo:       "Insumos",
    tituloAcento: "Profesionales",
    descripcion:  "Las mejores marcas del mercado.",
    ctaLabel:     "Ir a la tienda",
    ctaHref:      "/catalogo",
  },
]

// ── Componentes base ────────────────────────────────────────────────────────
const Input = ({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
      {label}
    </label>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 transition-all bg-white"
    />
  </div>
)

const Textarea = ({
  label, value, onChange, placeholder, rows = 3, hint,
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number; hint?: string
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-100 resize-none transition-all bg-white"
    />
    {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
  </div>
)

const Card = ({
  icon: Icon, title, children, className = "",
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; className?: string
}) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 ${className}`}>
    <h2 className="font-bold text-gray-700 flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] border-b border-gray-50 pb-3">
      <Icon className="w-3.5 h-3.5 text-pink-400" /> {title}
    </h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

// ── Logo Uploader (Optimizado) ────────────────────────────────────────────────
const LogoUploader = ({ 
  currentLogo, 
  onUpload 
}: { 
  currentLogo: string; 
  onUpload: (url: string) => void 
}) => {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "Brenns-Home/branding")

    try {
      const res = await fetch("/api/admin/upload-hero", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) onUpload(data.url)
    } catch {
      console.error("Error subiendo logo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
      <div className="relative w-14 h-14 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
        {currentLogo ? (
          <Image src={currentLogo} alt="Logo" className="w-full h-full object-contain p-1" fill />
        ) : (
          <ImageIcon2 className="w-5 h-5 text-gray-300" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-pink-500 animate-spin" />
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <label className="cursor-pointer bg-white border border-gray-200 hover:border-pink-300 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 transition-all shadow-sm flex items-center gap-2 w-fit">
          <Upload className="w-3 h-3 text-pink-500" />
          {uploading ? "Subiendo..." : "Subir Logo"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        <p className="text-[9px] text-gray-400 leading-none">PNG recomendado</p>
      </div>
    </div>
  )
}

// ── Slide editor ─────────────────────────────────────────────────────────────
const SlideEditor = ({
  slide, index, onChange,
}: {
  slide: HeroSlide; index: number; onChange: (i: number, s: HeroSlide) => void
}) => {
  const set = (key: keyof HeroSlide) => (v: string) =>
    onChange(index, { ...slide, [key]: v })

  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "Brenns-Home/hero")

    try {
      const res  = await fetch("/api/admin/upload-hero", { method: "POST", body: fd })
      const data = await res.json()
      if (data.url) set("imagen")(data.url)
    } catch {}
    finally { setUploading(false) }
  }

  const LABELS = ["Salón de Belleza", "Academia Brenn's", "Distribuidora"]

  return (
    <div className="border border-gray-100 rounded-2xl p-4 space-y-3 bg-gray-50/50">
      <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
        Slide {index + 1} — {LABELS[index] ?? slide.etiqueta}
      </p>

      <div className="relative h-32 rounded-xl overflow-hidden bg-gray-200 group shadow-inner">
        {slide.imagen ? (
          <Image src={slide.imagen} alt="" className="w-full h-full object-cover" fill />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon2 className="w-8 h-8" />
          </div>
        )}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer gap-2">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white text-xs font-bold">Cambiar imagen</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>

      <Input label="Ruta imagen" value={slide.imagen} onChange={set("imagen")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Etiqueta" value={slide.etiqueta} onChange={set("etiqueta")} />
        <Input label="Título acento" value={slide.tituloAcento} onChange={set("tituloAcento")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Título" value={slide.titulo} onChange={set("titulo")} />
        <Input label="CTA Botón" value={slide.ctaLabel} onChange={set("ctaLabel")} />
      </div>
      <Input label="CTA Enlace" value={slide.ctaHref} onChange={set("ctaHref")} />
      <Textarea label="Descripción" value={slide.descripcion} onChange={set("descripcion")} rows={2} />
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
  const [form, setForm]           = useState<SiteConfig>(DEFAULTS)
  const [slides, setSlides]       = useState<HeroSlide[]>(DEFAULT_SLIDES)
  const [tab, setTab]             = useState<"general" | "hero" | "nosotros">("general")
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito]         = useState(false)
  const [error, setError]         = useState("")

  const cargar = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/config-sitio")
      const data = await res.json()
      if (data && typeof data === "object") {
        setForm(prev => ({ ...prev, ...data }))
        let heroSlides = data.hero_slides
        if (typeof heroSlides === "string") {
          try { heroSlides = JSON.parse(heroSlides) } catch {}
        }
        if (Array.isArray(heroSlides) && heroSlides.length > 0) {
          setSlides(heroSlides)
        }
      }
    } catch {}
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const set = (key: keyof SiteConfig) => (v: string) =>
    setForm(prev => ({ ...prev, [key]: v }))

  const updateSlide = (i: number, s: HeroSlide) =>
    setSlides(prev => prev.map((x, idx) => idx === i ? s : x))

  const handleGuardar = async () => {
    setError(""); setExito(false); setGuardando(true)
    try {
      const res = await fetch("/api/admin/config-sitio", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, hero_slides: slides }),
      })
      if (!res.ok) { setError("Error al guardar"); return }
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      setError("Error de conexión")
    } finally {
      setGuardando(false)
    }
  }

  const tabs = [
    { id: "general",  label: "General",  icon: Globe     },
    { id: "hero",     label: "Hero",     icon: ImageIcon },
    { id: "nosotros", label: "Nosotros", icon: Users      },
  ] as const

  return (
    <div className="max-w-6xl space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-pink-900 flex items-center gap-2 tracking-tight">
            <Settings className="w-6 h-6 text-pink-500" /> Configuración
          </h1>
          <p className="text-xs text-gray-400 font-medium">Gestiona la identidad y contenido global del sitio</p>
        </div>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="flex items-center gap-2 bg-pink-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-pink-700 transition disabled:opacity-60 shadow-lg shadow-pink-200 text-sm"
        >
          {guardando
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            : <><Save className="w-4 h-4" /> Guardar cambios</>
          }
        </button>
      </div>

      {/* Alertas */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2">
        {error && (
          <div className="bg-white border-l-4 border-red-500 text-red-600 text-sm px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}
        {exito && (
          <div className="bg-white border-l-4 border-green-500 text-green-600 text-sm px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            ✅ Cambios guardados correctamente
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit border border-gray-200/50">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-white text-pink-600 shadow-sm ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB: GENERAL ── */}
      {tab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card icon={Globe} title="Identidad del Negocio">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Nombre comercial" value={form.nombre} onChange={set("nombre")} />
              <Input label="Eslogan corto" value={form.eslogan} onChange={set("eslogan")} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
              <div className="md:col-span-2">
                <LogoUploader currentLogo={form.logo_src} onUpload={set("logo_src")} />
              </div>
              <div className="md:col-span-3">
                <Input label="URL del logo" value={form.logo_src} onChange={set("logo_src")} />
              </div>
            </div>
            
            <Textarea label="Descripción principal (Footer)" value={form.descripcion} onChange={set("descripcion")} rows={3} />
          </Card>

          <div className="space-y-6">
            <Card icon={MapPin} title="Ubicación y Horarios">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Calle y número" value={form.ubicacion_calle} onChange={set("ubicacion_calle")} />
                <Input label="Ciudad y estado" value={form.ubicacion_ciudad} onChange={set("ubicacion_ciudad")} />
              </div>
              <Input label="Referencias" value={form.ubicacion_detalle} onChange={set("ubicacion_detalle")} />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Horario Semana" value={form.horario_semana} onChange={set("horario_semana")} />
                <Input label="Horario Sábado" value={form.horario_sabado} onChange={set("horario_sabado")} />
              </div>
              
              <Textarea
                label="Google Maps (src)"
                value={form.mapa_url}
                onChange={set("mapa_url")}
                rows={2}
                hint="Copia solo el link dentro de src='...'"
              />
            </Card>

            <Card icon={Share2} title="Redes Sociales">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Facebook" value={form.red_facebook} onChange={set("red_facebook")} />
                <Input label="Instagram" value={form.red_instagram} onChange={set("red_instagram")} />
                <Input label="WhatsApp" value={form.red_whatsapp} onChange={set("red_whatsapp")} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: HERO ── */}
      {tab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {slides.map((slide, i) => (
            <SlideEditor key={i} slide={slide} index={i} onChange={updateSlide} />
          ))}
        </div>
      )}

      {/* ── TAB: NOSOTROS ── */}
      {tab === "nosotros" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card icon={Users} title="Sobre Nosotros">
            <Input label="Título" value={form.nosotros_titulo} onChange={set("nosotros_titulo")} />
            <Textarea label="Descripción" value={form.nosotros_descripcion} onChange={set("nosotros_descripcion")} rows={4} />
            <Textarea 
              label="Valores (separados por coma)" 
              value={form.nosotros_valores} 
              onChange={set("nosotros_valores")} 
              rows={2}
              hint="Ej: Pasión, Calidad, Integridad"
            />
          </Card>

          <Card icon={Users} title="Misión y Visión">
            <Textarea label="Misión" value={form.nosotros_mision} onChange={set("nosotros_mision")} rows={5} />
            <Textarea label="Visión" value={form.nosotros_vision} onChange={set("nosotros_vision")} rows={5} />
          </Card>
        </div>
      )}

    </div>
  )
}