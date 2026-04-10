'use client';

import { useState, useRef, useEffect } from 'react';
import SideNav from './sidenav';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-pink-50">
      {/* Header móvil */}
      <header className="flex items-center justify-between p-4 bg-pink-900 text-white lg:hidden">
        <h1 className="font-bold text-lg">{"Brenn&apos;s Beauty"}</h1>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md hover:bg-pink-800"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 right-4 z-50 w-52 rounded-lg bg-white text-sm shadow-lg"
          >
            <SideNav mobile onClose={() => setIsMenuOpen(false)} />
          </div>
        )}
      </header>

      {/* Sidebar escritorio */}
      <div className="hidden lg:block w-64 flex-none">
        <SideNav />
      </div>

      {/* Contenido */}
      <main className="flex-grow p-4 lg:overflow-y-auto lg:p-8 bg-white">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}