'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import ProductoCard, { type ProductoCardType } from '@/components/ui/ProductoCard'

type ProductoRecomendado = ProductoCardType & {
  confianza: number | null
  lift: number | null
}

type Fuente = 'apriori' | 'populares_categoria' | 'populares_catalogo'

type Respuesta = {
  fuente: Fuente
  productos: ProductoRecomendado[]
}

const TEXTOS: Record<Fuente, { titulo: string; subtitulo: string }> = {
  apriori: {
    titulo: 'Quienes compraron esto también compraron',
    subtitulo: '',
  },
  populares_categoria: {
    titulo: 'Populares de esta categoría',
    subtitulo: 'Los favoritos de nuestras clientas',
  },
  populares_catalogo: {
    titulo: 'Populares de todo el catálogo',
    subtitulo: 'Los favoritos de nuestras clientas',
  },
}

export default function Recomendaciones({ productoId }: { productoId: number }) {
  const [datos, setDatos] = useState<Respuesta | null>(null)

  useEffect(() => {
    let activo = true
    fetch(`/api/recomendaciones/${productoId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (activo && json?.productos?.length) setDatos(json)
      })
      .catch(() => {})
    return () => {
      activo = false
    }
  }, [productoId])

  if (!datos) return null

  const { titulo, subtitulo } = TEXTOS[datos.fuente]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="bg-rose-100 text-rose-600 p-2 rounded-full">
          <Sparkles className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{titulo}</h2>
          {subtitulo && <p className="text-xs text-gray-400">{subtitulo}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {datos.productos.map(p => (
          <div key={p.id}>
            <ProductoCard producto={p} />
          </div>
        ))}
      </div>
    </section>
  )
}
