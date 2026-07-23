// src/lib/email.ts
// Servicio de email con Resend (prioritario) y fallback compatible a Brevo.

import { Resend } from "resend"

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
const FROM_NAME     = "Salón Brenn's"
const FROM_EMAIL    = process.env.RESEND_FROM || process.env.BREVO_FROM || "salonbrenns11@gmail.com"
const resend        = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface EmailOptions {
  to:      string
  subject: string
  html:    string
  text?:   string
}

// ── Función base ──────────────────────────────────────────────────────────────
export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  if (resend && process.env.RESEND_API_KEY) {
    try {
      const result = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text ?? opts.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
      })

      if (result.error) {
        console.error("❌ Error al enviar email con Resend:", result.error)
        return false
      }

      return true
    } catch (err) {
      console.error("❌ Error al enviar email con Resend:", err)
      return false
    }
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn("⚠️  RESEND_API_KEY/BREVO_API_KEY no configurado — emails desactivados")
    return false
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "accept":       "application/json",
        "api-key":      apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender:      { name: FROM_NAME, email: FROM_EMAIL },
        to:          [{ email: opts.to }],
        subject:     opts.subject,
        htmlContent: opts.html,
      }),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => res.statusText)
      console.error("❌ Error al enviar email:", error)
      return false
    }
    return true
  } catch (err) {
    console.error("❌ Error al enviar email:", err)
    return false
  }
}

// ── Helpers de formato ────────────────────────────────────────────────────────
function formatearFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return d.toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "America/Mexico_City",
  })
}

function baseTemplate(contenido: string): string {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Salón Brenn's</title>
  </head>
  <body style="margin:0;padding:0;background:#f9f0f4;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f0f4;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(219,39,119,.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#ec4899,#be123c);padding:32px 40px;text-align:center;">
              <span style="color:#fff;font-size:24px;font-weight:800;letter-spacing:.5px;">Salón Brenn's</span>
            </td>
          </tr>
          <!-- Contenido -->
          <tr><td style="padding:40px;">
            ${contenido}
          </td></tr>
          <!-- Footer -->
          <tr>
            <td style="background:#fdf2f8;padding:20px 40px;text-align:center;border-top:1px solid #fce7f3;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Este correo fue enviado automáticamente por el sistema de Salón Brenn's.<br/>
                Si tienes dudas, contáctanos por WhatsApp o redes sociales.
              </p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`
}

// ── Templates específicos ─────────────────────────────────────────────────────

/** Email al crear una cita (cliente) */
export async function sendCitaAgendada(opts: {
  to:       string
  nombre:   string
  servicio: string
  fecha:    Date | string
  hora:     string
  notas?:   string
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">¡Tu cita está agendada! 💅</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, te confirmamos los detalles de tu próxima cita:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📋 Servicio:</span>&nbsp; ${opts.servicio}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📅 Fecha:</span>&nbsp; ${formatearFecha(opts.fecha)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">🕐 Hora:</span>&nbsp; ${opts.hora}
        </td>
      </tr>
      ${opts.notas ? `<tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="color:#ec4899;font-weight:600;">📝 Notas:</span>&nbsp; ${opts.notas}</td></tr>` : ""}
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">
      Recuerda llegar <strong>5-10 minutos antes</strong> de tu cita. Si necesitas cancelar o reagendar,
      hazlo con al menos 24 horas de anticipación desde tu perfil en nuestra plataforma.
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: `✅ Cita confirmada — ${opts.servicio} el ${formatearFecha(opts.fecha)}`,
    html:    baseTemplate(contenido),
  })
}

/** Email al confirmar una cita desde admin/empleado */
export async function sendCitaConfirmada(opts: {
  to:       string
  nombre:   string
  servicio: string
  fecha:    Date | string
  hora:     string
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">¡Tu cita fue confirmada! ✨</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, tu cita ha sido confirmada por nuestro equipo:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📋 Servicio:</span>&nbsp; ${opts.servicio}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📅 Fecha:</span>&nbsp; ${formatearFecha(opts.fecha)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">🕐 Hora:</span>&nbsp; ${opts.hora}
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">¡Te esperamos! 🌸</p>`

  return sendEmail({
    to:      opts.to,
    subject: `🌸 Cita CONFIRMADA — ${opts.servicio} el ${formatearFecha(opts.fecha)}`,
    html:    baseTemplate(contenido),
  })
}

