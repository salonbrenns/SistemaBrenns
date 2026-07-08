import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"

import { sendCitaAgendada } from "@/lib/email"

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { servicio_id, fecha, hora, notas, empleado_id, nombre_contacto, telefono_contacto, metodo_pago } = body;

  if (!servicio_id || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  try {
    const fechaInicio = new Date(fecha + "T00:00:00");
    const fechaFin    = new Date(fecha + "T23:59:59.999");

    const citaExistente = await (
      empleado_id
        ? prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM agenda.tblcitas
            WHERE fecha >= ${fechaInicio}
              AND fecha <= ${fechaFin}
              AND hora = ${hora}
              AND estado IN ('PENDIENTE', 'CONFIRMADA')
              AND empleado_id = ${Number(empleado_id)}`
        : prisma.$queryRaw<{ id: number }[]>`
            SELECT id FROM agenda.tblcitas
            WHERE fecha >= ${fechaInicio}
              AND fecha <= ${fechaFin}
              AND hora = ${hora}
              AND estado IN ('PENDIENTE', 'CONFIRMADA')`
    );

    if (citaExistente.length > 0) {
      return NextResponse.json({ error: "Esa hora ya esta ocupada" }, { status: 409 });
    }

    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        fecha:             new Date(`${fecha}T${hora}`),
        hora:              hora,
        usuario_id:        Number(session.user.id),
        empleado_id:       empleado_id ? Number(empleado_id) : null,
        notas:             notas || null,
        metodo_pago:       metodo_pago || "TARJETA",
        estado:            metodo_pago === "TRANSFERENCIA" ? "PENDIENTE" : "CONFIRMADA",
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
      },
    });

    const clienteEmail = session.user.email
    if (clienteEmail) {
      const servicioInfo = await prisma.servicio.findUnique({
        where: { id: Number(servicio_id) },
        select: { nombre: true },
      })
      sendCitaAgendada({
        to:       clienteEmail,
        nombre:   session.user.name ?? "Cliente",
        servicio: servicioInfo?.nombre ?? "Servicio",
        fecha:    cita.fecha,
        hora:     cita.hora,
        notas:    notas || undefined,
      }).catch(err => console.error("Email cita agendada:", err))
    }

    return NextResponse.json({ success: true, message: "Cita agendada con exito!", cita }, { status: 201 });

  } catch (error: unknown) {
    console.error("Error al crear cita:", error);
    return NextResponse.json({ error: "Error al crear la cita. Intentalo de nuevo." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const citas = await prisma.cita.findMany({
    where: { usuario_id: Number(session.user.id) },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      empleado: { select: { nombre: true } },
    },
    orderBy: [{ fecha: 'desc' }, { hora: 'asc' }],
  })

  const result = citas.map(c => ({
    ...c,
    fecha:  c.fecha instanceof Date ? c.fecha.toISOString() : c.fecha,
  }))

  return NextResponse.json(result)
}
