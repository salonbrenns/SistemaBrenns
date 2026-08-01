'use client'

import Link from 'next/link'
import { User, ShoppingCart, Menu, X, Bell, Heart, Sun, Moon, Monitor } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { useTheme } from '@/components/ui/ThemeProvider'
import Image from 'next/image'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const options = [
    { value: 'light',  label: 'Claro',   Icon: Sun     },
    { value: 'dark',   label: 'Oscuro',  Icon: Moon    },
    { value: 'system', label: 'Sistema', Icon: Monitor },
  ] as const

  const current = options.find(o => o.value === theme) ?? options[2]
  const Icon = current.Icon

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 dark:text-gray-300 dark:hover:text-pink-400 dark:hover:bg-gray-700 transition"
        aria-label="Cambiar tema"
      >
        <Icon className="w-5 h-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
            {options.map(({ value, label, Icon: Ic }) => (
              <button
                key={value}
                onClick={() => { setTheme(value); setOpen(false) }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition
                  ${theme === value
                    ? 'bg-pink-50 dark:bg-gray-700 text-pink-600 dark:text-pink-400 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <Ic className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Header() {
  const config = useSiteConfig()
  const [cantidadCarrito, setCantidadCarrito] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [noLeidos, setNoLeidos] = useState(0)
  const { status } = useSession()
  const router = useRouter()
  const autenticado = status === 'authenticated'

  const cargarCarrito = useCallback(() => {
    if (status !== 'authenticated') { setCantidadCarrito(0); return }
    fetch('/api/carrito')
      .then(r => r.json())
      .then((items: { cantidad: number }[]) => {
        if (Array.isArray(items)) setCantidadCarrito(items.reduce((s, i) => s + i.cantidad, 0))
      })
      .catch(() => {})
  }, [status])

  useEffect(() => {
    let mounted = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status !== 'loading' && mounted) cargarCarrito()
    const handler = () => { if (mounted) cargarCarrito() }
    window.addEventListener('cart-updated', handler)
    window.addEventListener('storage', handler)
    return () => { mounted = false; window.removeEventListener('cart-updated', handler); window.removeEventListener('storage', handler) }
  }, [cargarCarrito, status])

  useEffect(() => {
    if (!autenticado) return
    fetch('/api/usuario/mensajes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setNoLeidos(data.filter((m: { leido: boolean }) => !m.leido).length) })
      .catch(() => {})
  }, [autenticado])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setCantidadCarrito(0)
    router.push('/')
    setMenuOpen(false)
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition flex-shrink-0">
            <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
              {config.cargandoConfig ? (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <Image key={config.logo_src} src={config.logo_src} alt={config.nombre} fill className="object-contain" sizes="80px" priority />
              )}
            </div>
            <div className="hidden sm:block">
              {config.cargandoConfig ? (
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                  <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                </div>
              ) : (
                <>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">{config.nombre}</h1>
                  <p className="text-xs md:text-sm text-pink-600 dark:text-pink-400 font-medium">{config.eslogan}</p>
                </>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 flex-1 ml-10">
            {['/', '/servicios', '/cursos', '/catalogo', '/nosotros'].map((href, i) => (
              <Link key={href} href={href}
                className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 font-medium transition text-sm">
                {['Inicio','Servicios','Cursos','Tienda','Nosotros'][i]}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-3">

            <ThemeToggle />

            {autenticado && (
              <>
                <Link href="/perfil" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700">
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
                <Link href="/favoritos" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700">
                  <Heart className="w-5 h-5 md:w-6 md:h-6" />
                </Link>
                <Link href="/mis-mensajes" className="relative text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700">
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  {noLeidos > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {noLeidos}
                    </span>
                  )}
                </Link>
                <Link href="/carrito" className="relative text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                  {cantidadCarrito > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                      {cantidadCarrito > 99 ? '99+' : cantidadCarrito}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout}
                  className="hidden md:inline-block text-xs px-4 py-2 rounded-full border border-pink-200 dark:border-pink-700 hover:bg-pink-50 dark:hover:bg-gray-700 text-pink-600 dark:text-pink-400 font-bold transition uppercase tracking-wider">
                  Cerrar sesión
                </button>
              </>
            )}

            {!autenticado && status !== 'loading' && (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="hidden md:block bg-white dark:bg-gray-800 border border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400 font-bold px-5 py-2 rounded-full transition text-xs uppercase tracking-widest hover:bg-pink-50 dark:hover:bg-gray-700">
                  Ingresar
                </Link>
                <Link href="/register"
                  className="hidden md:block bg-pink-600 hover:bg-pink-700 text-white font-bold px-5 py-2 rounded-full shadow-md transition text-xs uppercase tracking-widest">
                  Registro
                </Link>
              </div>
            )}

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-pink-600 transition p-2 rounded-full hover:bg-pink-50 dark:hover:bg-gray-700">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                      </button>
          </div>
        </div>

        {/* ── Menú móvil ── */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 dark:border-gray-700 py-4 space-y-1">
            {(['/','/servicios','/cursos','/catalogo','/nosotros'] as const).map((href, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-xl transition">
                {'Inicio,Servicios,Cursos,Tienda,Nosotros'.split(',')[i]}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
