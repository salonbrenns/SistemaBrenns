import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

type FavRow = { id: number; curso_id: number; creado_en: Date }

// GET  /api/favoritos-cursos  → lista de favoritos con datos del curso
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ favoritos: [], cursos: [] })

  const usuarioId = Number(session.user.id)

  const rows = await prisma.$queryRaw<FavRow[]>`
    SELECT id, curso_id, creado_en
    FROM ventas.tblfavoritos_cursos
    WHERE usuario_id = ${usuarioId}
    ORDER BY creado_en DESC
  `

  const cursoIds = rows.map((r) => r.curso_id)
  const favoritos = cursoIds // plain array of IDs for the hook

  if (cursoIds.length === 0) {
    return NextResponse.json({ favoritos: [], cursos: [] })
  }

  // Fetch course details
  const cursos = await prisma.curso.findMany({
    where: { id: { in: cursoIds } },
    select: {
      id:            true,
      titulo:        true,
      nivel:         true,
      precio_total:  true,
      cupo_maximo:   true,
      inscritos:     true,
      imagenes:      true,
      duracion_horas: true,
    },
  })

  const cursosConOrden = cursoIds
    .map((id) => cursos.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({
      ...c!,
      precio_total: Number(c!.precio_total),
      imagenes: Array.isArray(c!.imagenes) ? (c!.imagenes as string[]) : [],
    }))

  return NextResponse.json({ favoritos, cursos: cursosConOrden })
}

// POST /api/favoritos-cursos  { cursoId } → toggle (agrega o quita)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { cursoId } = await req.json()
  if (!cursoId) return NextResponse.json({ error: "cursoId requerido" }, { status: 400 })

  const usuarioId = Number(session.user.id)
  const cId       = Number(cursoId)

  const existing = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM ventas.tblfavoritos_cursos
    WHERE usuario_id = ${usuarioId} AND curso_id = ${cId}
    LIMIT 1
  `

  if (existing.length > 0) {
    await prisma.$executeRaw`
      DELETE FROM ventas.tblfavoritos_cursos
      WHERE usuario_id = ${usuarioId} AND curso_id = ${cId}
    `
    return NextResponse.json({ accion: "quitado", cursoId: cId })
  } else {
    await prisma.$executeRaw`
      INSERT INTO ventas.tblfavoritos_cursos (usuario_id, curso_id)
      VALUES (${usuarioId}, ${cId})
      ON CONFLICT DO NOTHING
    `
    return NextResponse.json({ accion: "agregado", cursoId: cId })
  }
}
