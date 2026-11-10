import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendVerificacionEmail } from "@/lib/email"

type UsuarioRow = { id: number; nombre: string; correo: string; correo_verificado: boolean }

// Rate limit: máx 3 solicitudes por IP en 10 minutos
const intentos = new Map<string, { count: number; first: number }>()
const MAX_INTENTOS = 3
const VENTANA_MS   = 10 * 60 * 1000

function excedeLimite(ip: string): boolean {
  const ahora = Date.now()
  const rec   = intentos.get(ip)
  if (!rec || ahora - rec.first > VENTANA_MS) {
    intentos.set(ip, { count: 1, first: ahora })
    return false
  }
  rec.count++
  return rec.count > MAX_INTENTOS
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown"

  if (excedeLimite(ip)) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
      { status: 429 }
    )
  }

  try {
    const { correo: correoRaw } = await req.json()

    // Sin espacios y en minúsculas, igual que en el registro
    const correo = String(correoRaw ?? "").trim().toLowerCase()
    if (!correo) return NextResponse.json({ error: "Correo requerido" }, { status: 400 })

    // LOWER() por si hay cuentas viejas guardadas con mayúsculas
    const rows = await prisma.$queryRaw<UsuarioRow[]>`
      SELECT id, nombre, correo, correo_verificado
      FROM seguridad.tblusuarios
      WHERE LOWER(correo) = ${correo}
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

    // Con await para que Vercel no congele la función antes de que Brevo responda
    const enviado = await sendVerificacionEmail({
      to:     usuario.correo,
      nombre: usuario.nombre,
      token,
    })

    if (!enviado) {
      console.error(`No se pudo reenviar la verificación a ${usuario.correo}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error en reenviar-verificacion:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}