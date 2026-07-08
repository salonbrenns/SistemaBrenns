import { prisma } from '@/lib/prisma'
import CursoForm from '@/components/cursos/form'
import { notFound } from 'next/navigation'

// ✅ Después
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const curso = await prisma.curso.findUnique({
    where: { id: Number(id) },
  })

  if (!curso) return notFound()

return (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Editar Curso</h1>

    <CursoForm
      curso={{
        id: curso.id,
        codigo: curso.codigo,
        titulo: curso.titulo,
        descripcion: curso.descripcion ?? '',
        precio_total: Number(curso.precio_total),
        nivel: curso.nivel ?? '',
        duracion_horas: curso.duracion_horas ?? 0,
        cupo_maximo: curso.cupo_maximo,
        activo: curso.activo,
        imagenes: Array.isArray(curso.imagenes)
          ? (curso.imagenes as string[])
          : [],
        fecha_inicio: curso.fecha_inicio
          ? curso.fecha_inicio.toISOString().slice(0, 10)
          : '',
        fecha_fin: curso.fecha_fin
          ? curso.fecha_fin.toISOString().slice(0, 10)
          : '',
      }}
    />
  </div>
)
}