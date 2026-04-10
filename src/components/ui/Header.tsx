'use client'

import Image from 'next/image'
import Link from 'next/link'
import { User, ShoppingCart, Menu, X, Bell, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const { data: session, status } = useSession()
  const router = useRouter()
  const autenticado = status === 'authenticated'

  //Carrito desde BD + sincronización
  const cargarCarrito = () => {
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
  }

  useEffect(() => {
    cargarCarrito()

    //Sync entre componentes
    window.addEventListener('cart-updated', cargarCarrito)

    //Sync entre pestañas (de main)
    window.addEventListener('storage', cargarCarrito)

    return () => {
      window.removeEventListener('cart-updated', cargarCarrito)
      window.removeEventListener('storage', cargarCarrito)
    }
  }, [status])

  // Mensajes
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
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <Image
                src="/logo/logo.png"
                alt="Brenn's - Academia • Distribuidora • Salón"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex gap-6 flex-1 ml-10">
            <Link href="/">Inicio</Link>
            <Link href="/servicios">Servicios</Link>
            <Link href="/cursos">Cursos</Link>
            <Link href="/catalogo">Tienda</Link>
            <Link href="/nosotros">Nosotros</Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">

            {autenticado && (
              <>
                <Link href="/perfil"><User /></Link>
                <Link href="/favoritos"><Heart /></Link>

                <Link href="/mis-mensajes" className="relative">
                  <Bell />
                  {noLeidos > 0 && <span>{noLeidos}</span>}
                </Link>

                <Link href="/carrito" className="relative">
                  <ShoppingCart />
                  {cantidadCarrito > 0 && <span>{cantidadCarrito}</span>}
                </Link>

                <button onClick={handleLogout}>Cerrar sesión</button>
              </>
            )}

            {!autenticado && status !== 'loading' && (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Registro</Link>
              </>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile */}
        {menuOpen && (
          <nav>
            <Link href="/">Inicio</Link>
            <Link href="/servicios">Servicios</Link>
            <Link href="/cursos">Cursos</Link>
            <Link href="/catalogo">Tienda</Link>
            <Link href="/nosotros">Nosotros</Link>

            {autenticado && (
              <>
                <Link href="/perfil">Perfil</Link>
                <Link href="/favoritos">Favoritos</Link>
                <Link href="/carrito">Carrito</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}