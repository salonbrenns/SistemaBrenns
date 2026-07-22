import { Suspense } from 'react';
import CategoriasClient from './CategoriasClient';
import PageLoader from '@/components/ui/PageLoader';

export default function CategoriasPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Suspense fallback={<PageLoader text="Cargando categorías..." className="py-20" />}>
        <CategoriasClient />
      </Suspense>
    </div>
  );
}
