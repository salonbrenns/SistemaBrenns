import { Suspense } from 'react';
import CategoriasClient from './CategoriasClient';

function LoadingCategorias() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-pink-600 font-medium">Cargando categorías de Brenn’s...</p>
    </div>
  );
}

export default function CategoriasPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Suspense fallback={<LoadingCategorias />}>
        <CategoriasClient />
      </Suspense>
    </div>
  );
}