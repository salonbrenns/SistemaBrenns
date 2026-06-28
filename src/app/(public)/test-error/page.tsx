'use client'
// SOLO PARA PRUEBAS — eliminar antes de producción
export default function TestError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-700 dark:text-white">Prueba de páginas de error</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <a href="/ruta-que-no-existe-xyz"
          className="bg-pink-500 text-white font-bold px-6 py-3 rounded-full hover:bg-pink-600 transition text-center">
          Probar 404
        </a>
        <a href="/test-error/crash"
          className="bg-rose-600 text-white font-bold px-6 py-3 rounded-full hover:bg-rose-700 transition text-center">
          Probar 500
        </a>
      </div>
      <p className="text-xs text-gray-400 mt-2">⚠️ Eliminar antes de subir a producción</p>
    </div>
  )
}
