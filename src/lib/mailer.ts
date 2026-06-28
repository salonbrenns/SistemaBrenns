import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function enviarCorreoRecuperacion(correo: string, token: string) {
  const url = `${process.env.AUTH_URL}/reset-contrasena?token=${token}`

  await transporter.sendMail({
    from: `"Salón Brenn's" <${process.env.GMAIL_USER}>`,
    to: correo,
    subject: "Recupera tu contraseña — Salón Brenn's",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperar contraseña — Salón Brenn's</title>
</head>
<body style="margin:0;padding:0;background:#f9f0f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f0f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(219,39,119,.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ec4899,#be123c);padding:32px 40px;text-align:center;">
            <span style="color:#fff;font-size:26px;font-weight:700;letter-spacing:.5px;">Salón Brenn's</span>
          </td>
        </tr>

        <!-- Contenido -->
        <tr><td style="padding:40px;">
          <h2 style="margin:0 0 8px;color:#be123c;font-size:24px;">🔐 Recupera tu contraseña</h2>
          <p style="color:#6b7280;margin:0 0 28px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en Salón Brenn's.
            Haz clic en el botón para crear una nueva. Este enlace expira en <strong>1 hora</strong>.
          </p>

          <div style="text-align:center;margin:32px 0;">
            <a href="${url}"
              style="background:linear-gradient(135deg,#ec4899,#be123c);color:#ffffff;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;box-shadow:0 4px 14px rgba(236,72,153,.4);">
              Restablecer contraseña
            </a>
          </div>

          <p style="color:#9ca3af;font-size:12px;margin:0;">
            Si no solicitaste restablecer tu contraseña, puedes ignorar este correo. Tu cuenta sigue segura.
          </p>
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
</html>`,
  })
}
