import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const usuario_id = parseInt(id)

  const esAdmin      = (session.user as { role?: string })?.role === "ADMIN"
  const esPropioUser = String((session.user as { id?: string })?.id) === String(usuario_id)

  if (!esAdmin && !esPropioUser) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 })
  }

  const [diasDB, horasGlobalesDB, excepciones, usuario] = await Promise.all([
    prisma.empleadoDia.findMany({
      where:  { usuario_id },
      select: { dia_semana: true },
    }),
    prisma.horarioDisponible.findMany({
      where:  { activo: true },
      select: { hora: true, diaSemana: true },
    }),
    prisma.empleadoHoraExcepcion.findMany({
      where: { usuario_id, fecha: null },
    }),
    prisma.usuario.findUnique({
      where:  { id: usuario_id },
      select: { nombre: true, correo: true, rol: true },
    }),
  ])

  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  const dias = diasDB.map(d => d.dia_semana)
  const horarioPorDia: Record<number, string[]> = {}

  for (const dia of dias) {
    const globales  = horasGlobalesDB.filter(h => h.diaSemana === dia).map(h => h.hora)
    const excDia    = excepciones.filter(e => e.dia_semana === dia)
    const quitadas  = new Set(excDia.filter(e => e.tipo === "QUITAR").map(e => e.hora))
    const agregadas = excDia.filter(e => e.tipo === "AGREGAR").map(e => e.hora)

    horarioPorDia[dia] = [...new Set([
      ...globales.filter(h => !quitadas.has(h)),
      ...agregadas,
    ])].sort()
  }

  return NextResponse.json({ usuario, dias, horarioPorDia })
}