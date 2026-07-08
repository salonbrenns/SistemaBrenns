// src/app/(frontend)/mis-citas/page.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, ChevronDown, ChevronUp, Clock, User } from 'lucide-react'
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
  servicio: Servicio
}

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-amber-100  text-amber-700',
  CONFIRMADA: 'bg-green-100  text-green-700',
  CANCELADA:  'bg-red-100    text-red-600',
  COMPLETADA: 'bg-blue-100   text-blue-700',
}

export default function MisCitasPage() {
  return <AuthGuard><MisCitasContenido /></AuthGuard>
}

function MisCitasContenido() {
  const [citas,    setCitas]    = useState<Cita[]>([])
  const [cargando, setCargando] = useState(true)
  const [abierto,  setAbierto]  = useState<number | null>(null)

 useEffect(() => {
  fetch('/api/citas')
    .then(r => r.json())
    .then(data => setCitas(Array.isArray(data.citas) ? data.citas : []))  // ✅
    .finally(() => setCargando(false))
}, [])

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
                    {cita.estado}
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}