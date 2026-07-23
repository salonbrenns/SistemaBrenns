export default function DotsLoader({ texto = "Cargando..." }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      {/* Spinner circular */}
      <div className="relative w-11 h-11">
        {/* Pista */}
        <div className="absolute inset-0 rounded-full border-[3px] border-pink-100 dark:border-pink-900/40" />
        {/* Arco giratorio */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-pink-600 animate-spin" />
      </div>
      {texto && <p className="text-sm text-pink-500 dark:text-pink-400 font-medium">{texto}</p>}
    </div>
  )
}
