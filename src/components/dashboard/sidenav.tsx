'use client';

import Link from 'next/link';
import NavLinks from './nav-links';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ui/ThemeProvider';

function ThemeToggle({ mobile }: { mobile: boolean }) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: 'light',  label: 'Claro',   Icon: Sun     },
    { value: 'dark',   label: 'Oscuro',  Icon: Moon    },
    { value: 'system', label: 'Sistema', Icon: Monitor },
  ] as const

  if (mobile) {
    const current = options.find(o => o.value === theme) ?? options[2]
    const next = options[(options.indexOf(current) + 1) % options.length]
    return (
      <button
        onClick={() => setTheme(next.value)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        <current.Icon className="h-5 w-5" />
        <span>{current.label}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center justify-between rounded-lg bg-pink-800 px-3 py-2 mb-2">
      <span className="text-xs font-medium text-pink-200">Tema</span>
      <div className="flex gap-1">
        {options.map(({ value, Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={value}
            className={`p-1.5 rounded-md transition-colors ${
              theme === value
                ? 'bg-white/20 text-white'
                : 'text-pink-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SideNav({
  mobile = false,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const handleLogout = async () => {
    if (onClose) onClose();
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className={mobile ? 'p-3 space-y-4' : 'flex h-full flex-col border-r border-pink-200 bg-pink-900 text-white'}>
      {!mobile && (
        <Link href="/admin/dashboard" className="flex h-24 items-center justify-center p-4">
          <div className="text-2xl font-bold tracking-wide">Brenn&apos;s Beauty</div>
        </Link>
      )}

      <div className={mobile ? 'space-y-2' : 'flex grow flex-col justify-between px-3 py-4'}>
        <NavLinks mobile={mobile} onLinkClick={onClose} />

        <div className="space-y-2 mt-4">
          {/* Toggle de tema */}
          <ThemeToggle mobile={mobile} />

          {/* Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className={
              mobile
                ? 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100'
                : 'flex w-full items-center gap-3 rounded-lg p-3 text-sm font-medium bg-pink-800 hover:bg-pink-700 transition-colors'
            }
          >
            <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}