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

type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; fecha?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const empleadoId = Number(session.user.id)

  const params = await searchParams
  const estado = params.estado as EstadoCita | undefined
  const fecha  = params.fecha  || ''

  const where: Record<string, unknown> = {
    empleado_id: empleadoId,   // solo las citas asignadas a este empleado
  }

  if (estado) {
    where.estado = estado
  }

  if (fecha) {
    const fechaInicio = new Date(`${fecha}T00:00:00.000Z`)
    const fechaFin    = new Date(`${fecha}T23:59:59.999Z`)
    where.fecha = { gte: fechaInicio, lte: fechaFin }
  }

  const citasRaw = await prisma.cita.findMany({
    where,
    include: {
      usuario:  { select: { nombre: true, correo: true, telefono: true } },
      servicio: { select: { nombre: true, precio: true } },
    },
    orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
  })

  const citas = citasRaw.map(c => ({
    ...c,
    fecha:        c.fecha.toISOString(),
    createdAt:    c.createdAt.toISOString(),
    cancelado_en: c.cancelado_en ? c.cancelado_en.toISOString() : null,
    servicio: {
      ...c.servicio,
      precio: Number(c.servicio.precio),
    },
    usuario: c.usuario ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Mis Citas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Citas asignadas a tu perfil</p>
      </div>
      <CitasTable citas={citas} estadoFiltro={estado ?? ''} desdeFiltro={fecha ?? ''} hastaFiltro={fecha ?? ''} />
    </div>
  )
}
