import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cursos = await prisma.curso.findMany({
      where: {
        activo: true, // 🔥 SOLO ACTIVOS
      },
      orderBy: {
        created_at: "desc",
      },
    })

    return NextResponse.json({ cursos })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al obtener cursos" },
      { status: 500 }
    )
  }
}