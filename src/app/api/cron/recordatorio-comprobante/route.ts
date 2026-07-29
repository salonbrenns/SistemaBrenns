import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

// Protección: solo Vercel Cron puede llamar esta ruta
function esVercelCron(req: Request) {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: Request) {
  if (!esVercelCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Buscar citas de mañana que son PENDIENTE (sin comprobante) y son por TRANSFERENCIA
  const hoy         = new Date()
  const manana      = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
  const pasadoManana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 2)

  const citasSinPago = await prisma.cita.findMany({
    where: {
      fecha:       { gte: manana, lt: pasadoManana },
      estado:      "PENDIENTE",
      metodo_pago: "TRANSFERENCIA",
      comprobante: null,
    },
    include: {
      usuario:  { select: { nombre: true, correo: true } },
      servicio: { select: { nombre: true } },
    },
  })

  if (citasSinPago.length === 0) {
    return NextResponse.json({ ok: true, enviados: 0, mensaje: "No hay citas pendientes de comprobante para mañana" })
  }

  let enviados = 0
  const errores: number[] = []

  for (const cita of citasSinPago) {
    const correo = cita.usuario?.correo
    const nombre = cita.usuario?.nombre || "Clienta"

    if (!correo) continue

    const fechaStr = cita.fecha.toLocaleDateString("es-MX", {
      weekday: "long", day: "numeric", month: "long",
    })

    const ok = await sendEmail({
      to:      correo,
      subject: `⚠️ Recuerda subir tu comprobante — cita mañana en Salón Brenn's`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#be123c;margin:0 0 12px;">Recuerda completar tu pago</h2>
          <p style="color:#374151;margin:0 0 16px;">
            Hola <strong>${nombre}</strong>, tienes una cita mañana en Salón Brenn's
            y aún no hemos recibido tu comprobante de transferencia.
          </p>
          <table style="width:100%;border-radius:12px;background:#fdf2f8;padding:16px;margin-bottom:20px;border:1px solid #fbcfe8;border-spacing:0;">
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Servicio</td><td style="padding:4px 0;color:#374151;font-size:14px;">${cita.servicio.nombre}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Fecha</td><td style="padding:4px 0;color:#374151;font-size:14px;">${fechaStr}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Hora</td><td style="padding:4px 0;color:#374151;font-size:14px;">${cita.hora}</td></tr>
          </table>
          <p style="color:#374151;margin:0 0 20px;">
            Para confirmar tu lugar, realiza la transferencia y sube tu comprobante
            desde la sección <strong>Mis citas</strong> en nuestra página antes de tu cita.
          </p>
          <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;padding:12px 16px;margin-bottom:20px;">
            <p style="color:#92400e;font-size:13px;margin:0;">
              Si no se recibe el comprobante, tu cita puede ser cancelada.
            </p>
          </div>
          <p style="color:#9ca3af;font-size:12px;">¿Ya transferiste? Solo sube la foto de tu comprobante desde Mis citas.</p>
        </div>
      `,
    })

    if (ok) {
      enviados++
    } else {
      errores.push(cita.id)
    }
  }

  console.log(`[cron/recordatorio-comprobante] Enviados: ${enviados}, errores: ${errores.length}`)

  return NextResponse.json({
    ok:       true,
    enviados,
    total:    citasSinPago.length,
    errores:  errores.length > 0 ? errores : undefined,
  })
}
