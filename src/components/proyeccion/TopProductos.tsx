'use client'

import Image from 'next/image'
import { Trophy } from 'lucide-react' 
import { ProductoFila, primeraImagen } from '@/app/admin/proyeccion/types'

interface Props {
  productos: ProductoFila[]
}

export default function TopProductos({ productos }: Props) {
  const top5 = productos.slice(0, 5)

  if (top5.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Productos más vendidos</h2>
        <p className="text-xs text-gray-400 mt-0.5">Top 5 con mayor demanda</p>
      </div>

      <div className="divide-y divide-gray-100">
        {top5.map((p, i) => {
          const img = primeraImagen(p.imagen)
          
          // Definimos el color del icono basado en la posición
          const getRankIcon = (index: number) => {
            if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" /> 
            if (index === 1) return <Trophy className="w-5 h-5 text-gray-400" />   
            if (index === 2) return <Trophy className="w-5 h-5 text-amber-600" />  
            return <span className="text-sm font-bold text-gray-300">#{index + 1}</span>
          }

          return (
            <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
              {/* Rank Iconizado */}
              <div className="w-8 flex justify-center items-center flex-shrink-0">
                {getRankIcon(i)}
              </div>

              {/* Imagen */}
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {img
                  ? <Image src={img} alt={p.nombre} width={48} height={48} className="object-cover h-full w-full" />
                  : <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{p.nombre}</p>
                <p className="text-xs text-gray-400 truncate">
                  {p.categoria ?? '—'} · {p.marca ?? '—'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-right flex-shrink-0">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{p.ventas_totales}</p>
                  <p className="text-xs text-gray-400">vendidos</p>
                </div>
                <div>
                  <p className={`font-semibold ${
                    p.stock_total <= 2  ? 'text-red-500'    :
                    p.stock_total <= 10 ? 'text-yellow-500' : 'text-green-600'
                  }`}>
                    {p.stock_total}
                  </p>
                  <p className="text-xs text-gray-400">en stock</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}