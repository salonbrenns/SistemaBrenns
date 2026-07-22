// src/app/admin/citas/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CitasTable from '@/components/citas/table'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Citas',
  description: 'Gestión de citas del salón',
}

const PAGE_SIZE = 15

type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string; page?: string }>
}) {
  const params  = await searchParams
  const estado  = params.estado as EstadoCita | undefined
  const desde   = params.desde || ''
  const hasta   = params.hasta || ''
  const pageNum = Math.max(1, Number(params.page) || 1)

  const where: Record<string, unknown> = {}

  if (estado) {
    where.estado = estado
  } else {
    // "Todos" solo muestra activas; CANCELADAS tienen su propio filtro
    where.estado = { notIn: ['CANCELADA'] }
  }

  if (desde || hasta) {
    where.fecha = {
      ...(desde && { gte: new Date(`${desde}T00:00:00.000Z`) }),
      ...(hasta && { lte: new Date(`${hasta}T23:59:59.999Z`) }),
    }
  }

  // Auto-marcar como FINALIZADA las citas de días anteriores que siguen PENDIENTE
  await prisma.$queryRawUnsafe(`
    UPDATE agenda.tblcitas
    SET estado_cita = 'FINALIZADA'
    WHERE estado::text != 'CANCELADA'
      AND (estado_cita IS NULL OR estado_cita::text = 'PENDIENTE')
      AND fecha::date < CURRENT_DATE
  `)

  const [citasRaw, totalCitas] = await Promise.all([
    prisma.cita.findMany({
      where,
      include: {
        usuario:  { select: { nombre: true, correo: true, telefono: true } },
        servicio: { select: { nombre: true, precio: true } },
      },
      orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
      take: PAGE_SIZE,
      skip: (pageNum - 1) * PAGE_SIZE,
    }),
    prisma.cita.count({ where }),
  ])

  const citas = citasRaw.map(c => ({
    ...c,
    total:        Number(c.total),
    fecha:        c.fecha.toISOString(),
    createdAt:    c.createdAt.toISOString(),
    cancelado_en: c.cancelado_en ? c.cancelado_en.toISOString() : null,
    estado_cita:  c.estado_cita ?? c.estado,
    servicio: { ...c.servicio, precio: Number(c.servicio.precio) },
    usuario: c.usuario ?? null,
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
        totalCitas={totalCitas}
        paginaActual={pageNum}
        porPagina={PAGE_SIZE}
      />
    </div>
  )
}