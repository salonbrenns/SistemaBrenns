'use client'
import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

export interface VarianteForm {
  id?: number
  codigo: string
  tono: string
  presentacion: string
  precio_costo: string
  precio_venta: string
  stock: string
  activo: boolean
}

const varianteVacia = (): VarianteForm => ({
  codigo: '', tono: '', presentacion: '',
  precio_costo: '', precio_venta: '', stock: '0', activo: true,
})

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition'
const labelClass = 'text-[11px] font-semibold text-gray-500 uppercase tracking-wider'

interface Props {
  readonly initialVariantes?: readonly VarianteForm[];
}

export default function VariantesEditor({ initialVariantes }: Props) {
  const [variantes, setVariantes] = useState<VarianteForm[]>(
    initialVariantes?.length ? [...initialVariantes] : [varianteVacia()]
  )
  const [expandido, setExpandido] = useState<number | null>(0)

  const agregar = () => {
    const idx = variantes.length
    setVariantes(prev => [...prev, varianteVacia()])
    setExpandido(idx)
  }

  const eliminar = (i: number) => {
    if (variantes.length === 1) return
    setVariantes(prev => prev.filter((_, idx) => idx !== i))
    setExpandido(null)
  }

  const actualizar = (i: number, field: keyof VarianteForm, value: string | boolean) => {
    setVariantes(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  const etiqueta = (v: VarianteForm) => {
    const partes = [v.tono, v.presentacion].filter(Boolean)
    if (partes.length) return partes.join(' / ')
    if (v.codigo) return v.codigo
    return 'Sin nombre'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
          Variantes{' '}
          <span className="font-normal text-gray-400">({variantes.length})</span>
        </p>
        <button
          type="button"
          onClick={agregar}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar variante
        </button>
      </div>

      {variantes.length === 0 && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Debes tener al menos una variante para guardar el producto.
        </div>
      )}

      <div className="space-y-2">
        {variantes.map((v, i) => (
          <div key={v.id ?? `nueva-${i}`} className="border border-gray-200 rounded-xl overflow-hidden">

            {/* ── Cabecera: fila flex — botón acordeón y botón eliminar son hermanos ── */}
            <div className="flex items-center bg-gray-50 hover:bg-rose-50 transition-colors">

              {/* Botón acordeón ocupa todo el espacio disponible */}
              <button
                type="button"
                className="flex-1 flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandido(expandido === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${v.activo ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <span className="text-sm font-semibold text-gray-700">{etiqueta(v)}</span>
                  {v.precio_venta && (
                    <span className="text-xs text-gray-400">
                      ${Number(v.precio_venta).toLocaleString('es-MX')} · {v.stock} uds.
                    </span>
                  )}
                </div>
                <span className="ml-2">
                  {expandido === i
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />
                  }
                </span>
              </button>

              {/* Botón eliminar: hermano del acordeón, nunca anidado dentro */}
              {variantes.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminar(i)}
                  className="p-3 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Eliminar variante"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Inputs ocultos */}
            {v.id && <input type="hidden" name={`variante_id_${i}`} value={v.id} />}
            <input type="hidden" name={`variante_codigo_${i}`}       value={v.codigo} />
            <input type="hidden" name={`variante_tono_${i}`}         value={v.tono} />
            <input type="hidden" name={`variante_presentacion_${i}`} value={v.presentacion} />
            <input type="hidden" name={`variante_precio_costo_${i}`} value={v.precio_costo} />
            <input type="hidden" name={`variante_precio_venta_${i}`} value={v.precio_venta} />
            <input type="hidden" name={`variante_stock_${i}`}        value={v.stock} />
            <input type="hidden" name={`variante_activo_${i}`}       value={String(v.activo)} />

            {expandido === i && (
              <div className="p-4 grid grid-cols-2 gap-3 bg-white">

                <div className="space-y-1">
                  <label htmlFor={`tono_${i}`} className={labelClass}>Tono / Color</label>
                  <input
                    id={`tono_${i}`}
                    type="text"
                    placeholder="Ej. Rosa Nude"
                    value={v.tono}
                    onChange={e => actualizar(i, 'tono', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`presentacion_${i}`} className={labelClass}>Presentación</label>
                  <input
                    id={`presentacion_${i}`}
                    type="text"
                    placeholder="Ej. 15ml, 50g"
                    value={v.presentacion}
                    onChange={e => actualizar(i, 'presentacion', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`codigo_${i}`} className={labelClass}>Código</label>
                  <input
                    id={`codigo_${i}`}
                    type="text"
                    placeholder="Ej. GEL-NUDE-15"
                    value={v.codigo}
                    onChange={e => actualizar(i, 'codigo', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`stock_${i}`} className={labelClass}>Stock *</label>
                  <input
                    id={`stock_${i}`}
                    type="number"
                    min="0"
                    placeholder="0"
                    value={v.stock}
                    onChange={e => actualizar(i, 'stock', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor={`precio_costo_${i}`} className={labelClass}>Precio Costo *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id={`precio_costo_${i}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={v.precio_costo}
                      onChange={e => actualizar(i, 'precio_costo', e.target.value)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor={`precio_venta_${i}`} className={labelClass}>Precio Venta *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      id={`precio_venta_${i}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={v.precio_venta}
                      onChange={e => actualizar(i, 'precio_venta', e.target.value)}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={v.activo}
                        onChange={e => actualizar(i, 'activo', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-rose-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Variante activa</span>
                  </label>
                </div>

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}