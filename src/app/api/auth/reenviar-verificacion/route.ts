import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificacionEmail } from "@/lib/email"

type UsuarioRow = { id: number; nombre: string; correo: string; correo_verificado: boolean }

export async function POST(req: Request) {
  try {
    const { correo } = await req.json()
    if (!correo) return NextResponse.json({ error: "Correo requerido" }, { status: 400 })

    const rows = await prisma.$queryRaw<UsuarioRow[]>`
      SELECT id, nombre, correo, correo_verificado
      FROM seguridad.tblusuarios
      WHERE correo = ${correo}
    `

    // Siempre responder igual para no revelar si el correo existe
    if (!rows.length || rows[0].correo_verificado) {
      return NextResponse.json({ ok: true })
    }

    const usuario = rows[0]
    const token   = crypto.randomBytes(32).toString("hex")
    const expira  = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.$executeRaw`
      INSERT INTO seguridad.tbltoken_verificacion (usuario_id, token, expira)
      VALUES (${usuario.id}, ${token}, ${expira})
      ON CONFLICT (usuario_id) DO UPDATE SET token = ${token}, expira = ${expira}
    `

    sendVerificacionEmail({ to: usuario.correo, nombre: usuario.nombre, token })
      .catch(err => console.error("Error reenviando verificación:", err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error reenviar verificación:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