/** Email al cancelar una cita */
export async function sendCitaCancelada(opts: {
  to:       string
  nombre:   string
  servicio: string
  fecha:    Date | string
  hora:     string
  motivo?:  string
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">Cita cancelada</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, te informamos que la siguiente cita ha sido cancelada:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f2;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #fecdd3;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#e11d48;font-weight:600;">📋 Servicio:</span>&nbsp; ${opts.servicio}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#e11d48;font-weight:600;">📅 Fecha:</span>&nbsp; ${formatearFecha(opts.fecha)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#e11d48;font-weight:600;">🕐 Hora:</span>&nbsp; ${opts.hora}
        </td>
      </tr>
      ${opts.motivo ? `<tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="color:#e11d48;font-weight:600;">📝 Motivo:</span>&nbsp; ${opts.motivo}</td></tr>` : ""}
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">
      Puedes agendar una nueva cita en cualquier momento desde nuestra plataforma. ¡Esperamos verte pronto! 💕
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: `❌ Cita cancelada — ${opts.servicio}`,
    html:    baseTemplate(contenido),
  })
}

/** Email de recordatorio 24h antes (para usar con un cron job o task programada) */
export async function sendRecordatorioCita(opts: {
  to:       string
  nombre:   string
  servicio: string
  fecha:    Date | string
  hora:     string
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">Recordatorio de cita 🔔</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, te recordamos que mañana tienes una cita en Salón Brenn's:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📋 Servicio:</span>&nbsp; ${opts.servicio}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">📅 Fecha:</span>&nbsp; ${formatearFecha(opts.fecha)}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">🕐 Hora:</span>&nbsp; ${opts.hora}
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">¡Ya casi es tu día! 🌸 Llega 5 minutos antes.</p>`

  return sendEmail({
    to:      opts.to,
    subject: `🔔 Recordatorio — Tu cita es mañana a las ${opts.hora}`,
    html:    baseTemplate(contenido),
  })
}

/** Email al cambiar estado de un pedido */
export async function sendPedidoEstado(opts: {
  to:       string
  nombre:   string
  pedidoId: number | string
  estado:   "EN_PREPARACION" | "EN_CAMINO" | "ENTREGADO"
  productos?: string
}) {
  const labels: Record<string, { emoji: string; titulo: string; desc: string }> = {
    EN_PREPARACION: {
      emoji: "🛠️",
      titulo: "Preparando tu pedido",
      desc:   "Nuestro equipo ya está preparando tu pedido con mucho cuidado.",
    },
    EN_CAMINO: {
      emoji: "🚚",
      titulo: "¡Tu pedido va en camino!",
      desc:   "Tu pedido salió y está en ruta hacia tu domicilio.",
    },
    ENTREGADO: {
      emoji: "✅",
      titulo: "¡Pedido entregado!",
      desc:   "Tu pedido fue entregado. ¡Esperamos que lo disfrutes! 💕",
    },
  }

  const info = labels[opts.estado]

  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">${info.emoji} ${info.titulo}</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, ${info.desc}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#ec4899;font-weight:600;">🧾 Pedido #:</span>&nbsp; ${opts.pedidoId}
        </td>
      </tr>
      ${opts.productos ? `<tr><td style="padding:8px 0;color:#374151;font-size:15px;"><span style="color:#ec4899;font-weight:600;">📦 Productos:</span>&nbsp; ${opts.productos}</td></tr>` : ""}
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">Puedes ver el estado de tu pedido en tu perfil en cualquier momento.</p>`

  return sendEmail({
    to:      opts.to,
    subject: `${info.emoji} Pedido #${opts.pedidoId} — ${info.titulo}`,
    html:    baseTemplate(contenido),
  })
}

// ── Recuperación de contraseña (migrado desde mailer.ts) ─────────────────────
export async function enviarCorreoRecuperacion(correo: string, token: string) {
  const url = `${process.env.AUTH_URL}/reset-contrasena?token=${token}`
  return sendEmail({
    to:      correo,
    subject: "Recupera tu contraseña — Salón Brenn's",
    html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f9f0f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f0f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(219,39,119,.1);">
        <tr><td style="background:linear-gradient(135deg,#ec4899,#be123c);padding:32px 40px;text-align:center;">
          <span style="color:#fff;font-size:26px;font-weight:700;">Salón Brenn's</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">🔐 Recupera tu contraseña</h2>
          <p style="color:#6b7280;margin:0 0 28px;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Este enlace expira en <strong>1 hora</strong>.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${url}" style="background:linear-gradient(135deg,#ec4899,#be123c);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">Restablecer contraseña</a>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;">Si no solicitaste esto, puedes ignorar este correo.</p>
        </td></tr>
        <tr><td style="background:#fdf2f8;padding:20px 40px;text-align:center;border-top:1px solid #fce7f3;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">Enviado automáticamente por Salón Brenn's.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`,
  })
}

/** Email al alumno cuando su pago de curso es CONFIRMADO */
export async function sendPagoCursoConfirmado(opts: {
  to:     string
  nombre: string
  curso:  string
  monto:  number
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">¡Tu pago fue confirmado! ✅</h2>
    <p style="color:#6b7280;margin:0 0 28px;">
      Hola <strong>${opts.nombre}</strong>, hemos verificado tu transferencia y ya quedó registrada en el sistema.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #bbf7d0;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#16a34a;font-weight:600;">🎓 Curso:</span>&nbsp; ${opts.curso}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#16a34a;font-weight:600;">💳 Monto confirmado:</span>&nbsp; $${opts.monto.toLocaleString("es-MX")} MXN
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">
      Puedes revisar el estado de tu inscripción en cualquier momento desde
      <strong>Mis Cursos</strong> en tu perfil. ¡Gracias por tu pago! 🌸
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: `✅ Pago confirmado — ${opts.curso}`,
    html:    baseTemplate(contenido),
  })
}

