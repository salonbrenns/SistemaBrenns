import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth"
import { sendCitaAgendada, sendCitaCancelada } from "@/lib/email"

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
  const servicio_id      = body.servicio_id
  const fecha            = body.fecha
  const hora             = body.hora
  const notas            = body.notas ? String(body.notas).trim().slice(0, 1000) : null
  const empleado_id      = body.empleado_id
  const nombre_contacto  = body.nombre_contacto  ? String(body.nombre_contacto).trim().slice(0, 100)  : null
  const telefono_contacto = body.telefono_contacto ? String(body.telefono_contacto).trim().slice(0, 30) : null
  const metodo_pago      = body.metodo_pago

  const total            = body.total

  if (!servicio_id || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  try {
    const fechaInicio = new Date(fecha + "T00:00:00");
    const fechaFin    = new Date(fecha + "T23:59:59.999");

    // ── 1. Validar que la fecha/hora no sea en el pasado ──────────────────
    const fechaCita = new Date(`${fecha}T${hora}`)
    if (fechaCita < new Date()) {
      return NextResponse.json({ error: "No puedes agendar en una fecha u hora pasada" }, { status: 400 })
    }

    // ── 2. Validar que el día no esté bloqueado ────────────────────────────
    const diaBloqueado = await prisma.diaBloqueado.findFirst({
      where: { fecha: fechaInicio },
    })
    if (diaBloqueado) {
      return NextResponse.json({ error: "El salón no atiende ese día" }, { status: 409 })
    }

    // ── 3. Validar que la hora no esté bloqueada ───────────────────────────
    const horaBloqueada = await prisma.horaBloqueada.findFirst({
      where: { fecha: fechaInicio, hora },
    })
    if (horaBloqueada) {
      return NextResponse.json({ error: "Esa hora no está disponible" }, { status: 409 })
    }

    // ── 4. Límite de citas activas por usuario (máx. 5) ────────────────────
    const citasActivas = await prisma.cita.count({
      where: {
        usuario_id: Number(session.user.id),
        estado:     { in: ["PENDIENTE", "CONFIRMADA"] },
      },
    })
    if (citasActivas >= 5) {
      return NextResponse.json({
        error: "Tienes demasiadas citas activas. Cancela alguna antes de agendar una nueva.",
      }, { status: 400 })
    }

    // ── 5. Duración del servicio nuevo ─────────────────────────────────────
    const servicioNuevo = await prisma.servicio.findUnique({
      where: { id: Number(servicio_id) },
      select: { nombre: true, duracion: true },
    })
    const durNuevo    = parseDurMin(servicioNuevo?.duracion ?? "1h")
    const inicioNuevo = horaAMin(hora)
    const finNuevo    = inicioNuevo + durNuevo

    // ── 6. Verificar solapamiento con citas existentes ──────────────────────
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

    // Las citas de TRANSFERENCIA nacen PENDIENTE hasta que se suba el comprobante.
    // El comprobante route las pasa a CONFIRMADA automáticamente.
    const esTranferencia = (metodo_pago || "TRANSFERENCIA") === "TRANSFERENCIA"
    const estadoInicial  = esTranferencia ? "PENDIENTE" : "CONFIRMADA"

    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        fecha:             new Date(`${fecha}T${hora}`),
        hora,
        usuario_id:        Number(session.user.id),
        empleado_id:       empleado_id ? Number(empleado_id) : null,
        notas:             notas || null,
        metodo_pago:       metodo_pago || "TRANSFERENCIA",
        estado:            estadoInicial,
        estado_cita:       estadoInicial,
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
        // Monto a cobrar: anticipo o pago completo
        total:             total ? Number(total) : null,
      },
    });

    // Solo enviar correo de confirmación si no es transferencia
    // (para transferencia el correo se envía cuando suben el comprobante)
    const clienteEmail = session.user.email
    if (clienteEmail && !esTranferencia) {
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

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 })

  try {
    const cita = await prisma.cita.findUnique({
      where: { id: Number(id) },
      include: {
        servicio: { select: { nombre: true } },
        usuario:  { select: { nombre: true, correo: true } },
      },
    })

    // Validaciones
    if (!cita) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
    if (cita.usuario_id !== Number(session.user.id))
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    if (cita.estado === "CANCELADA" || cita.estado === "COMPLETADA")
      return NextResponse.json({ error: "La cita ya no puede cancelarse" }, { status: 400 })

    // Regla de 24 horas
    const ahora = new Date()
    const horasRestantes = (cita.fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60)
    if (horasRestantes < 24)
      return NextResponse.json({ error: "Solo puedes cancelar con más de 24 horas de anticipación" }, { status: 400 })

    // Cancelar
    await prisma.cita.update({
      where: { id: Number(id) },
      data:  { estado: "CANCELADA", estado_cita: "CANCELADA", cancelado_en: ahora, cancelado_por: "CLIENTE" },
    })

    // Email de confirmación de cancelación
    if (cita.usuario?.correo) {
      sendCitaCancelada({
        to:       cita.usuario.correo,
        nombre:   cita.usuario.nombre,
        servicio: cita.servicio.nombre,
        fecha:    cita.fecha,
        hora:     cita.hora,
      }).catch(() => {})
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error al cancelar cita:", error)
    return NextResponse.json({ error: "Error al cancelar" }, { status: 500 })
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
