import Link from 'next/link'

export default function ClienteNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center
                    bg-white dark:bg-gray-950 transition-colors">
      <p className="text-xs font-bold text-pink-300 dark:text-pink-600 uppercase tracking-[0.3em] mb-3">
        Error 404
      </p>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
        Página no encontrada
      </h1>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mb-8">
        No encontramos lo que buscas. Puede que el link haya cambiado o ya no exista.
      </p>
      <Link
        href="/"
        className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-7 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
