// src/components/ui/Header.tsx
"use client"
import Image from "next/image"
import Link from "next/link"
import { User, ShoppingCart, Menu, X, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function Header() {
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const { data: session, status } = useSession()
  const router = useRouter()
  const autenticado = status === "authenticated"

  // 1. Sincronizar la cantidad del carrito con el localStorage
  useEffect(() => {
    const calcularTotal = () => {
      const stored = localStorage.getItem("nail_store_cart")
      if (stored) {
        try {
          const carrito = JSON.parse(stored)
          const total = carrito.reduce((acc: number, item: { cantidad: number }) => acc + item.cantidad, 0)
          setCantidadCarrito(total)
        } catch (error) {
          console.error("Error al leer el carrito:", error)
          setCantidadCarrito(0)
        }
      } else {
        setCantidadCarrito(0)
      }
    }

    // Calcular al montar el componente
    calcularTotal()

    // Escuchar cambios desde otros componentes/pestañas
    window.addEventListener('storage', calcularTotal)
    
    // Crear un evento personalizado para actualizaciones en la misma pestaña
    window.addEventListener('cart-updated', calcularTotal)

    return () => {
      window.removeEventListener('storage', calcularTotal)
      window.removeEventListener('cart-updated', calcularTotal)
    }
  }, [])

  // 2. Cargar mensajes no leídos
  useEffect(() => {
    if (!autenticado) return
    fetch("/api/usuario/mensajes")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNoLeidos(data.filter((m: { leido: boolean }) => !m.leido).length)
        }
      })
      .catch(() => {})
  }, [autenticado])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
    setMenuOpen(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition flex-shrink-0">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <Image
                src="/logo/logo.png"
                alt="Brenn's - Academia • Distribuidora • Salón"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900">Brenn&apos;s</h1>
              <p className="text-xs md:text-sm text-pink-600 font-medium">Academia • Distribuidora • Salón</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 ml-10">
            <Link href="/" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Inicio</Link>
            <Link href="/servicios" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Servicios</Link>
            <Link href="/cursos" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Cursos</Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Catálogo</Link>
            <Link href="/nosotros" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Nosotros</Link>

          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-4">

            {autenticado && (
              <>
                {/* Perfil */}
                <Link href="/perfil"
                  className="text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50"
                  title={session?.user?.name || "Mi perfil"}>
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </Link>

                {/* Mensajes / Notificaciones */}
                <Link href="/mis-mensajes"
                  className="relative text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50"
                  title="Mis mensajes">
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  {noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {noLeidos}
                    </span>
                  )}
                </Link>

                {/* Carrito */}
                <Link href="/carrito"
                  className="relative text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {cantidadCarrito > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {cantidadCarrito}
                    </span>
                  )}
                </Link>

                {/* Cerrar sesión desktop */}
                <button onClick={handleLogout}
                  className="hidden md:inline-block text-sm px-4 py-2 rounded-full border border-pink-200 hover:bg-pink-50 text-pink-600 font-semibold transition">
                  Cerrar sesión
                </button>
              </>
            )}

            {!autenticado && status !== "loading" && (
              <Link href="/login"
                className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 text-sm">
                Iniciar Sesión
              </Link>
            )}

            {/* Botón menú móvil */}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            <Link href="/" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link href="/servicios" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Servicios</Link>
            <Link href="/cursos" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Cursos</Link>
            <Link href="/catalogo" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Catálogo</Link>
            <Link href="/nosotros" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>Nosotros</Link>


            {autenticado ? (
              <>
                <Link href="/perfil" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Mi Perfil
                </Link>
                <Link href="/mis-mensajes" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Mensajes {noLeidos > 0 && <span className="bg-pink-600 text-white text-xs rounded-full px-1.5 ml-1">{noLeidos}</span>}
                </Link>
                <Link href="/mis-cursos" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Mi Historial
                </Link>
                <Link href="/carrito" className="block text-gray-700 hover:text-pink-600 font-medium py-2" onClick={() => setMenuOpen(false)}>
                  Carrito {cantidadCarrito > 0 && `(${cantidadCarrito})`}
                </Link>
                <button onClick={handleLogout}
                  className="block w-full border border-pink-200 text-pink-600 font-bold px-6 py-2 rounded-full text-center mt-2">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/login"
                className="block bg-pink-600 text-white font-bold px-6 py-2 rounded-full text-center mt-4"
                onClick={() => setMenuOpen(false)}>
                Iniciar Sesión
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}