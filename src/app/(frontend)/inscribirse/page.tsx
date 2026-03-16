"use client"

import { useSearchParams } from "next/navigation"
import { useState, Suspense } from "react" // Importamos Suspense
import AuthGuard from "@/components/ui/AuthGuard"
import { CreditCard, CheckCircle, ArrowLeft, User, AlertCircle } from "lucide-react"
import Link from "next/link"
import { validarInscripcion } from "@/lib/validation"

// 1. Creamos un componente interno que maneja la lógica de los SearchParams
function InscribirseContent() {
  const searchParams = useSearchParams()

  // Datos del curso desde el enlace
  const curso = {
    id: searchParams.get("id") || "1",
    titulo: searchParams.get("titulo") || "Curso seleccionado",
    instructora: searchParams.get("instructora") || "Brenn's",
    precio: Number(searchParams.get("precio")) || 2500,
    cupos: Number(searchParams.get("cupos")) || 3,
  }

  const [formData, setFormData] = useState({
    nombre: "", apellido: "", correo: "", telefono: "",
    nombreTarjeta: "", numeroTarjeta: "", expiracion: "", cvv: ""
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)

    const validacion = validarInscripcion(formData)
    if (!validacion.valido) {
      setFieldErrors(validacion.errores)
      setGeneralError("Por favor completa correctamente todos los campos")
      return
    }

    alert(`¡FELICIDADES! Te inscribiste con éxito al curso:\n"${curso.titulo}"\nTe enviaremos todos los detalles por correo y WhatsApp`)
    setTimeout(() => window.location.href = "/cursos", 2000)
  }

  return (
    <div className="grid lg:grid-cols-3 gap-10">
      {/* Formulario de pago */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex gap-4 mb-10 justify-center">
            <div className="px-8 py-4 rounded-full bg-pink-600 text-white font-bold">Datos y Pago</div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit} aria-label="Formulario de inscripción y pago">
            {/* Campos de Nombre y Apellido */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-lg font-bold mb-2">Nombre</label>
                <input id="nombre" name="nombre" onChange={handleChange} 
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                    fieldErrors.nombre ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                  }`}
                  placeholder="Ruth" />
                {fieldErrors.nombre && <p className="text-red-600 text-xs mt-1">{fieldErrors.nombre}</p>}
              </div>
              <div>
                <label htmlFor="apellido" className="block text-lg font-bold mb-2">Apellido</label>
                <input id="apellido" name="apellido" onChange={handleChange} 
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                    fieldErrors.apellido ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                  }`}
                  placeholder="Barrientos Angeles" />
                {fieldErrors.apellido && <p className="text-red-600 text-xs mt-1">{fieldErrors.apellido}</p>}
              </div>
            </div>

            {/* Correo y Teléfono */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="correo" className="block text-lg font-bold mb-2">Correo electrónico</label>
                <input id="correo" type="email" name="correo" onChange={handleChange} 
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                    fieldErrors.correo ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                  }`}
                  placeholder="ruth.barrientos@uthh.edu.mx" />
                {fieldErrors.correo && <p className="text-red-600 text-xs mt-1">{fieldErrors.correo}</p>}
              </div>
              <div>
                <label htmlFor="telefono" className="block text-lg font-bold mb-2">Teléfono</label>
                <div className="flex">
                  <span className="inline-flex items-center px-5 rounded-l-full bg-gray-100 border-2 border-pink-200 border-r-0 text-gray-600">MX +52</span>
                  <input id="telefono" name="telefono" onChange={handleChange} 
                    className={`w-full px-6 py-4 rounded-r-full border-2 focus:outline-none transition-all ${
                      fieldErrors.telefono ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                    }`}
                    placeholder="961 123 4567" />
                </div>
                {fieldErrors.telefono && <p className="text-red-600 text-xs mt-1">{fieldErrors.telefono}</p>}
              </div>
            </div>

            {/* Datos de tarjeta */}
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="nombreTarjeta" className="block text-lg font-bold mb-2">Nombre en la tarjeta</label>
                <input id="nombreTarjeta" name="nombreTarjeta" onChange={handleChange} 
                  className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                    fieldErrors.nombreTarjeta ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                  }`}
                  placeholder="Ruth Barrientos Angeles" />
                {fieldErrors.nombreTarjeta && <p className="text-red-600 text-xs mt-1">{fieldErrors.nombreTarjeta}</p>}
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative">
                  <label htmlFor="numeroTarjeta" className="block text-lg font-bold mb-2">Número de tarjeta</label>
                  <input id="numeroTarjeta" name="numeroTarjeta" onChange={handleChange} maxLength={19} 
                    className={`w-full px-6 py-4 pl-16 rounded-full border-2 focus:outline-none transition-all ${
                      fieldErrors.numeroTarjeta ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                    }`}
                    placeholder="1234 5678 9012 3456" />
                  <CreditCard className="absolute left-5 top-12 w-8 h-8 text-pink-600 pointer-events-none" />
                  {fieldErrors.numeroTarjeta && <p className="text-red-600 text-xs mt-1">{fieldErrors.numeroTarjeta}</p>}
                </div>
                <div>
                  <label htmlFor="expiracion" className="block text-lg font-bold mb-2">MM/AA</label>
                  <input id="expiracion" name="expiracion" onChange={handleChange} 
                    className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                      fieldErrors.expiracion ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                    }`}
                    placeholder="12/28" />
                  {fieldErrors.expiracion && <p className="text-red-600 text-xs mt-1">{fieldErrors.expiracion}</p>}
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-lg font-bold mb-2">CVV</label>
                  <input id="cvv" name="cvv" onChange={handleChange} maxLength={4} 
                    className={`w-full px-6 py-4 rounded-full border-2 focus:outline-none transition-all ${
                      fieldErrors.cvv ? "border-red-500 focus:ring-2 focus:ring-red-200" : "border-pink-200 focus:border-pink-500"
                    }`}
                    placeholder="123" />
                  {fieldErrors.cvv && <p className="text-red-600 text-xs mt-1">{fieldErrors.cvv}</p>}
                </div>
              </div>
            </div>

            {generalError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center border border-red-100">
                {generalError}
              </div>
            )}

            <div className="text-center pt-8">
              <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-2xl px-16 py-6 rounded-full shadow-2xl transition transform hover:scale-105 inline-flex items-center gap-4">
                <CheckCircle className="w-8 h-8" />
                Pagar ${curso.precio.toLocaleString()} MXN e inscribirme
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resumen del curso */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-2xl p-8 sticky top-24">
          <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Tu inscripción</h2>
          <div className="bg-white/90 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 text-center">{curso.titulo}</h3>
            <div className="text-center space-y-3">
              <p className="flex items-center justify-center gap-3 text-gray-700">
                <User className="w-6 h-6 text-pink-600" />
                <span className="font-medium">{curso.instructora}</span>
              </p>
              <div className="py-4">
                <p className="text-5xl font-bold text-pink-600">${curso.precio.toLocaleString()} MXN</p>
                <p className="text-gray-600 mt-2">Pago único • Incluye material</p>
              </div>
              {curso.cupos <= 5 && (
                <div className="bg-red-100 text-red-700 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 animate-pulse">
                  <AlertCircle className="w-6 h-6" />
                  ¡Solo quedan {curso.cupos} cupos!
                </div>
              )}
              <div className="border-t-2 border-pink-200 pt-6">
                <p className="text-2xl font-bold text-pink-600 text-center">
                  Total: ${curso.precio.toLocaleString()} MXN
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. Componente principal exportado
export default function InscribirsePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="sr-only">Inscripción y pago del curso - Brenn&apos;s</h1>
          
          {/* ENVOLTURA SUSPENSE: Esto soluciona el error del Build */}
          <Suspense fallback={<div className="text-center py-20 text-pink-600 font-bold">Cargando formulario de pago...</div>}>
            <InscribirseContent />
          </Suspense>

          <div className="text-center mt-12">
            <Link href="/cursos" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-bold text-lg">
              <ArrowLeft className="w-6 h-6" />
              Volver al catálogo de cursos
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}