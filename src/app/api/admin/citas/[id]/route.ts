import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendCitaCancelada, sendCitaAgendada, sendEmail } from "@/lib/email"

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

// PATCH — confirmar o rechazar comprobante de transferencia
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminOrEmpleado()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const citaId = Number(id)
  if (!citaId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const { accion } = await req.json()
  if (accion !== "confirmar" && accion !== "rechazar") {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
  }

  try {
    const cita = await prisma.cita.findUnique({
      where: { id: citaId },
      include: {
        usuario:  { select: { correo: true, nombre: true } },
        servicio: { select: { nombre: true } },
      },
    })

    if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    if (!cita.comprobante) return NextResponse.json({ error: "La cita no tiene comprobante" }, { status: 400 })

    if (accion === "confirmar") {
      await prisma.cita.update({
        where: { id: citaId },
        data: { estado: "CONFIRMADA", estado_cita: "CONFIRMADA" },
      })

      // Avisar al cliente que su cita quedó confirmada
      if (cita.usuario?.correo) {
        sendCitaAgendada({
          to:       cita.usuario.correo,
          nombre:   cita.usuario.nombre,
          servicio: cita.servicio.nombre,
          fecha:    cita.fecha,
          hora:     cita.hora,
        }).catch(err => console.error("[confirmar-comprobante] email:", err))
      }

      return NextResponse.json({ ok: true, accion: "confirmada" })
    }

    // rechazar — limpiar comprobante, dejar en PENDIENTE
    await prisma.cita.update({
      where: { id: citaId },
      data: { comprobante: null },
    })

    // Avisar al cliente que su comprobante fue rechazado
    if (cita.usuario?.correo) {
      sendEmail({
        to:      cita.usuario.correo,
        subject: "Tu comprobante de pago no pudo verificarse — Salón Brenn's",
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <h2 style="color:#be123c;margin:0 0 12px;">Comprobante no verificado</h2>
            <p style="color:#374151;margin:0 0 16px;">
              Hola <strong>${cita.usuario.nombre}</strong>, revisamos el comprobante que enviaste
              para tu cita de <strong>${cita.servicio.nombre}</strong> pero no pudimos verificarlo.
            </p>
            <p style="color:#374151;margin:0 0 20px;">
              Por favor sube nuevamente tu comprobante de transferencia desde la sección
              <strong>Mis citas</strong> asegurándote de que muestre claramente:
              fecha, monto y número de referencia.
            </p>
            <p style="color:#9ca3af;font-size:12px;">Si crees que es un error, contáctanos directamente.</p>
          </div>
        `,
      }).catch(err => console.error("[rechazar-comprobante] email:", err))
    }

    return NextResponse.json({ ok: true, accion: "rechazada" })
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la acción" }, { status: 500 })
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
