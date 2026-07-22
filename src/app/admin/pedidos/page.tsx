'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
import { Package, Loader2, ChevronDown, ChevronUp, CheckCircle, XCircle, Truck, Package2, ClipboardCheck, FileImage } from 'lucide-react'
import Paginacion from '@/components/ui/paginacion'
import DropdownAcciones, { DropdownItem, DropdownSeparator } from '@/components/ui/DropdownAcciones'

type Detalle = {
  nombre_producto: string
  descripcion_variante: string | null
  cantidad: number
  precio_unitario: number
  subtotal: number
}

interface PedidoAdmin {
  id: number
  estado: string
  total: number
  nombre_cliente: string
  correo_cliente: string
  fecha_pedido: string
  total_items: number
  comprobante_url: string | null
  usuario: { nombre: string; correo: string } | null
  detalles: Detalle[]
}

const ESTADOS = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-amber-100  dark:bg-amber-900/30 text-amber-700  dark:text-amber-400',
  PAGADO:     'bg-blue-100   dark:bg-blue-900/30  text-blue-700   dark:text-blue-400',
  ENVIADO:    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  ENTREGADO:  'bg-green-100  dark:bg-green-900/30 text-green-700  dark:text-green-400',
  CANCELADO:  'bg-red-100    dark:bg-red-900/30   text-red-600    dark:text-red-400',
}

export default function AdminPedidosPage() {
  const [pedidos,      setPedidos]      = useState<PedidoAdmin[]>([])
  const [cargando,     setCargando]     = useState(true)
  const [filtro,       setFiltro]       = useState('TODOS')
  const [abierto,      setAbierto]      = useState<number | null>(null)
  const [pagina,       setPagina]       = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [total,        setTotal]        = useState(0)

  const cargar = useCallback((p: number, f: string) => {
    setCargando(true)
    const params = new URLSearchParams({ page: String(p) })
    if (f !== 'TODOS') params.set('estado', f)
    fetch(`/api/admin/pedidos?${params}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        setPedidos(data.pedidos ?? [])
        setTotalPaginas(data.totalPaginas ?? 1)
        setTotal(data.total ?? 0)
      })
      .catch(() => setPedidos([]))
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => { cargar(pagina, filtro) }, [cargar, pagina, filtro])

  const cambiarEstado = async (id: number, estado: string) => {
    await fetch('/api/admin/pedidos', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado }),
    })
    cargar(pagina, filtro)
  }

  const cambiarFiltro = (f: string) => {
    setFiltro(f)
    setPagina(1)
    setAbierto(null)
  }

  const irAPagina = (p: number) => {
    setPagina(p)
    setAbierto(null)
  }

  if (cargando && pedidos.length === 0) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="w-7 h-7 text-rose-600" />
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Pedidos</h1>
        <span className="text-sm text-gray-400 font-semibold">({total} total)</span>
        {cargando && <Loader2 className="w-4 h-4 text-rose-400 animate-spin" />}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['TODOS', ...ESTADOS].map(e => (
          <button key={e} onClick={() => cambiarFiltro(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              filtro === e
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-700'
            }`}>
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-rose-900 dark:bg-rose-950">
            <tr>
              {['#Pedido', 'Cliente', 'Artículos', 'Total', 'Fecha', 'Estado', 'Comprobante', 'Acción'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  No hay pedidos
                </td>
              </tr>
            )}

            {pedidos.map(pedido => (
              <Fragment key={pedido.id}>

                {/* FILA PRINCIPAL */}
                <tr className="hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-5 py-4 font-black">
                    <button
                      onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                      className="flex items-center gap-1"
                    >
                      #{String(pedido.id).padStart(6, '0')}
                      {abierto === pedido.id
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{pedido.nombre_cliente}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{pedido.correo_cliente}</p>
                  </td>

                  <td className="px-5 py-4 text-gray-900 dark:text-white">{pedido.total_items}</td>

                  <td className="px-5 py-4 font-black text-gray-900 dark:text-white">
                    ${pedido.total.toLocaleString('es-MX')}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ESTADO_STYLE[pedido.estado]}`}>
                      {pedido.estado}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {pedido.comprobante_url ? (
                      <a
                        href={pedido.comprobante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <FileImage className="w-4 h-4" /> Ver
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <DropdownAcciones>
                      {pedido.estado !== 'PAGADO' && (
                        <DropdownItem onClick={() => cambiarEstado(pedido.id, 'PAGADO')}
                          icon={<CheckCircle className="w-4 h-4" />} label="Marcar pagado" />
                      )}
                      {pedido.estado !== 'ENVIADO' && (
                        <DropdownItem onClick={() => cambiarEstado(pedido.id, 'ENVIADO')}
                          icon={<Truck className="w-4 h-4" />} label="Marcar enviado" />
                      )}
                      {pedido.estado !== 'ENTREGADO' && (
                        <DropdownItem onClick={() => cambiarEstado(pedido.id, 'ENTREGADO')}
                          icon={<Package2 className="w-4 h-4" />} label="Marcar entregado" />
                      )}
                      {pedido.estado !== 'PENDIENTE' && (
                        <DropdownItem onClick={() => cambiarEstado(pedido.id, 'PENDIENTE')}
                          icon={<ClipboardCheck className="w-4 h-4" />} label="Volver a pendiente" />
                      )}
                      {pedido.estado !== 'CANCELADO' && <DropdownSeparator />}
                      {pedido.estado !== 'CANCELADO' && (
                        <DropdownItem onClick={() => cambiarEstado(pedido.id, 'CANCELADO')}
                          icon={<XCircle className="w-4 h-4" />} label="Cancelar pedido" danger />
                      )}
                    </DropdownAcciones>
                  </td>
                </tr>

                {/* DETALLE */}
                {abierto === pedido.id && (
                  <tr>
                    <td colSpan={8} className="bg-rose-50 dark:bg-gray-700/30 p-3">
                      <DetailPedido detalles={pedido.detalles} />
                    </td>
                  </tr>
                )}

              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onChange={irAPagina}
      />
    </div>
  )
}

function DetailPedido({ detalles }: { readonly detalles: Detalle[] }) {
  return (
    <div className="space-y-1">
      {detalles.map((d) => (
        <div
          key={`${d.nombre_producto}-${d.descripcion_variante}`}
          className="flex justify-between text-xs bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600"
        >
          <span>
            {d.nombre_producto}
            {d.descripcion_variante && ` · ${d.descripcion_variante}`}
          </span>
          <span>x{d.cantidad}</span>
          <span>${d.subtotal.toLocaleString('es-MX')}</span>
        </div>
      ))}
    </div>
  )
}
