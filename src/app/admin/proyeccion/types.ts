// src/app/admin/proyeccion/types.ts

export interface ProductoFila {
  id:             number
  nombre:         string
  imagen:         string[] | null
  categoria:      string | null
  marca:          string | null
  stock_total:    number
  ventas_totales: number
  precio_min:     number | null
}

export interface PeriodoVenta {
  periodo: string
  total:   number
}

export interface ProyeccionData {
  historico:  PeriodoVenta[]
  proyectado: PeriodoVenta[]
  formula:    { P0: number; k: number; periodos: number }
}

export interface FiltroOpcion {
  id:     number
  nombre: string
}

// ── Helpers exportados para usar en cualquier componente ──────────────────────
export function primeraImagen(imagen: string[] | null): string | null {
  if (!imagen || imagen.length === 0) return null
  return imagen[0]
}


export function calcularIngresoProyectado(
  proxPeriodo: number,
  precioMin: number | null
): number | null {
  if (!precioMin || proxPeriodo === 0) return null
  return proxPeriodo * precioMin
}

// Nueva función para mostrar periodos legibles
export function formatearPeriodo(periodo: string): string {
  // Semana: "2026-W15" → "Semana 15 (2026)"
  if (periodo.includes('-W')) {
    const [anio, semStr] = periodo.split('-W')
    return `Semana ${Number(semStr)} (${anio})`
  }
  // Día: "2026-04-12" → "12 abr 2026"
  if (periodo.length === 10 && periodo.includes('-')) {
    const [anio, mes, dia] = periodo.split('-')
    const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    return `${Number(dia)} ${meses[Number(mes) - 1]} ${anio}`
  }
  // Mes: "2026-04" → "Abril 2026"
  if (periodo.length === 7) {
    const [anio, mes] = periodo.split('-')
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    return `${meses[Number(mes) - 1]} ${anio}`
  }
  return periodo
}
export function calcularPuntoReorden(historico: PeriodoVenta[]): number {
  if (historico.length === 0) return 0
  const promedio = historico.reduce((s, p) => s + p.total, 0) / historico.length
  return Math.ceil(promedio * 1.2)
}