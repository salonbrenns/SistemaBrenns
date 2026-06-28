// src/app/api/citas/[id]/cancelar/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCitaCancelada } from "@/lib/email"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const citaId = Number(id)

  // Buscar la cita con datos del usuario y servicio
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    select: {
      id:         true,
      usuario_id: true,
      estado:     true,
      fecha:      true,
      hora:       true,
      usuario:    { select: { nombre: true, correo: true } },
      servicio:   { select: { nombre: true } },
    },
  })

  if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })

  // Solo el dueño puede cancelar
  if (cita.usuario_id !== Number(session.user.id))
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  // Solo se pueden cancelar citas PENDIENTE o CONFIRMADA
  if (!["PENDIENTE", "CONFIRMADA"].includes(cita.estado))
    return NextResponse.json({ error: "Esta cita no se puede cancelar" }, { status: 400 })

  // Regla: mínimo 24h de anticipación
  const ahora        = new Date()
  const fechaCita    = new Date(cita.fecha)
  // Combinar fecha + hora para obtener el datetime exacto de la cita
  const [h, m]       = cita.hora.split(":").map(Number)
  fechaCita.setHours(h, m, 0, 0)

  const horasRestantes = (fechaCita.getTime() - ahora.getTime()) / (1000 * 60 * 60)

  if (horasRestantes < 24) {
    return NextResponse.json({
      error: "No se puede cancelar con menos de 24 horas de anticipación. Según nuestra política, el anticipo no será reembolsable.",
      horasRestantes: Math.max(0, Math.floor(horasRestantes)),
    }, { status: 400 })
  }

  // Cancelar la cita
  await prisma.cita.update({
    where: { id: citaId },
    data:  { estado: "CANCELADA", cancelado_por: "CLIENTE", cancelado_en: new Date() },
  })

  // Enviar email de cancelación con info de reembolso
  if (cita.usuario?.correo) {
    sendCitaCancelada({
      to:       cita.usuario.correo,
      nombre:   cita.usuario.nombre,
      servicio: cita.servicio.nombre,
      fecha:    cita.fecha,
      hora:     cita.hora,
      motivo:   "Cancelada por el cliente con más de 24 horas de anticipación. Si realizaste algún pago anticipado, será reembolsado en un plazo de 3 a 5 días hábiles.",
    }).catch(err => console.error("Email cancelación:", err))
  }

  return NextResponse.json({ ok: true, reembolso: true })
}
