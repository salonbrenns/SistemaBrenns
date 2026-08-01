import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { enviarCorreoRecuperacion } from "@/lib/email"
import crypto from "crypto"

// Rate limit: máx 3 solicitudes por IP en 10 minutos
const intentos = new Map<string, { count: number; first: number }>()
const MAX_INTENTOS = 3
const VENTANA_MS   = 10 * 60 * 1000 // 10 minutos

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

  const { correo } = await req.json()

  if (!correo) {
    return NextResponse.json({ error: "Correo requerido" }, { status: 400 })
  }

  const usuario = await prisma.usuario.findUnique({ where: { correo } })

  // Siempre responder igual (no revelar si el correo existe)
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

  enviarCorreoRecuperacion(correo, token).catch(() => {})

  return NextResponse.json({ ok: true })
}
