// src/lib/email.ts
// Servicio de email con nodemailer + Gmail App Password
import nodemailer from "nodemailer"

// ── Transporter singleton ─────────────────────────────────────────────────────
function crearTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("⚠️  GMAIL_USER o GMAIL_APP_PASSWORD no configurados — emails desactivados")
    return null
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// Lazy singleton — se crea la primera vez que se necesita
let _transporter: ReturnType<typeof crearTransporter> = undefined as unknown as ReturnType<typeof crearTransporter>
function getTransporter() {
  if (_transporter === undefined) _transporter = crearTransporter()
  return _transporter
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface EmailOptions {
  to:      string
  subject: string
  html:    string
  text?:   string
}

// ── Función base ──────────────────────────────────────────────────────────────
export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) return false          // silenciosamente no envía si no hay config

  try {
    await transporter.sendMail({
      from:    `"Salón Brenn's" <${process.env.GMAIL_USER}>`,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
    })
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
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:40px;height:40px;background:#fff;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#ec4899;font-size:20px;line-height:40px;">B</div>
                <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:.5px;">Salón Brenn's</span>
              </div>
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
