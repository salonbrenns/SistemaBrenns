// src/app/(frontend)/cursos/[id]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth"
import CursoDetalleClient from './CursoDetalle'

export const revalidate = 3600

export async function generateStaticParams() {
  const cursos = await prisma.curso.findMany({
    where: { activo: true },
    select: { id: true },
  })
  return cursos.map(c => ({ id: String(c.id) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const curso = await prisma.curso.findUnique({
    where: { id: Number(id), activo: true },
    select: { titulo: true, descripcion: true, imagenes: true },
  })
  if (!curso) return { title: "Curso no encontrado" }

  const imagenes = Array.isArray(curso.imagenes) ? curso.imagenes as string[] : []
  const imagen   = imagenes[0] ?? "/logo/logo.png"

  return {
    title: curso.titulo,
    description: curso.descripcion ?? `Inscríbete al curso ${curso.titulo} en Brenn's Beauty`,
    openGraph: {
      title: curso.titulo,
      description: curso.descripcion ?? `Inscríbete al curso ${curso.titulo} en Brenn's Beauty`,
      images: [{ url: imagen }],
    },
    twitter: {
      card: "summary_large_image",
      title: curso.titulo,
      images: [imagen],
    },
  }
}

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