'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { TagIcon, SparklesIcon } from '@heroicons/react/24/outline';

import CategoriaTable from '@/components/categorias/table';
import CategoriaServicioTable from '@/components/categorias-servicios/table';

type Tab = 'productos' | 'servicios';

type CatProducto = { id: number; nombre: string; activo: boolean };
type CatServicio = {
  id: number;
  nombre: string;
  activo: boolean;
  _count: { servicios: number };
};

export default function CategoriasClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get('tab') as Tab) || 'productos';
  const query = searchParams.get('query') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [tab, setTab] = useState<Tab>(tabParam);

  const [catProductos, setCatProductos] = useState<CatProducto[]>([]);
  const [totalPagesP, setTotalPagesP] = useState(1);
  const [cargandoP, setCargandoP] = useState(false);

  const [catServicios, setCatServicios] = useState<CatServicio[]>([]);
  const [totalPagesS, setTotalPagesS] = useState(1);
  const [cargandoS, setCargandoS] = useState(false);

  const cambiarTab = (nueva: Tab) => {
    setTab(nueva);
    const params = new URLSearchParams();
    params.set('tab', nueva);
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  const cargarProductos = useCallback(() => {
    setCargandoP(true);
    fetch(`/api/admin/categorias?query=${encodeURIComponent(query)}&page=${page}`)
      .then(r => r.json())
      .then(data => {
        setCatProductos(Array.isArray(data.categorias) ? data.categorias : []);
        setTotalPagesP(data.totalPages ?? 1);
      })
      .catch(() => setCatProductos([]))
      .finally(() => setCargandoP(false));
  }, [query, page]);

  const cargarServicios = useCallback(() => {
    setCargandoS(true);
    fetch(`/api/admin/categorias-servicios-lista?query=${encodeURIComponent(query)}&page=${page}`)
      .then(r => r.json())
      .then(data => {
        setCatServicios(Array.isArray(data.categorias) ? data.categorias : []);
        setTotalPagesS(data.totalPages ?? 1);
      })
      .catch(() => setCatServicios([]))
      .finally(() => setCargandoS(false));
  }, [query, page]);

  useEffect(() => {
    if (tab === 'productos') cargarProductos();
  }, [tab, cargarProductos]);

  useEffect(() => {
    if (tab === 'servicios') cargarServicios();
  }, [tab, cargarServicios]);

  // Sincronizar tab con la URL
  useEffect(() => {
    setTab(tabParam);
  }, [tabParam]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900">Categorías</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las categorías de productos y servicios para Brenn’s
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        <button
          onClick={() => cambiarTab('productos')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
            tab === 'productos'
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-transparent text-gray-500 hover:text-pink-500'
          }`}
        >
          <TagIcon className="w-4 h-4" />
          Categorías de productos
        </button>
        <button
          onClick={() => cambiarTab('servicios')}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
            tab === 'servicios'
              ? 'border-pink-600 text-pink-600 bg-pink-50'
              : 'border-transparent text-gray-500 hover:text-pink-500'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          Categorías de servicios
        </button>
      </div>

      {/* Buscador */}
      <input
        type="text"
        defaultValue={query}
        key={tab}
        placeholder={
          tab === 'productos'
            ? 'Buscar categorías de productos...'
            : 'Buscar categorías de servicios...'
        }
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          params.set('query', e.target.value);
          params.set('page', '1');
          params.set('tab', tab);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400"
      />

      {/* Contenido pestaña productos */}
      {tab === 'productos' && (
        cargandoP ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CategoriaTable
            categorias={catProductos}
            currentPage={page}
            totalPages={totalPagesP}
          />
        )
      )}

      {/* Contenido pestaña servicios */}
      {tab === 'servicios' && (
        cargandoS ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <CategoriaServicioTable
            categorias={catServicios}
            currentPage={page}
            totalPages={totalPagesS}
          />
        )
      )}
    </div>
  );
}