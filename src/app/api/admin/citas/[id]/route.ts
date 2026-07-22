import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCitaCancelada } from "@/lib/email"

async function isAdminOrEmpleado() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminOrEmpleado()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const citaId = Number(id)
  if (!citaId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const body = await req.json()

  const ESTADOS_VALIDOS = ["PENDIENTE", "CONFIRMADA", "CANCELADA", "COMPLETADA"]
  if (body.estado !== undefined && !ESTADOS_VALIDOS.includes(body.estado)) {
    return NextResponse.json({ error: "Estado de cita inválido" }, { status: 400 })
  }
  if (body.estado_cita !== undefined && !ESTADOS_VALIDOS.includes(body.estado_cita)) {
    return NextResponse.json({ error: "Estado de cita inválido" }, { status: 400 })
  }

  const estado     = body.estado
  const estado_cita = body.estado_cita
  const notas      = body.notas !== undefined ? String(body.notas).trim().slice(0, 1000) : undefined
  const hora       = body.hora
  const empleado_id = body.empleado_id

  try {
    const cita = await prisma.cita.update({
      where: { id: citaId },
      data: {
        ...(estado      !== undefined && { estado }),
        ...(estado_cita !== undefined && { estado_cita }),
        ...(notas       !== undefined && { notas }),
        ...(hora        !== undefined && { hora }),
        ...(empleado_id !== undefined && { empleado_id: empleado_id ? Number(empleado_id) : null }),
        ...(estado === "CANCELADA"    && { cancelado_por: "ADMIN", cancelado_en: new Date() }),
      },
      include: {
        usuario:  { select: { correo: true, nombre: true } },
        servicio: { select: { nombre: true } },
      },
    })

    // Si se cancela la cita, notificar al cliente
    if (estado === "CANCELADA" && cita.usuario?.correo) {
      sendCitaCancelada({
        to:       cita.usuario.correo,
        nombre:   cita.usuario.nombre,
        servicio: cita.servicio.nombre,
        fecha:    cita.fecha,
        hora:     cita.hora,
      }).catch(err => console.error("Email cita cancelada:", err))
    }

    return NextResponse.json(cita)
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la cita" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const citaId = Number(id)
  if (!citaId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  try {
    await prisma.cita.delete({ where: { id: citaId } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la cita" }, { status: 500 })
  }
}
