'use client';

import Link from 'next/link';
import NavLinks from './nav-links';
import { ArrowLeftEndOnRectangleIcon } from '@heroicons/react/24/outline';
import { signOut } from 'next-auth/react';

export default function SideNav({
  mobile = false,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const handleLogout = async () => {
    if (onClose) onClose();
    await signOut({ callbackUrl: '/login' }); // Redirige al login después de cerrar sesión
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

        {/* Botón Cerrar Sesión */}
        <button
          onClick={handleLogout}
          className={
            mobile
              ? 'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100'
              : 'flex items-center gap-3 rounded-lg p-3 text-sm font-medium bg-pink-800 hover:bg-pink-700 transition-colors'
          }
        >
          <ArrowLeftEndOnRectangleIcon className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}