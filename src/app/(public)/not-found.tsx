import Link from 'next/link'

function Illustration() {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56 sm:w-72 sm:h-72">
      {/* Frasco de esmalte — minimalista */}
      <g transform="rotate(-20, 100, 110)">
        {/* Tapa */}
        <rect x="84" y="42" width="32" height="36" rx="8" fill="#f9a8c9"/>
        {/* Pincel */}
        <rect x="98" y="22" width="4" height="22" rx="2" fill="#fbcfe8"/>
        {/* Cuerpo */}
        <rect x="78" y="76" width="44" height="72" rx="12" fill="#ec4899"/>
        {/* Brillo */}
        <rect x="85" y="82" width="8" height="36" rx="4" fill="white" opacity="0.3"/>
      </g>
      {/* Gota derramada */}
      <ellipse cx="60" cy="168" rx="36" ry="10" fill="#fbcfe8" opacity="0.7"/>
      <ellipse cx="52" cy="162" rx="14" ry="8" fill="#f9a8c9" opacity="0.8"/>
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center px-6 text-center
                    bg-white dark:bg-gray-950 transition-colors">

      <Illustration />

      <p className="text-xs font-bold text-pink-300 dark:text-pink-600 uppercase tracking-[0.3em] mt-6 mb-3">
        Error 404
      </p>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
        Página no encontrada
      </h1>

      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mb-10">
        No encontramos lo que buscas. Puede que el link haya cambiado o ya no exista.
      </p>

      <Link
        href="/"
        className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
