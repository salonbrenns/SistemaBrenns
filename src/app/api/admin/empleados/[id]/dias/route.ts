import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth" // ← corregir este import

async function isAdmin() {
  const session = await auth()
  return (session?.user as { role?: string })?.role === "ADMIN"
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params

  const dias = await prisma.empleadoDia.findMany({
    where: { usuario_id: Number(id) },
    orderBy: { dia_semana: "asc" },
  })

  return NextResponse.json(dias)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const { id } = await params
  const { dias }: { dias: number[] } = await req.json()

  await prisma.empleadoDia.deleteMany({ where: { usuario_id: Number(id) } })

  if (dias.length > 0) {
    await prisma.empleadoDia.createMany({
      data: dias.map(dia_semana => ({
        usuario_id: Number(id),
        dia_semana,
      })),
    })
  }

  return NextResponse.json({ ok: true })
}