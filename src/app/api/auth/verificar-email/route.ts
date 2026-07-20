import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type TokenRow = {
  id:         number
  usuario_id: number
  token:      string
  expira:     Date
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 })
  }

  try {
    // Buscar el token
    const rows = await prisma.$queryRaw<TokenRow[]>`
      SELECT id, usuario_id, token, expira
      FROM seguridad.tbltoken_verificacion
      WHERE token = ${token}
    `

    if (!rows.length) {
      return NextResponse.json({ error: "Token inválido o ya utilizado" }, { status: 400 })
    }

    const registro = rows[0]

    if (new Date() > new Date(registro.expira)) {
      // Token expirado — eliminar y pedir reenvío
      await prisma.$executeRaw`
        DELETE FROM seguridad.tbltoken_verificacion WHERE id = ${registro.id}
      `
      return NextResponse.json({ error: "El enlace expiró. Solicita uno nuevo.", code: "TOKEN_EXPIRED" }, { status: 400 })
    }

    // Marcar correo como verificado y eliminar token
    await prisma.$executeRaw`
      UPDATE seguridad.tblusuarios
      SET correo_verificado = true
      WHERE id = ${registro.usuario_id}
    `
    await prisma.$executeRaw`
      DELETE FROM seguridad.tbltoken_verificacion WHERE id = ${registro.id}
    `

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error verificando email:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
