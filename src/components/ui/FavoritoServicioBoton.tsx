// src/components/ui/FavoritoServicioBoton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { useFavoritosServicios } from '@/hooks/useFavoritosServicios'

interface Props {
  servicioId: number
  className?: string
}

export function FavoritoServicioBoton({ servicioId, className = '' }: Props) {
  const { status } = useSession()
  const router = useRouter()
  const { esFavorito, toggle, cargando } = useFavoritosServicios()

  const activo = esFavorito(servicioId)

  const handleClick = async () => {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }
    await toggle(servicioId)
  }

  return (
    <button
      onClick={handleClick}
      disabled={cargando}
      aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`transition-all duration-200 disabled:opacity-50 ${className}`}
    >
      <Heart
        size={22}
        className={`transition-colors duration-200 ${
          activo
            ? 'fill-red-500 stroke-red-500'
            : 'fill-transparent stroke-gray-400 hover:stroke-red-400'
        }`}
      />
    </button>
  )
}