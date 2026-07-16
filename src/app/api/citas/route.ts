import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"
import { sendCitaAgendada } from "@/lib/email"

function horaAMin(hora: string): number {
  const [h, m] = hora.split(":").map(Number)
  return h * 60 + m
}

function parseDurMin(dur: string): number {
  let min = 0
  const h = dur.match(/(\d+)\s*h/);   if (h) min += parseInt(h[1]) * 60
  const m = dur.match(/(\d+)\s*min/); if (m) min += parseInt(m[1])
  return min || 60
}

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

    // Duración del servicio nuevo
    const servicioNuevo = await prisma.servicio.findUnique({
      where: { id: Number(servicio_id) },
      select: { nombre: true, duracion: true },
    })
    const durNuevo   = parseDurMin(servicioNuevo?.duracion ?? "1h")
    const inicioNuevo = horaAMin(hora)
    const finNuevo    = inicioNuevo + durNuevo

    // Citas activas del día
    const citasDelDia = await prisma.cita.findMany({
      where: {
        fecha:  { gte: fechaInicio, lte: fechaFin },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        ...(empleado_id ? { empleado_id: Number(empleado_id) } : {}),
      },
      select: {
        hora:     true,
        servicio: { select: { duracion: true } },
      },
    })

    const conflicto = citasDelDia.some(c => {
      const inicio = horaAMin(c.hora)
      const fin    = inicio + parseDurMin(c.servicio?.duracion ?? "1h")
      return inicioNuevo < fin && finNuevo > inicio
    })

    if (conflicto) {
      return NextResponse.json({ error: "Esa hora ya esta ocupada" }, { status: 409 });
    }

    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        fecha:             new Date(`${fecha}T${hora}`),
        hora,
        usuario_id:        Number(session.user.id),
        empleado_id:       empleado_id ? Number(empleado_id) : null,
        notas:             notas || null,
        metodo_pago:       metodo_pago || "TARJETA",
        estado:            "CONFIRMADA",
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
      },
    });

    const clienteEmail = session.user.email
    if (clienteEmail) {
      sendCitaAgendada({
        to:       clienteEmail,
        nombre:   session.user.name ?? "Cliente",
        servicio: servicioNuevo?.nombre ?? "Servicio",
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
      servicio: { select: { nombre: true, precio: true, duracion: true } },
      empleado: { select: { nombre: true } },
    },
    orderBy: [{ fecha: "desc" }, { hora: "asc" }],
  })

  const result = citas.map(c => ({
    ...c,
    fecha: c.fecha instanceof Date ? c.fecha.toISOString() : c.fecha,
  }))

  return NextResponse.json(result)
}