/** Email al alumno cuando su pago de curso es RECHAZADO */
export async function sendPagoCursoRechazado(opts: {
  to:     string
  nombre: string
  curso:  string
  monto:  number
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">Pago no verificado ⚠️</h2>
    <p style="color:#6b7280;margin:0 0 28px;">
      Hola <strong>${opts.nombre}</strong>, lamentablemente no pudimos verificar tu transferencia.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff1f2;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid #fecdd3;">
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#e11d48;font-weight:600;">🎓 Curso:</span>&nbsp; ${opts.curso}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#374151;font-size:15px;">
          <span style="color:#e11d48;font-weight:600;">💳 Monto enviado:</span>&nbsp; $${opts.monto.toLocaleString("es-MX")} MXN
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">
      Por favor contáctanos por WhatsApp o redes sociales para aclarar la situación
      y volver a registrar tu pago. ¡Estamos aquí para ayudarte! 💕
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: `⚠️ Pago no verificado — ${opts.curso}`,
    html:    baseTemplate(contenido),
  })
}

/** Email al cliente cuando el admin le envía un aviso desde notificaciones */
export async function sendAvisoAdmin(opts: {
  to:       string
  nombre:   string
  mensaje:  string
  servicio: string
  fecha:    Date | string
  hora:     string
}) {
  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">📣 Tienes un mensaje del salón</h2>
    <p style="color:#6b7280;margin:0 0 28px;">Hola <strong>${opts.nombre}</strong>, el equipo de Brenn's te envió el siguiente aviso:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf2f8;border-radius:12px;padding:24px;margin-bottom:28px;border-left:4px solid #ec4899;">
      <tr>
        <td style="color:#374151;font-size:16px;font-weight:600;padding-bottom:4px;">
          💬 ${opts.mensaje}
        </td>
      </tr>
    </table>

    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;">Este aviso es sobre tu cita:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:28px;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:6px 0;color:#374151;font-size:14px;">
          <span style="color:#ec4899;font-weight:600;">📋 Servicio:</span>&nbsp; ${opts.servicio}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#374151;font-size:14px;">
          <span style="color:#ec4899;font-weight:600;">📅 Fecha:</span>&nbsp; ${formatearFecha(opts.fecha)}
        </td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#374151;font-size:14px;">
          <span style="color:#ec4899;font-weight:600;">🕐 Hora:</span>&nbsp; ${opts.hora}
        </td>
      </tr>
    </table>

    <p style="color:#6b7280;font-size:14px;margin:0;">
      Puedes ver todos tus mensajes en <strong>Mis mensajes</strong> dentro de tu cuenta. 🌸
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: `📣 Mensaje de Salón Brenn's — ${opts.servicio}`,
    html:    baseTemplate(contenido),
  })
}

/** Email de verificación de correo al registrarse */
export async function sendVerificacionEmail(opts: {
  to:     string
  nombre: string
  token:  string
}) {
  const url = `${process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL}/verificar-email?token=${opts.token}`

  const contenido = `
    <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">¡Verifica tu correo!</h2>
    <p style="color:#6b7280;margin:0 0 28px;">
      Hola <strong>${opts.nombre}</strong>, gracias por crear tu cuenta en Salón Brenn's.
      Solo falta un paso: confirma que este correo es tuyo.
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${url}"
         style="background:linear-gradient(135deg,#ec4899,#be123c);color:#fff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
        Verificar mi correo
      </a>
    </div>

    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;text-align:center;">
      Este enlace expira en <strong>1 hora</strong>.
    </p>
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">
      Si no creaste esta cuenta, ignora este mensaje.
    </p>`

  return sendEmail({
    to:      opts.to,
    subject: "Verifica tu correo — Salón Brenn's",
    html:    baseTemplate(contenido),
  })
}

