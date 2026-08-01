import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      where:   { activo: true },
      orderBy: { created_at: "desc" },
      take:    100,
    })

    return NextResponse.json({ cursos })
  } catch {
    return NextResponse.json(
      { error: "Error al obtener cursos" },
      { status: 500 }
    )
  }
}