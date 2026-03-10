// src/app/admin/dias-bloqueados/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DiasBloqueadosTable from '@/components/dias-bloqueados/table'

export const metadata: Metadata = {
  title: 'Días y horas bloqueadas',
  description: 'Gestión de fechas y horas sin servicio',
}

export default async function DiasBloqueadosPage() {
  const dias = await prisma.diaBloqueado.findMany({ orderBy: { fecha: 'asc' } })
  const horas = await prisma.horaBloqueada.findMany({ orderBy: [{ fecha: 'asc' }, { hora: 'asc' }] })

  const diasSerialized = dias.map(d => ({
    ...d,
    fecha:     d.fecha.toISOString(),
    createdAt: d.createdAt.toISOString(),
  }))

 const horasSerialized = horas.map(h => ({
  ...h,
  fecha: h.fecha.toISOString(),
}))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pink-900">Días y horas bloqueadas</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona días completos sin servicio y horas puntuales bloqueadas
        </p>
      </div>
      <DiasBloqueadosTable dias={diasSerialized} horas={horasSerialized} />
    </div>
  )
}