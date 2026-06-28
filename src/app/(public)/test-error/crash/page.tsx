// Página que lanza un error durante el renderizado — activa error.tsx
// SOLO PARA PRUEBAS, eliminar antes de producción
export const dynamic = 'force-dynamic'

export default function CrashPage() {
  throw new Error("Error de prueba 500")
}
