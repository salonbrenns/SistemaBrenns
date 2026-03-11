// src/app/api/auth/recuperar-contrasena/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"
import crypto from "crypto"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { correo } = await req.json()

  if (!correo) {
    return NextResponse.json({ error: "Correo requerido" }, { status: 400 })
  }

  // Buscar usuario
  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  // Siempre responder igual (seguridad — no revelar si existe el correo)
  if (!usuario) {
    return NextResponse.json({ ok: true })
  }

  // Generar token único
  const token     = crypto.randomBytes(32).toString("hex")
  const expira    = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

  // Guardar token en BD
  await prisma.tokenRecuperacion.upsert({
    where:  { usuario_id: usuario.id },
    update: { token, expira, usado: false },
    create: { usuario_id: usuario.id, token, expira, usado: false },
  })

  const resetUrl = `${process.env.AUTH_URL}/reset-contrasena?token=${token}`

  // Enviar correo
  await resend.emails.send({
    from:    "Brenn's <onboarding@resend.dev>",
    to:      correo,
    subject: "Recupera tu contraseña — Brenn's",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; background: #fdf2f8; margin: 0; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #db2777, #ec4899); padding: 32px 24px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Brenn's</h1>
              <p style="color: #fce7f3; margin: 4px 0 0; font-size: 13px;">Academia • Distribuidora • Salón</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px 24px;">
              <h2 style="color: #1f2937; margin: 0 0 12px; font-size: 20px;">Recupera tu contraseña</h2>
              <p style="color: #6b7280; margin: 0 0 24px; line-height: 1.6;">
                Hola <strong>${usuario.nombre}</strong>, recibimos una solicitud para restablecer tu contraseña.
                Haz clic en el botón de abajo para crear una nueva contraseña.
              </p>

              <!-- Botón -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}"
                   style="background: #db2777; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: bold; font-size: 15px; display: inline-block;">
                  Restablecer contraseña
                </a>
              </div>

              <p style="color: #9ca3af; font-size: 13px; margin: 24px 0 0; line-height: 1.6;">
                Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, ignora este correo.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #fdf2f8; padding: 16px 24px; text-align: center; border-top: 1px solid #fce7f3;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 Brenn's — Todos los derechos reservados</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })

  return NextResponse.json({ ok: true })
}