'use client'

import Link from 'next/link'
import { User, ShoppingCart, Menu, X, Bell, Heart } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import Image from 'next/image'

export default function Header() {
  const config = useSiteConfig()
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const { status } = useSession()
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
    let mounted = true;

    const executeLoad = async () => {
      if (status === 'loading' || !mounted) return;
      await cargarCarrito();   // Si es async, mejor
    };

    executeLoad();

    const handleCartUpdate = () => {
      if (mounted) cargarCarrito();
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [cargarCarrito, status]);

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

          {/* Logo Dinámico */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition flex-shrink-0">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
          
             <Image
            key={config.logo_src}
            src={config.logo_src}
            alt={config.nombre}
            fill
            className="object-contain"
            sizes="80px"
            priority
          />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">
                {config.nombre}
              </h1>
              <p className="text-xs md:text-sm text-pink-600 font-medium">
                {config.eslogan}
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
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {noLeidos}
                    </span>
                  )}
                </Link>
                <Link href="/carrito"
                  className="relative text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {cantidadCarrito > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout}
                  className="hidden md:inline-block text-xs px-4 py-2 rounded-full border border-pink-200 hover:bg-pink-50 text-pink-600 font-bold transition uppercase tracking-wider">
                  Cerrar sesión
                </button>
              </>
            )}

            {!autenticado && status !== 'loading' && (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="hidden md:block bg-white border border-pink-200 text-pink-600 font-bold px-5 py-2 rounded-full transition text-xs uppercase tracking-widest hover:bg-pink-50">
                  Ingresar
                </Link>
                <Link href="/register"
                  className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2 rounded-full shadow-md transition transform hover:scale-105 text-xs uppercase tracking-widest">
                  Registro
                </Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-600 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="lg:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4 animate-in fade-in slide-in-from-top-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-bold text-gray-700">Inicio</Link>
            <Link href="/servicios" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-bold text-gray-700">Servicios</Link>
            <Link href="/cursos" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-bold text-gray-700">Cursos</Link>
            <Link href="/catalogo" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-bold text-gray-700">Tienda</Link>
            <Link href="/nosotros" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-bold text-gray-700">Nosotros</Link>
            {!autenticado && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <Link href="/login" className="text-center py-3 bg-gray-50 rounded-xl text-xs font-bold text-gray-600">Login</Link>
                <Link href="/register" className="text-center py-3 bg-pink-600 rounded-xl text-xs font-bold text-white">Registro</Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}