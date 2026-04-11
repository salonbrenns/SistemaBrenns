'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import {
  HomeIcon,
  TagIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BellIcon,
  SparklesIcon,
  CogIcon,
  ChevronDownIcon,
  
} from '@heroicons/react/24/outline';

export default function NavLinks({
  mobile = false,
  onLinkClick,
}: {
  mobile?: boolean;
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [openSections, setOpenSections] = useState<string[]>(['Principal']);

  const toggleSection = (title: string) => {
    if (openSections.includes(title)) {
      setOpenSections(openSections.filter(s => s !== title));
    } else {
      setOpenSections([...openSections, title]);
    }
  };

  // Menú para Empleado
  if (role === "EMPLEADO") {
    const linksEmpleado = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
      { name: 'Agendar', href: '/admin/agendar', icon: CalendarDaysIcon },
      { name: 'Citas', href: '/admin/citas', icon: CalendarDaysIcon },
      { name: 'Notificaciones', href: '/admin/notificaciones', icon: BellIcon },
    ];

    return (
      <nav className="flex flex-col space-y-1 px-2">
        {linksEmpleado.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href);

          return (
            <Link
              key={link.name}
              href={link.href}
              onClick={onLinkClick}
              className={clsx(
                'flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors',
                isActive ? 'bg-pink-700 text-white' : 'text-pink-100 hover:bg-pink-800 hover:text-white'
              )}
            >
              <LinkIcon className="h-5 w-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Menú Accordion para Admin (Con tu cambio de PEDIDOS incluido)
  const menuSections = [
    {
      title: "Principal",
      icon: HomeIcon,
      links: [
        { name: 'Dashboard', href: '/admin/dashboard' },
      ]
    },
    {
      title: "Catálogo",
      icon: TagIcon,
      links: [
        { name: 'Marcas', href: '/admin/marcas' },
        { name: 'Categorías', href: '/admin/categorias' },
        { name: 'Productos', href: '/admin/productos' },
        { name: 'Servicios', href: '/admin/servicios' },
      ]
    },
    {
      title: "Agenda y Citas",
      icon: CalendarDaysIcon,
      links: [
        { name: 'Agendar', href: '/admin/agendar' },
        { name: 'Citas', href: '/admin/citas' },
        { name: 'Horarios', href: '/admin/horarios' },
        { name: 'Días Bloqueados', href: '/admin/dias-bloqueados' },
      ]
    },
    {
      title: "Cursos",
      icon: AcademicCapIcon,
      links: [
        { name: 'Cursos', href: '/admin/cursos' },
      ]
    },
    {
      title: "Ventas y Marketing",
      icon: SparklesIcon,
      links: [
        { name: 'Pedidos', href: '/admin/pedidos' }, 
        { name: 'Promociones', href: '/admin/promociones' },
        { name: 'Pagos', href: '/admin/pagos' },
        { name: 'Reportes', href: '/admin/reportes' },
        { name: 'Estadísticas', href: '/admin/estadisticas' },
      ]
    },
    {
      title: "Configuración",
      icon: CogIcon,
      links: [
        { name: 'Configuración', href: '/admin/configuracion' },
        { name: 'Notificaciones', href: '/admin/notificaciones' },
        { name: 'Roles', href: '/admin/roles' },
        { name: 'FAQ y Políticas', href: '/admin/politicas' },
      ]
    },
  ];

  return (
    <nav className="flex flex-col px-2 space-y-6">
      {menuSections.map((section) => {
        const isOpen = openSections.includes(section.title);
        const Icon = section.icon;
        const hasActiveLink = section.links.some(link => 
          pathname === link.href || pathname.startsWith(link.href)
        );

        return (
          <div key={section.title} className="space-y-1">
            <button
              onClick={() => toggleSection(section.title)}
              className={clsx(
                "flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition-colors",
                hasActiveLink || isOpen ? "text-white bg-pink-800" : "text-pink-100 hover:bg-pink-800/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{section.title}</span>
              </div>
              <ChevronDownIcon 
                className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")} 
              />
            </button>

            {isOpen && (
              <div className="ml-4 space-y-1 border-l border-pink-700 pl-4">
                {section.links.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={onLinkClick}
                      className={clsx(
                        'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors',
                        isActive 
                          ? 'bg-pink-700 text-white' 
                          : 'text-pink-100 hover:bg-pink-800 hover:text-white'
                      )}
                    >
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}