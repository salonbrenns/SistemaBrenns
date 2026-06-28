import CursoTable from '@/components/cursos/table'
import { prisma } from '@/lib/prisma'

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; page?: string; query?: string }>
}) {
  const params = await searchParams

  const page  = Number(params.page) || 1
  const query = params.query || ''
  const take  = 10
  const skip  = (page - 1) * take

  // 🔍 FILTRO POR ESTADO + BUSCADOR
  const where = {
    ...(params.estado === 'activos' && { activo: true }),
    ...(params.estado === 'inactivos' && { activo: false }),
    ...(query && {
      OR: [
        { titulo: { contains: query, mode: 'insensitive' as const } },
        { codigo: { contains: query, mode: 'insensitive' as const } },
        { nivel:  { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  }

  const totalCursos = await prisma.curso.count({ where })

  const cursosRaw = await prisma.curso.findMany({
    where,
    orderBy: { id: 'desc' },
    take,
    skip,
  })

  const cursos = cursosRaw.map((c) => ({
    ...c,
    precio_total: Number(c.precio_total),
    imagenes: (c.imagenes as string[]) || [],
  }))

  const totalPages = Math.max(1, Math.ceil(totalCursos / take))

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-pink-900 dark:text-pink-300">Cursos</h1>

      {/* FILTROS */}
      <div className="flex gap-3">
        <a href="/admin/cursos" className="px-3 py-1 border rounded">Todos</a>
        <a href="/admin/cursos?estado=activos" className="px-3 py-1 border rounded">Activos</a>
        <a href="/admin/cursos?estado=inactivos" className="px-3 py-1 border rounded">Inactivos</a>
      </div>

      <CursoTable
        cursos={cursos}
        currentPage={page}
        totalPages={totalPages}
      />

    </div>
  )
}