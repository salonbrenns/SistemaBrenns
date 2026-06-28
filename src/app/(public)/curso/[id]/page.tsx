// src/app/(frontend)/cursos/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import CursoDetalleClient from './CursoDetalle'

export default async function DetalleCursoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cursoId = Number(id)
  const session = await auth()

  const raw = await prisma.curso.findUnique({
    where: { 
      id: cursoId, 
      activo: true 
    },
    
  })

  if (!raw) return notFound()

  // Mapeo de datos para el cliente
  const curso = {
    id: raw.id,
    titulo: raw.titulo,
    descripcion: raw.descripcion ?? null,
    precio_total: Number(raw.precio_total),
    nivel: raw.nivel ?? null,
    duracion_horas: raw.duracion_horas ?? null,
    cupo_maximo: raw.cupo_maximo,
    inscritos: raw.inscritos,
    fecha_inicio: raw.fecha_inicio?.toISOString() ?? null,
    fecha_fin: raw.fecha_fin?.toISOString() ?? null,
    imagenes: Array.isArray(raw.imagenes) 
      ? (raw.imagenes as string[]) 
      : [],
   
  }

  return (
    <CursoDetalleClient 
      curso={curso} 
      isLoggedIn={!!session} 
    />
  )
}