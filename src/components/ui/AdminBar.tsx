'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Eye } from 'lucide-react'

// Páginas públicas donde mostrar la barra
const PAGINAS_PUBLICAS = ['/', '/catalogo', '/servicios', '/cursos', '/nosotros', '/carrito', '/checkout', '/perfil', '/mis-pedidos', '/agendar', '/favoritos']

export default function AdminBar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  // Solo mostrar si es admin/empleado/docente y está en una página pública
  const rol = (session?.user as { rol?: string })?.rol
  const esStaff = rol === 'ADMIN' || rol === 'EMPLEADO'
  const enPaginaPublica = PAGINAS_PUBLICAS.some(p => pathname === p || pathname.startsWith('/producto') || pathname.startsWith('/servicio') || pathname.startsWith('/curso') || pathname.startsWith('/mis-pedidos') || pathname.startsWith('/pedido'))

  if (!esStaff || !enPaginaPublica) return null

  const panelHref = rol === 'EMPLEADO' ? '/empleado/citas' : '/admin/dashboard'
  const rolLabel  = rol === 'ADMIN' ? 'Administrador' : 'Empleado'

  return (
    <div className="bg-gray-900 text-white text-xs py-2 px-4 flex items-center justify-between gap-4 sticky top-0 z-[100]">
      <div className="flex items-center gap-2 text-gray-300">
        <Eye className="w-3.5 h-3.5 text-pink-400" />
        <span>
          <span className="text-pink-400 font-bold">{rolLabel}</span>
          {' '}· Vista previa del sitio como cliente
        </span>
      </div>
      <Link
        href={panelHref}
        className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold px-3 py-1 rounded-full transition text-[11px] uppercase tracking-wide"
      >
        <LayoutDashboard className="w-3 h-3" />
        Ir al panel
      </Link>
    </div>
  )
}
