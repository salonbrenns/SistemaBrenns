"use client"

import Link from "next/link"
import { useSession } from "next-auth/react" // Se eliminó signOut
import { useState } from "react" // Se eliminó useEffect
import { Calendar, Mail, Phone, Edit2, Heart, Clock, CreditCard } from "lucide-react"
import Breadcrumb from "@/components/Breadcrumb"
import EditarPerfilModal from "@/components/ui/EditarPerfilModal"

// Definimos una interfaz para el usuario para evitar errores de tipado con 'telefono'
interface CustomUser {
  name?: string | null
  email?: string | null
  image?: string | null
  role?: string
  telefono?: string | null
}

export default function PerfilPage() {
  const { data: session, status } = useSession()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [datosLocales, setDatosLocales] = useState<{
    nombre?: string
    correo?: string
    telefono?: string | null
  }>({})

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </main>
    )
  }

  if (!session) return null

  // Casteo seguro del usuario
  const user = session.user as CustomUser

  // Usar datos locales si se actualizaron, sino los de la sesión
  const nombre = datosLocales.nombre ?? user?.name ?? "Usuario"
  const correo = datosLocales.correo ?? user?.email ?? ""
  const telefono = datosLocales.telefono ?? user?.telefono ?? "No proporcionado" 
  
  const primerLetra = nombre.charAt(0).toUpperCase()
  const fechaRegistro = new Date().toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        <Breadcrumb items={[
          { label: "Inicio", href: "/" },
          { label: "Mi Perfil", href: "#", active: true }
        ]} />

        {/* Header del perfil */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 mb-8 border border-pink-100">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-5xl sm:text-6xl font-bold shadow-xl">
                {primerLetra}
              </div>
              <button
                onClick={() => setModalAbierto(true)}
                className="absolute bottom-2 right-2 bg-white p-3 rounded-full shadow-lg hover:scale-110 transition"
              >
                <Edit2 className="w-5 h-5 text-pink-600" />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{nombre}</h1>
              <p className="text-pink-600 font-bold text-lg mt-2">
                {user?.role === "ADMIN" ? "Administrador" :
                 user?.role === "DOCENTE" ? "Docente" : "Cliente"}
              </p>
              <p className="text-gray-600 mt-1">Miembro desde {fechaRegistro}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setModalAbierto(true)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-8 py-4 rounded-full shadow-lg transition transform hover:scale-105"
              >
                Editar Perfil
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Columna izquierda */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-pink-100">
              <h2 className="text-xl font-bold text-pink-600 mb-6">Información Personal</h2>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-pink-600 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm text-gray-600">Correo</p>
                    <p className="font-medium text-sm truncate">{correo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-pink-600 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Teléfono</p>
                    <p className={`font-medium text-sm ${telefono === "No proporcionado" ? "text-gray-400 italic" : "text-gray-800"}`}>
                      {telefono}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-100 to-pink-50 rounded-3xl shadow-xl p-6 text-center">
              <Heart className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <p className="text-4xl font-bold text-pink-600">0</p>
              <p className="text-gray-700 font-medium">Favoritos</p>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="md:col-span-2 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-pink-100">
                <Calendar className="w-10 h-10 text-pink-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Cursos inscritos</p>
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-pink-100">
                <Clock className="w-10 h-10 text-pink-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Citas pendientes</p>
              </div>
              <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-pink-100">
                <CreditCard className="w-10 h-10 text-pink-600 mx-auto mb-3" />
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-gray-600">Compras totales</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
              <h2 className="text-2xl font-bold text-pink-600 mb-4">Mis Cursos Activos</h2>
              <p className="text-gray-500 text-center py-6">Aún no tienes cursos inscritos.</p>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                ¿Quieres ver todos tus cursos y citas?{" "}
                <Link href="/mis-cursos" className="text-pink-600 font-bold hover:underline">
                  Ir a Mi Historial →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {modalAbierto && (
        <EditarPerfilModal
          onClose={() => setModalAbierto(false)}
          onActualizado={(datos) => {
            setDatosLocales(datos)
            setModalAbierto(false)
          }}
        />
      )}
    </main>
  )
}