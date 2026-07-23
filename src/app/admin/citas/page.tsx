// src/app/admin/citas/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CitasTable, { type RiesgoCita } from '@/components/citas/table'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Citas',
  description: 'Gestión de citas del salón',
}

type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

const ML_URL = process.env.ML_SERVICE_URL ?? 'http://127.0.0.1:8000'

/**
 * Consulta el riesgo de cancelación (Solución 2, modelo_citas.pkl) para varias
 * citas de un solo golpe. Si el microservicio no responde a tiempo (o está
 * apagado), se devuelve un mapa vacío y el panel sigue funcionando sin la
 * columna de riesgo (misma filosofía de respaldo que /api/recomendaciones).
 */
async function consultarRiesgoLote(citaIds: number[]): Promise<Map<number, RiesgoCita>> {
  const mapa = new Map<number, RiesgoCita>()
  if (citaIds.length === 0) return mapa

  try {
    const ctrl = new AbortController()
    const timeout = setTimeout(() => ctrl.abort(), 3000)
    const res = await fetch(`${ML_URL}/riesgo-cancelacion/lote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cita_ids: citaIds }),
      signal: ctrl.signal,
      cache: 'no-store',
    })
    clearTimeout(timeout)
    if (!res.ok) return mapa
    const data = await res.json()
    if (Array.isArray(data.resultados)) {
      for (const r of data.resultados as RiesgoCita[]) mapa.set(r.cita_id, r)
    }
  } catch {
    // ml-service apagado o lento: la tabla se muestra igual, sin riesgo.
  }
  return mapa
}

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string }>
}) {
  const params = await searchParams
  const estado = params.estado as EstadoCita | undefined
  const desde  = params.desde || ''
  const hasta  = params.hasta || ''

  const where: Record<string, unknown> = {}

  if (estado) where.estado = estado

  if (desde || hasta) {
    where.fecha = {
      ...(desde && { gte: new Date(`${desde}T00:00:00.000Z`) }),
      ...(hasta && { lte: new Date(`${hasta}T23:59:59.999Z`) }),
    }
  }

  const citasRaw = await prisma.cita.findMany({
    where,
    include: {
      usuario:  { select: { id: true, nombre: true, correo: true, telefono: true } },
      servicio: { select: { nombre: true, precio: true } },
    },
    orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
  })

  // Riesgo de cancelación (Solución 2): solo tiene sentido para citas futuras
  // aún no resueltas — mismo criterio que usa el modelo en desarrollo_citas.ipynb.
  const ahora = new Date()
  const idsAplican = citasRaw
    .filter(c => (c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA') && c.fecha >= ahora)
    .map(c => c.id)
  const riesgos = await consultarRiesgoLote(idsAplican)

  const citas = citasRaw.map(c => ({
    ...c,
    fecha:        c.fecha.toISOString(),
    createdAt:    c.createdAt.toISOString(),
    cancelado_en: c.cancelado_en ? c.cancelado_en.toISOString() : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    estado_cita:  (c as any).estado_cita ?? c.estado,
    servicio: { ...c.servicio, precio: Number(c.servicio.precio) },
    usuario: c.usuario ?? null,
    riesgo: riesgos.get(c.id) ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Citas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona las reservaciones de los clientes
        </p>
      </div>

      <CitasTable
        citas={citas}
        estadoFiltro={estado || ''}
        desdeFiltro={desde}
        hastaFiltro={hasta}
      />
    </div>
  )
}