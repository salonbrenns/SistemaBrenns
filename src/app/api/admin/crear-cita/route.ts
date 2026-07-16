// src/app/api/admin/crear-cita/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function canAccess() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

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
  if (!await canAccess()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { servicio_id, empleado_id, fecha, hora, usuario_id,
          nombre_contacto, telefono_contacto, metodo_pago, notas, estado } = body

  if (!servicio_id || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  try {
    const fechaInicio = new Date(fecha + "T00:00:00")
    const fechaFin    = new Date(fecha + "T23:59:59.999")

    // Duración del servicio nuevo
    const servicioNuevo = await prisma.servicio.findUnique({
      where: { id: Number(servicio_id) },
      select: { duracion: true },
    })
    const durNuevo    = parseDurMin(servicioNuevo?.duracion ?? "1h")
    const inicioNuevo = horaAMin(hora)
    const finNuevo    = inicioNuevo + durNuevo

    // Citas activas del día (consistente con /api/citas y /api/horarios)
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
      return NextResponse.json({ error: "Esa hora ya está ocupada" }, { status: 409 })
    }

    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        empleado_id:       empleado_id ? Number(empleado_id) : null,
        fecha:             new Date(`${fecha}T${hora}`),  // hora real, no T12:00:00
        hora,
        usuario_id:        usuario_id ? Number(usuario_id) : null,
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
        metodo_pago:       metodo_pago || "EFECTIVO",
        notas:             notas || null,
        estado:            estado || "CONFIRMADA",
      },
    })
    return NextResponse.json(cita, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 })
  }
}
