// src/components/admin/NavLinks.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import clsx from 'clsx'
import {
  HomeIcon,
  TagIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BellIcon,
  SparklesIcon,
  CogIcon,
  ChevronDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function NavLinks({
  onLinkClick,
}: {
  mobile?: boolean
  onLinkClick?: () => void
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: string })?.role

  const [openSection, setOpenSection] = useState<string | null>("Principal")

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title)
  }

  // ── Menú EMPLEADO ──────────────────────────────────────────────────────────
  if (role === "EMPLEADO") {
    const linksEmpleado = [
      { name: 'Dashboard',      href: '/admin/dashboard',      icon: HomeIcon        },
      { name: 'Agendar',        href: '/admin/agendar',        icon: CalendarDaysIcon },
      { name: 'Citas',          href: '/admin/citas',          icon: CalendarDaysIcon },
      { name: 'Mi horario',     href: '/admin/mi-horario',     icon: ClockIcon       },
      { name: 'Notificaciones', href: '/admin/notificaciones', icon: BellIcon        },
    ]

    return (
      <nav className="flex flex-col space-y-1 px-2">
        {linksEmpleado.map((link) => {
          const LinkIcon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onLinkClick}
              className={clsx(
                'flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-pink-500/20 text-white border-l-4 border-pink-400'
                  : 'text-pink-100 hover:bg-white/10 hover:text-white'
              )}
            >
              <LinkIcon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>
    )
  }

  // ── Menú ADMIN ─────────────────────────────────────────────────────────────
  const menuSections = [
    {
      title: "Principal",
      icon: HomeIcon,
      links: [
        { name: 'Dashboard', href: '/admin/dashboard' },
      ],
    },
    {
      title: "Catálogo",
      icon: TagIcon,
      links: [
        { name: 'Marcas',                  href: '/admin/marcas'               },
        { name: 'Categorías',              href: '/admin/categorias'           },
        { name: 'Productos',               href: '/admin/productos'            },
        { name: 'Servicios',               href: '/admin/servicios'            },

      ],
    },
    {
      title: "Agenda y Citas",
      icon: CalendarDaysIcon,
      links: [
        { name: 'Agendar',         href: '/admin/agendar'         },
        { name: 'Citas',           href: '/admin/citas'           },
        { name: 'Horarios',        href: '/admin/horarios'        },
        { name: 'Días Bloqueados', href: '/admin/dias-bloqueados' },
        { name: 'Mi horario',      href: '/admin/mi-horario'      },
      ],
    },
    {
      title: "Cursos",
      icon: AcademicCapIcon,
      links: [
        { name: 'Cursos', href: '/admin/cursos' },
      ],
    },
    {
      title: "Ventas y Marketing",
      icon: SparklesIcon,
      links: [
        { name: 'Pedidos',       href: '/admin/pedidos'      },
        { name: 'Proyección',  href: '/admin/proyeccion' },
        { name: 'Promociones',   href: '/admin/promociones'  },
        { name: 'Pagos',         href: '/admin/pagos'        },
        { name: 'Reportes',      href: '/admin/reportes'     },
        { name: 'Estadísticas',  href: '/admin/estadisticas' },
      ],
    },
    {
      title: "Configuración",
      icon: CogIcon,
      links: [
        { name: 'Configuración',   href: '/admin/configuracion'  },
        { name: 'Notificaciones',  href: '/admin/notificaciones' },
        { name: 'Roles',           href: '/admin/roles'          },
        { name: 'FAQs', href: '/admin/faq'      },
      ],
    },
  ]

  return (
    <nav className="flex flex-col px-2 space-y-1">
      {menuSections.map((section) => {
        const isOpen        = openSection === section.title
        const Icon          = section.icon
        const hasActiveLink = section.links.some(
          link => pathname === link.href || pathname.startsWith(link.href)
        )

        return (
          <div key={section.title} className="flex flex-col">
            <button
              onClick={() => toggleSection(section.title)}
              className={clsx(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isOpen || hasActiveLink
                  ? "bg-white/10 text-white"
                  : "text-pink-100 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={clsx(
                  "h-5 w-5 transition-colors",
                  hasActiveLink ? "text-pink-400" : "text-pink-200"
                )} />
                <span>{section.title}</span>
              </div>
              <ChevronDownIcon className={clsx(
                "h-4 w-4 transition-transform duration-300 opacity-50",
                isOpen && "rotate-180 opacity-100"
              )} />
            </button>

            <div className={clsx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isOpen ? "max-h-[400px] opacity-100 my-1" : "max-h-0 opacity-0"
            )}>
              <div className="ml-9 space-y-1 border-l border-pink-700/40 pl-3">
                {section.links.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={onLinkClick}
                      className={clsx(
                        'block rounded-md px-3 py-2 text-[13px] transition-all',
                        isActive
                          ? 'bg-pink-600 text-white font-semibold shadow-sm'
                          : 'text-pink-200 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {link.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </nav>
  )
}