import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/../auth";
import { Prisma } from "@prisma/client";

// === POST - Crear cita ===
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { servicio_id, fecha, hora, notas, empleado_id, nombre_contacto, telefono_contacto } = body;

  if (!servicio_id || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  try {
    const fechaInicio = new Date(fecha + "T00:00:00");
    const fechaFin    = new Date(fecha + "T23:59:59.999");

    const empleadoCondition = empleado_id 
      ? Prisma.sql`AND empleado_id = ${Number(empleado_id)}` 
      : Prisma.sql``;

    // Verificar hora ocupada
    const citaExistente = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM agenda.tblcitas 
      WHERE fecha >= ${fechaInicio}
        AND fecha <= ${fechaFin}
        AND hora = ${hora}
        AND estado IN ('PENDIENTE', 'CONFIRMADA')
        ${empleadoCondition}
    `;

    if (citaExistente.length > 0) {
      return NextResponse.json({ error: "Esa hora ya está ocupada" }, { status: 409 });
    }

    // Crear la cita
    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        fecha:             new Date(`${fecha}T${hora}`),
        hora:              hora,
        usuario_id:        Number(session.user.id),
        empleado_id:       empleado_id ? Number(empleado_id) : null,
        notas:             notas || null,
        metodo_pago:       "TARJETA",
        estado:            "CONFIRMADA",           // ← String
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "¡Cita agendada con éxito! 💅",
      cita 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("❌ Error al crear cita:", error);
    return NextResponse.json({ 
      error: "Error al crear la cita. Inténtalo de nuevo." 
    }, { status: 500 });
  }
}
// GET - Mis citas (lo dejé igual)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const citas = await prisma.cita.findMany({
    where: { usuario_id: Number(session.user.id) },
    include: {
      servicio: { select: { nombre: true, precio: true, imagen: true } },
    },
    orderBy: { fecha: "desc" },
  });

  return NextResponse.json({ citas });
}