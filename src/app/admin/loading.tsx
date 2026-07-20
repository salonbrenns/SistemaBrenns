export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}
