// src/app/(frontend)/mis-citas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays, ChevronDown, ChevronUp, Clock, User,
  XCircle, Loader2, Upload, CheckCircle, ImageIcon, ExternalLink,
} from 'lucide-react'
import DotsLoader from '@/components/ui/DotsLoader'
import AuthGuard from '@/components/ui/AuthGuard'

interface Servicio {
  nombre: string
  imagen: string | null
  precio: number
  duracion: string
}

interface Cita {
  id: number
  fecha: string
  hora: string
  estado: string
  notas: string | null
  nombre_contacto: string | null
  metodo_pago: string | null
  comprobante: string | null
  servicio: Servicio
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-amber-100  text-amber-700',
  CONFIRMADA: 'bg-green-100  text-green-700',
  CANCELADA:  'bg-red-100    text-red-600',
  COMPLETADA: 'bg-blue-100   text-blue-700',
}

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  'Pendiente',
  CONFIRMADA: 'Confirmada',
  CANCELADA:  'Cancelada',
  COMPLETADA: 'Completada',
}

export default function MisCitasPage() {
  return <AuthGuard><MisCitasContenido /></AuthGuard>
}

function puedeCancelar(fecha: string, estado: string) {
  if (estado === 'CANCELADA' || estado === 'COMPLETADA') return false
  const horasRestantes = (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60)
  return horasRestantes > 24
}

