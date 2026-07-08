'use client'

import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFavoritosCursos } from '@/hooks/useFavoritosCursos'

interface Props {
  cursoId: number
  className?: string
}

export function FavoritoCursoBoton({ cursoId, className }: Props) {
  const { status } = useSession()
  const router = useRouter()
  const { toggle, esFavorito } = useFavoritosCursos()
  const esFav = status === 'authenticated' && esFavorito(cursoId)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (status !== 'authenticated') {
      router.push(`/login?next=/curso/${cursoId}`)
      return
    }
    await toggle(cursoId)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={className ?? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-full shadow-md hover:bg-rose-600 hover:text-white dark:text-gray-300 transition-all duration-200'}
    >
      <Heart
        size={22}
        className={`transition-colors duration-200 ${
          esFav ? 'fill-red-500 stroke-red-500' : 'fill-transparent stroke-gray-400 hover:stroke-red-400'
        }`}
      />
    </button>
  )
}
