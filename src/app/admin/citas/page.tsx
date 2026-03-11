// src/app/admin/citas/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CitasTable from '@/components/citas/table'

export const metadata: Metadata = {
  title: 'Citas',
  description: 'Gestión de citas del salón',
}

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; fecha?: string }>
}) {
  const params = await searchParams
  const estado = params.estado || ''
  const fecha  = params.fecha  || ''

  const where: any = {}
  if (estado) where.estado = estado
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
    fecha:           c.fecha.toISOString(),
    createdAt:       c.createdAt.toISOString(),
    servicio: {
      ...c.servicio,
      precio: Number(c.servicio.precio),
    },
      usuario: c.usuario ?? null,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900">Citas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona las reservaciones de los clientes
        </p>
      </div>

      <CitasTable citas={citas} estadoFiltro={estado} fechaFiltro={fecha} />
    </div>
  )
}