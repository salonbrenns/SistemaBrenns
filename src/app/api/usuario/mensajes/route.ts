// src/app/api/usuario/mensajes/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const mensajes = await prisma.avisoAdmin.findMany({
    where: { usuario_id: Number(session.user.id) },
    include: {
      cita: {
        include: {
          servicio: { select: { nombre: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    mensajes.map(m => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      cita: {
        id:       m.cita.id,
        hora:     m.cita.hora,
        fecha:    m.cita.fecha.toISOString(),
        servicio: m.cita.servicio.nombre,
      },
    }))
  )
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await req.json()

  await prisma.avisoAdmin.updateMany({
    where: {
      id:         Number(id),
      usuario_id: Number(session.user.id),
    },
    data: { leido: true },
  })

  return NextResponse.json({ ok: true })
}