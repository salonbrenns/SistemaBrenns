'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, ShoppingCart, Menu, X, Bell, Heart } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const { status } = useSession() // Corregido: Se eliminó la asignación inútil de 'session'
  const router = useRouter()
  const autenticado = status === 'authenticated'

  const cargarCarrito = useCallback(() => {
    if (status !== 'authenticated') {
      setCantidadCarrito(0)
      return
    }

    fetch('/api/carrito')
      .then(r => r.json())
      .then((items: { cantidad: number }[]) => {
        if (Array.isArray(items)) {
          setCantidadCarrito(items.reduce((s, i) => s + i.cantidad, 0))
        }
      })
      .catch(() => {})
  }, [status])

  useEffect(() => {
    cargarCarrito()
    
    // Corregido: Uso de globalThis en lugar de window
    globalThis.addEventListener('cart-updated', cargarCarrito)
    globalThis.addEventListener('storage', cargarCarrito)

    return () => {
      globalThis.removeEventListener('cart-updated', cargarCarrito)
      globalThis.removeEventListener('storage', cargarCarrito)
    }
  }, [cargarCarrito])

  useEffect(() => {
    if (!autenticado) return
    fetch('/api/usuario/mensajes')
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
    setCantidadCarrito(0)
    router.push('/')
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
              <p className="text-xs md:text-sm text-pink-600 font-medium">
                Academia • Distribuidora • Salón
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 ml-10">
            <Link href="/" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Inicio</Link>
            <Link href="/servicios" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Servicios</Link>
            <Link href="/cursos" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Cursos</Link>
            <Link href="/catalogo" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Tienda</Link>
            <Link href="/nosotros" className="text-gray-700 hover:text-pink-600 font-medium transition text-sm">Nosotros</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-3 md:gap-4">

            {autenticado && (
              <>
                <Link href="/perfil"
                  className="text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </Link>

                <Link href="/favoritos"
                  className="text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <Heart className="w-5 h-5 md:w-6 md:h-6" />
                </Link>

                <Link href="/mis-mensajes"
                  className="relative text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  {noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {noLeidos}
                    </span>
                  )}
                </Link>

                <Link href="/carrito"
                  className="relative text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {cantidadCarrito > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                    </span>
                  )}
                </Link>

                <button onClick={handleLogout}
                  className="hidden md:inline-block text-sm px-4 py-2 rounded-full border border-pink-200 hover:bg-pink-50 text-pink-600 font-semibold transition">
                  Cerrar sesión
                </button>
              </>
            )}

            {!autenticado && status !== 'loading' && (
              <>
                <Link href="/login"
                  className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 text-sm">
                  Iniciar Sesión
                </Link>

                <Link href="/register"
                  className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105 text-sm">
                  Registrarse
                </Link>
              </>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {menuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            <Link href="/" className="block py-2">Inicio</Link>
            <Link href="/servicios" className="block py-2">Servicios</Link>
            <Link href="/cursos" className="block py-2">Cursos</Link>
            <Link href="/catalogo" className="block py-2">Tienda</Link>
            <Link href="/nosotros" className="block py-2">Nosotros</Link>
          </nav>
        )}

      </div>
    </header>
  )
}