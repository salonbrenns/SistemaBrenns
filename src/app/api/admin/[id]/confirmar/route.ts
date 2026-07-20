import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCitaConfirmada } from "@/lib/email"

async function isAdminOrEmpleado() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminOrEmpleado()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const citaId = Number(id)
  if (!citaId) return NextResponse.json({ error: "ID invalido" }, { status: 400 })

  try {
    const cita = await prisma.cita.update({
      where:   { id: citaId },
      data:    { estado: "CONFIRMADA" },
      include: {
        usuario:  { select: { correo: true, nombre: true } },
        servicio: { select: { nombre: true } },
      },
    })

    if (cita.usuario?.correo) {
      sendCitaConfirmada({
        to:       cita.usuario.correo,
        nombre:   cita.usuario.nombre,
        servicio: cita.servicio.nombre,
        fecha:    cita.fecha,
        hora:     cita.hora,
      }).catch(err => console.error("Email cita confirmada:", err))
    }

    return NextResponse.json(cita)
  } catch {
    return NextResponse.json({ error: "No se pudo confirmar la cita" }, { status: 500 })
  }
}
