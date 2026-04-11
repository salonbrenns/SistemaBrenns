'use client'

import { useEffect, useState, Fragment } from 'react'
import { Package, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

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
  usuario: { nombre: string; correo: string } | null
  detalles: Detalle[]
}

const ESTADOS = ['PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE:  'bg-amber-100  text-amber-700',
  PAGADO:     'bg-blue-100   text-blue-700',
  ENVIADO:    'bg-purple-100 text-purple-700',
  ENTREGADO:  'bg-green-100  text-green-700',
  CANCELADO:  'bg-red-100    text-red-600',
}

export default function AdminPedidosPage() {
  const [pedidos,  setPedidos]  = useState<PedidoAdmin[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro,   setFiltro]   = useState('TODOS')
  const [abierto,  setAbierto]  = useState<number | null>(null)

  const cargar = () => {
    fetch('/api/admin/pedidos')
      .then(r => r.json())
      .then(data => setPedidos(Array.isArray(data) ? data : []))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const cambiarEstado = async (id: number, estado: string) => {
    await fetch('/api/admin/pedidos', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, estado }),
    })
    cargar()
  }

  const pedidosFiltrados = filtro === 'TODOS'
    ? pedidos
    : pedidos.filter(p => p.estado === filtro)

  if (cargando) {
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
        <h1 className="text-2xl font-black text-gray-900">Pedidos</h1>
        <span className="text-sm text-gray-400 font-semibold">({pedidos.length} total)</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {['TODOS', ...ESTADOS].map(e => (
          <button key={e} onClick={() => setFiltro(e)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
              filtro === e
                ? 'bg-rose-700 text-white border-rose-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
            }`}>
            {e}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y">
          <thead className="bg-rose-900">
            <tr>
              {['#Pedido', 'Cliente', 'Artículos', 'Total', 'Fecha', 'Estado', 'Acción'].map(h => (
                <th key={h} className="px-5 py-3 text-xs font-bold text-white uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  No hay pedidos
                </td>
              </tr>
            )}

            {pedidosFiltrados.map(pedido => (
              <Fragment key={pedido.id}>

                {/* FILA PRINCIPAL */}
                <tr className="hover:bg-rose-50">
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
                    <p className="font-semibold">{pedido.nombre_cliente}</p>
                    <p className="text-xs text-gray-400">{pedido.correo_cliente}</p>
                  </td>

                  <td className="px-5 py-4">{pedido.total_items}</td>

                  <td className="px-5 py-4 font-black">
                    ${pedido.total.toLocaleString('es-MX')}
                  </td>

                  <td className="px-5 py-4 text-xs text-gray-500">
                    {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${ESTADO_STYLE[pedido.estado]}`}>
                      {pedido.estado}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={pedido.estado}
                      onChange={e => cambiarEstado(pedido.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {ESTADOS.map(e => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                  </td>
                </tr>

                {/* DETALLE */}
                {abierto === pedido.id && (
                  <tr>
                    <td colSpan={7} className="bg-rose-50 p-3">
                      <DetailPedido detalles={pedido.detalles} />
                    </td>
                  </tr>
                )}

              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DetailPedido({ detalles }: { readonly detalles: Detalle[] }) {
  return (
    <div className="space-y-1">
      {detalles.map((d) => (
        <div
          key={`${d.nombre_producto}-${d.descripcion_variante}`}
          className="flex justify-between text-xs bg-white p-2 rounded border"
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