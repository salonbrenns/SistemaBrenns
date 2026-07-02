// src/components/ui/ServicioCard.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Scissors } from 'lucide-react'
import { FavoritoServicioBoton } from './FavoritoServicioBoton'
import { useFavoritosServicios } from '@/hooks/useFavoritosServicios'

export interface ServicioCardType {
  id:         number
  nombre:     string
  imagen:     string | null
  categoria:  string   // ya normalizado desde la página
  precio_min: number
  disponible: boolean
  duracion?:  string | null
}

interface Props {
  servicio: ServicioCardType
}

export default function ServicioCard({ servicio }: Props) {
  const { id, nombre, imagen, categoria, precio_min, disponible, duracion } = servicio
  const noDisponible = !disponible
  const { esFavorito } = useFavoritosServicios()

  return (
    <article className={`group bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm hover:shadow-2xl border border-rose-50 dark:border-gray-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 ${noDisponible ? 'opacity-60' : ''}`}>
      <Link href={`/servicio/${id}`} className="block">

        {/* Imagen */}
        <div className="relative h-60 overflow-hidden bg-rose-50">
          {imagen ? (
            <Image
              src={imagen}
              alt={nombre}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Scissors className="w-16 h-16 text-rose-200" />
            </div>
          )}

          {/* Badge duración */}
          {duracion && (
            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {duracion}
            </span>
          )}

          {noDisponible && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white text-xs font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest">
                No disponible
              </span>
            </div>
          )}

          {/* Botón favorito — siempre visible si es favorito, hover si no */}
          <div className={`absolute top-3 right-3 z-10 transition-opacity ${esFavorito(id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <FavoritoServicioBoton
              servicioId={id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-rose-600 hover:text-white dark:text-gray-300 transition-all"
            />
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-widest font-black text-rose-400">
              Servicio
            </span>
            {categoria && (
              <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">
                {categoria}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-800 dark:text-white mb-2 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
            {nombre}
          </h3>

          {/* Precio */}
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 font-medium">desde</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  ${(precio_min ?? 0).toLocaleString('es-MX')}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">MXN</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link href={`/servicio/${id}`}>
          <button
            disabled={noDisponible}
            className="w-full bg-gray-900 hover:bg-rose-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Ver servicio
          </button>
        </Link>
      </div>
    </article>
  )
}
