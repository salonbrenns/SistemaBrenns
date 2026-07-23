import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CitasTable from '@/components/citas/table'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Mis Citas',
  description: 'Citas asignadas a este empleado',
}

const PAGE_SIZE = 15

type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; desde?: string; hasta?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const empleadoId = Number(session.user.id)

  const params  = await searchParams
  const estado  = params.estado as EstadoCita | undefined
  const desde   = params.desde || ''
  const hasta   = params.hasta || ''
  const pageNum = Math.max(1, Number(params.page) || 1)

  const where: Record<string, unknown> = {
    empleado_id: empleadoId,
  }

  if (estado) where.estado = estado

  if (desde || hasta) {
    where.fecha = {
      ...(desde && { gte: new Date(`${desde}T00:00:00.000Z`) }),
      ...(hasta && { lte: new Date(`${hasta}T23:59:59.999Z`) }),
    }
  }

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
    total:        c.total ? Number(c.total) : 0,
    fecha:        c.fecha.toISOString(),
    createdAt:    c.createdAt.toISOString(),
    cancelado_en: c.cancelado_en ? c.cancelado_en.toISOString() : null,
    estado_cita:  c.estado_cita ?? c.estado,
    servicio: { ...c.servicio, precio: Number(c.servicio.precio) },
    usuario:  c.usuario ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Mis Citas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Citas asignadas a tu perfil</p>
      </div>
      <CitasTable
        citas={citas}
        estadoFiltro={estado ?? ''}
        desdeFiltro={desde}
        hastaFiltro={hasta}
        totalCitas={totalCitas}
        paginaActual={pageNum}
        porPagina={PAGE_SIZE}
      />
    </div>
  )
}