function MisCitasContenido() {
  const [citas,      setCitas]      = useState<Cita[]>([])
  const [cargando,   setCargando]   = useState(true)
  const [abierto,    setAbierto]    = useState<number | null>(null)
  const [cancelando, setCancelando] = useState<number | null>(null)
  const [error,      setError]      = useState<string | null>(null)

  // Estados para subir comprobante
  const [subiendoComp,     setSubiendoComp]     = useState<number | null>(null)
  const [compExito,        setCompExito]        = useState<Set<number>>(new Set())
  const [errorComp,        setErrorComp]        = useState<Record<number, string>>({})
  const [modalCancelar,    setModalCancelar]    = useState<number | null>(null)  // id de cita a cancelar

  const cargarCitas = () => {
    fetch('/api/citas')
      .then(r => r.json())
      .then(data => setCitas(Array.isArray(data) ? data : Array.isArray(data.citas) ? data.citas : []))
      .finally(() => setCargando(false))
  }

  const cancelarCita = async (id: number) => {
    setCancelando(id)
    setError(null)
    try {
      const res = await fetch('/api/citas', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: 'CANCELADA' } : c))
      setAbierto(null)
    } catch {
      setError('Error al cancelar. Intenta de nuevo.')
    } finally {
      setCancelando(null)
    }
  }

  const handleSubirComprobante = async (citaId: number, file: File) => {
    setErrorComp(prev => ({ ...prev, [citaId]: '' }))
    setSubiendoComp(citaId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/citas/${citaId}/comprobante`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setErrorComp(prev => ({ ...prev, [citaId]: data.error || 'Error al subir comprobante' }))
        return
      }
      // Actualizar la cita localmente
      setCitas(prev => prev.map(c =>
        c.id === citaId ? { ...c, comprobante: data.url, estado: 'CONFIRMADA' } : c
      ))
      setCompExito(prev => new Set([...prev, citaId]))
    } catch {
      setErrorComp(prev => ({ ...prev, [citaId]: 'Error de conexión. Intenta de nuevo.' }))
    } finally {
      setSubiendoComp(null)
    }
  }

  useEffect(() => { cargarCitas() }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 flex items-center justify-center">
        <DotsLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffafa] dark:bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">

        <div className="flex items-center gap-3 mb-10">
          <CalendarDays className="w-8 h-8 text-pink-600" />
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Mis Citas
            <span className="ml-2 text-lg font-semibold text-gray-400">({citas.length})</span>
          </h1>
        </div>

        {citas.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] shadow-inner border-2 border-dashed border-pink-100">
            <CalendarDays className="w-20 h-20 text-pink-200 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-6">Aún no tienes citas</p>
            <Link href="/servicios">
              <button className="px-8 py-3 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition shadow-xl">
                Ver servicios
              </button>
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {citas.map(cita => (
            <div key={cita.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-pink-50 shadow-sm overflow-hidden">

              {/* Cabecera */}
              <button
                onClick={() => setAbierto(abierto === cita.id ? null : cita.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Imagen del servicio */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-pink-50 dark:bg-gray-700 border border-pink-100 dark:border-gray-600 flex-shrink-0">
                    {cita.servicio.imagen
                      ? <Image src={cita.servicio.imagen} alt={cita.servicio.nombre} fill sizes="48px" className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-pink-300" />
                        </div>
                    }
                  </div>

                  <div>
                    <p className="font-black text-gray-900 dark:text-white">{cita.servicio.nombre}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(cita.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'long', year: 'numeric'
                      })} · {cita.hora}
                    </p>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ESTADO_STYLE[cita.estado] ?? 'bg-gray-100 text-gray-600 dark:text-gray-400'}`}>
                    {ESTADO_LABEL[cita.estado] ?? cita.estado}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-gray-900 dark:text-white text-lg">
                    ${cita.servicio.precio.toLocaleString('es-MX')}
                    <span className="text-xs font-normal text-gray-400 ml-1">MXN</span>
                  </span>
                  {abierto === cita.id
                    ? <ChevronUp  className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </div>
              </button>

              {/* Detalle expandible */}
              {abierto === cita.id && (
                <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-2 gap-3 text-sm">

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 text-pink-400" />
                      <span>Duración: <strong>{cita.servicio.duracion}</strong></span>
                    </div>

                    {cita.nombre_contacto && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <User className="w-4 h-4 text-pink-400" />
                        <span>Contacto: <strong>{cita.nombre_contacto}</strong></span>
                      </div>
                    )}
                  </div>

                  {cita.notas && (
                    <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-pink-100 text-sm text-gray-600 dark:text-gray-400">
                      <p className="font-semibold text-pink-500 mb-1">Notas</p>
                      <p>{cita.notas}</p>
                    </div>
                  )}

                  {/* ── Sección comprobante de pago ─────────────────────── */}
                  {cita.metodo_pago === 'TRANSFERENCIA' && cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && (
                    <div className="mt-1">
                      {/* Ya subió comprobante */}
                      {cita.comprobante ? (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            Comprobante enviado
                          </div>
                          <a
                            href={cita.comprobante}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium"
                          >
                            Ver <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : compExito.has(cita.id) ? (
                        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-3 text-green-700 dark:text-green-400 text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          ¡Comprobante recibido! Tu cita está confirmada. ✅
                        </div>
                      ) : (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3">
                          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            Sube tu comprobante de transferencia para confirmar tu cita
                          </p>
                          {errorComp[cita.id] && (
                            <p className="text-xs text-red-500 mb-1.5">{errorComp[cita.id]}</p>
                          )}
                          <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 text-xs font-semibold cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/30 transition ${subiendoComp === cita.id ? 'opacity-50 pointer-events-none' : ''}`}>
                            {subiendoComp === cita.id
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo...</>
                              : <><ImageIcon className="w-3.5 h-3.5" /> Seleccionar comprobante</>
                            }
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (f) handleSubirComprobante(cita.id, f)
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancelar cita */}
                  {puedeCancelar(cita.fecha, cita.estado) && (
                    <button
                      onClick={() => setModalCancelar(cita.id)}
                      disabled={cancelando === cita.id}
                      className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-sm font-semibold disabled:opacity-50"
                    >
                      {cancelando === cita.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelando...</>
                        : <><XCircle className="w-4 h-4" /> Cancelar cita</>
                      }
                    </button>
                  )}

                  {/* Aviso menos de 24h */}
                  {cita.estado !== 'CANCELADA' && cita.estado !== 'COMPLETADA' && !puedeCancelar(cita.fecha, cita.estado) && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                      ⚠️ Ya no es posible cancelar con menos de 24 horas de anticipación
                    </p>
                  )}

                  {error && cancelando === null && (
                    <p className="text-xs text-red-500 text-center mt-1">{error}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal de confirmación para cancelar ─────────────────────── */}
      {modalCancelar !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-7 w-full max-w-sm shadow-2xl border border-red-100 dark:border-red-900/30 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Ícono */}
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-5">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2">
              ¿Cancelar esta cita?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-7 leading-relaxed">
              Esta acción <strong className="text-gray-700 dark:text-gray-300">no se puede deshacer</strong>.
              Recibirás un correo de confirmación de cancelación.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalCancelar(null)}
                className="flex-1 px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                No, mantener
              </button>
              <button
                onClick={() => { cancelarCita(modalCancelar); setModalCancelar(null) }}
                disabled={cancelando !== null}
                className="flex-1 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold text-sm transition shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelando !== null
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelando...</>
                  : 'Sí, cancelar'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
