// src/app/api/admin/empleados/[id]/horas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const usuario_id = parseInt(id)

  const excepciones = await prisma.empleadoHoraExcepcion.findMany({
    where: { usuario_id },
    orderBy: [{ dia_semana: "asc" }, { hora: "asc" }],
  })

  return NextResponse.json(excepciones)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const usuario_id = parseInt(id)
  const { hora, tipo, dia_semana, fecha } = await req.json()

  const data = {
    usuario_id,
    hora,
    tipo,
    dia_semana: dia_semana ?? null,
    fecha: fecha ? new Date(fecha) : null,
  }

  await prisma.empleadoHoraExcepcion.upsert({
    where: dia_semana != null
      ? { usuario_id_dia_semana_hora_tipo: { usuario_id, dia_semana, hora, tipo } }
      : { usuario_id_fecha_hora_tipo: { usuario_id, fecha: new Date(fecha), hora, tipo } },
    create: data,
    update: {},
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params
  const { id: excepcionId } = await req.json()
  await prisma.empleadoHoraExcepcion.delete({ where: { id: excepcionId } })
  return NextResponse.json({ ok: true })
}