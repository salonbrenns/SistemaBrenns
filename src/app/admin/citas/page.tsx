// src/app/admin/citas/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CitasTable from '@/components/citas/table'
import { Prisma } from '@prisma/client' // Importamos los tipos generados
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Citas',
  description: 'Gestión de citas del salón',
}

type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; fecha?: string }>
}) {
  const params = await searchParams
  const estado = params.estado as EstadoCita | undefined // Cast seguro al Enum de tu schema
  const fecha  = params.fecha  || ''

  // 1. Tipado correcto: Usamos 'Prisma.CitaWhereInput' en lugar de 'any'
  const where: Prisma.CitaWhereInput = {}

  // 2. Filtro de estado (solo si es un valor válido del Enum)
  if (estado) {
    where.estado = estado
  }
  
  // 3. Filtro de fecha
  if (fecha) {
    const fechaInicio = new Date(`${fecha}T00:00:00.000Z`)
    const fechaFin    = new Date(`${fecha}T23:59:59.999Z`)
    where.fecha = { gte: fechaInicio, lte: fechaFin }
  }

  const citasRaw = await prisma.cita.findMany({
    where,
    include: {
      // Según tu schema, usuario es opcional (usuario_id Int?)
      usuario:  { select: { nombre: true, correo: true, telefono: true } },
      servicio: { select: { nombre: true, precio: true } },
    },
    orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
  })

  // 4. Mapeo de datos para el componente cliente
  const citas = citasRaw.map(c => ({
    ...c,
    fecha:     c.fecha.toISOString(),
    createdAt: c.createdAt.toISOString(),
    servicio: {
      ...c.servicio,
      // En tu schema el precio es Float, Number() asegura compatibilidad
      precio: Number(c.servicio.precio),
    },
    // Manejo de usuario nulo (para citas sin usuario registrado)
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

      <CitasTable 
        citas={citas} 
        estadoFiltro={estado || ''} 
        fechaFiltro={fecha} 
      />
    </div>
  )
}