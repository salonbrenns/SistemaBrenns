'use client';

import {
  HomeIcon,
  TagIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  SparklesIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ClockIcon,
  ScissorsIcon,
  BellIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  CogIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
  { name: 'Dashboard',  href: '/admin/dashboard',   icon: HomeIcon         },
  { name: 'Marcas',     href: '/admin/marcas',       icon: TagIcon          },
  { name: 'Categorías', href: '/admin/categorias',   icon: Squares2X2Icon   },
  { name: 'Productos',  href: '/admin/productos',    icon: ShoppingBagIcon  },
  { name: 'Servicios',  href: '/admin/servicios',    icon: SparklesIcon     },
    { name: 'Agendar',    href: '/admin/agendar',      icon: CalendarDaysIcon },
  { name: 'Horarios',   href: '/admin/horarios',     icon: ClockIcon        },
  { name: 'Citas',      href: '/admin/citas',        icon: CalendarDaysIcon },
    { name: 'Días Bloqueados', href: '/admin/dias-bloqueados', icon: CalendarDaysIcon },
  { name: 'Cursos',     href: '/admin/cursos',       icon: AcademicCapIcon  },
  { name: 'Notificaciones', href: '/admin/notificaciones', icon: BellIcon }, 
  { name: 'Estadísticas', href: '/admin/estadisticas', icon: ChartBarIcon },
  { name: 'Promociones',   href: '/admin/promociones',   icon: TagIcon      },
{ name: 'Pagos',         href: '/admin/pagos',          icon: CreditCardIcon },
{ name: 'Reportes',      href: '/admin/reportes',       icon: DocumentTextIcon },
{ name: 'Roles',         href: '/admin/roles',          icon: ShieldCheckIcon },
{ name: 'Configuración', href: '/admin/configuracion',  icon: CogIcon      },
{ name: 'FAQ y Políticas', href: '/admin/politicas',    icon: QuestionMarkCircleIcon },
];

export default function NavLinks({
  mobile = false,
  onLinkClick,
}: {
  mobile?: boolean
  onLinkClick?: () => void
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 px-2">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive =
          pathname === link.href ||
          (link.href !== '/admin/dashboard' && pathname.startsWith(link.href));

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={clsx(
              'flex items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors',
              mobile
                ? isActive
                  ? 'bg-gray-200 text-black'
                  : 'text-gray-800 hover:bg-gray-100'
                : isActive
                ? 'bg-pink-700 text-white'
                : 'text-pink-100 hover:bg-pink-800 hover:text-white'
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