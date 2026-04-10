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
    from: `"Brenn&apos;s" <${process.env.GMAIL_USER}>`,
    to: correo,
    subject: "Recupera tu contraseña — Brenn&apos;s",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Brenn&apos;s</h1>
        </div>
        <div style="background: #fff; padding: 30px; border: 1px solid #fce7f3; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Recupera tu contraseña</h2>
          <p style="color: #6b7280;">Haz clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" style="background: #ec4899; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px;">Si no solicitaste esto, ignora este correo.</p>
        </div>
      </div>
    `,
  })
}