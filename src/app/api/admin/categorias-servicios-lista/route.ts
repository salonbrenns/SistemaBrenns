import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

const POR_PAGINA = 10

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query") || ""
  const page  = Number(searchParams.get("page"))  || 1

  const where = query
    ? { nombre: { contains: query, mode: "insensitive" as const } }
    : {}

  const [total, categorias] = await Promise.all([
    prisma.categoriaServicio.count({ where }),
    prisma.categoriaServicio.findMany({
      where,
      select: {
        id:     true,
        nombre: true,
        activo: true,
        _count: { select: { servicios: true } },
      },
      orderBy: { id: "asc" },
      skip: (page - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
  ])

  return NextResponse.json({
    categorias,
    totalPages: Math.max(1, Math.ceil(total / POR_PAGINA)),
  })
}