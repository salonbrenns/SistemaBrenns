import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold text-pink-400 dark:text-pink-500 uppercase tracking-[0.3em] mb-3">
        Error 404
      </p>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
        Página no encontrada
      </h1>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mb-8">
        Esta sección no existe o no tienes acceso a ella.
      </p>
      <Link
        href="/admin/dashboard"
        className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-7 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
      >
        Ir al dashboard
      </Link>
    </div>
  )
}
