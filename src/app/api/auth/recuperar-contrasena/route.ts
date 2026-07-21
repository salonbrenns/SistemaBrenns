import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarCorreoRecuperacion } from "@/lib/email"
import crypto from "crypto"

export async function POST(req: Request) {
  const { correo } = await req.json()

  if (!correo) {
    return NextResponse.json({ error: "Correo requerido" }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  // Siempre responder igual (seguridad)
  if (!usuario) {
    return NextResponse.json({ ok: true })
  }

  const token  = crypto.randomBytes(32).toString("hex")
  const expira = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

  await prisma.tokenRecuperacion.upsert({
    where:  { usuario_id: usuario.id },
    update: { token, expira, usado: false },
    create: { usuario_id: usuario.id, token, expira, usado: false },
  })

  // Fire-and-forget: siempre responder ok para no revelar si el correo existe
  enviarCorreoRecuperacion(correo, token).catch(err =>
    console.error("❌ Error enviando correo de recuperación:", err)
  )

  return NextResponse.json({ ok: true })
}