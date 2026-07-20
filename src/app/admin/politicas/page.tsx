// src/app/admin/politicas/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText, ShieldCheck, ScrollText, HelpCircle,
  Save, Loader2, CheckCircle, AlertCircle, ExternalLink,
} from "lucide-react"
import {
  TERMINOS_SECCIONES,
  PRIVACIDAD_SECCIONES,
  POLITICAS_SECCIONES,
} from "@/lib/politicas-defaults"

type Config = Record<string, string>

const TABS = [
  { id: "terminos",   label: "Términos y Condiciones", icon: ScrollText,  secciones: TERMINOS_SECCIONES,   versionKey: "legal_terminos_version",   fechaKey: "legal_terminos_fecha",   ruta: "/terminos" },
  { id: "privacidad", label: "Aviso de Privacidad",    icon: ShieldCheck, secciones: PRIVACIDAD_SECCIONES, versionKey: "legal_privacidad_version", fechaKey: "legal_privacidad_fecha",  ruta: "/aviso-privacidad" },
  { id: "politicas",  label: "Políticas Generales",    icon: FileText,    secciones: POLITICAS_SECCIONES,  versionKey: "legal_politicas_version",  fechaKey: "legal_politicas_fecha",  ruta: "/politicas" },
]

export default function PoliticasPage() {
  const [tab, setTab]             = useState("terminos")
  const [config, setConfig]       = useState<Config>({})
  const [editado, setEditado]     = useState<Config>({})
  const [cargando, setCargando]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito]         = useState(false)
  const [error, setError]         = useState("")

  useEffect(() => {
    fetch("/api/config-sitio")
      .then(r => r.json())
      .then(data => { setConfig(data); setEditado(data); setCargando(false) })
      .catch(() => setCargando(false))
  }, [])

  function onChange(clave: string, valor: string) {
    setEditado(prev => ({ ...prev, [clave]: valor }))
  }

  async function guardarTab() {
    const docTab = TABS.find(t => t.id === tab)!
    setGuardando(true)
    setError("")
    setExito(false)

    const claves: { clave: string; valor: string }[] = [
      { clave: docTab.versionKey, valor: editado[docTab.versionKey] || "1.0" },
      { clave: docTab.fechaKey,   valor: editado[docTab.fechaKey]   || "" },
      ...docTab.secciones.map(s => ({
        clave: s.clave,
        valor: editado[s.clave] ?? s.default,
      })),
    ]

    try {
      const res = await fetch("/api/config-sitio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claves),
      })
      if (!res.ok) throw new Error()
      const nuevaConfig = { ...config }
      claves.forEach(({ clave, valor }) => { nuevaConfig[clave] = valor })
      setConfig(nuevaConfig)
      setExito(true)
      setTimeout(() => setExito(false), 3000)
    } catch {
      setError("Error al guardar. Verifica que estés logueado como ADMIN.")
    } finally {
      setGuardando(false)
    }
  }

  const docTab = TABS.find(t => t.id === tab)!

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300 flex items-center gap-2">
            <FileText className="w-6 h-6 text-pink-500" /> Documentos Legales
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edita el contenido de cada documento. Los cambios se muestran en las páginas públicas de inmediato.
          </p>
        </div>
        <Link
          href={docTab.ruta}
          target="_blank"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-pink-600 transition-colors mt-1"
        >
          Ver página <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-pink-100 dark:border-gray-700">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                tab === t.id
                  ? "border-pink-600 text-pink-700"
                  : "border-transparent text-gray-400 hover:text-pink-600"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin" /> Cargando contenido...
        </div>
      ) : (
        <div className="space-y-5">

          {/* Versión y fecha */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 p-5">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Metadatos del documento</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Versión <span className="text-gray-400 font-normal">(ej: 1.2)</span>
                </label>
                <input
                  type="text"
                  value={editado[docTab.versionKey] ?? "1.0"}
                  onChange={e => onChange(docTab.versionKey, e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                  Fecha de actualización
                </label>
                <input
                  type="text"
                  value={editado[docTab.fechaKey] ?? ""}
                  onChange={e => onChange(docTab.fechaKey, e.target.value)}
                  placeholder="19 de junio de 2026"
                  className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>
          </div>

          {/* Secciones */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Contenido de secciones</p>

            {docTab.secciones.map((s, i) => (
              <div key={s.clave} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-pink-50 dark:bg-pink-950/20 border-b border-pink-100 dark:border-pink-900/40 flex items-center gap-2">
                  <span className="text-xs font-bold text-pink-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{s.titulo}</span>
                </div>
                <div className="p-4">
                  <textarea
                    rows={4}
                    value={editado[s.clave] ?? s.default}
                    onChange={e => onChange(s.clave, e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 resize-y leading-relaxed"
                    placeholder={s.default}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    {tab === "politicas"
                      ? "Escribe cada punto en una línea separada — se mostrarán como viñetas."
                      : "Puedes usar saltos de línea para separar párrafos."}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            {exito ? (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
                <CheckCircle className="w-4 h-4" /> Cambios guardados. La página pública ya se actualizó.
              </div>
            ) : <div />}

            <button
              onClick={guardarTab}
              disabled={guardando}
              className="flex items-center gap-2 bg-pink-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink-700 transition disabled:opacity-50 text-sm"
            >
              {guardando
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                : <><Save className="w-4 h-4" /> Guardar {docTab.label}</>
              }
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 dark:text-white">Preguntas Frecuentes (FAQ)</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Las FAQs tienen su propio módulo con agregar, editar y eliminar.</p>
        </div>
        <Link
          href="/admin/faq"
          className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Ir a FAQ <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  )
}
