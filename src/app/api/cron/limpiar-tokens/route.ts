// Limpieza mensual de tokens expirados o ya usados.
// Llamado por Vercel Cron el primer día de cada mes a las 03:00 AM.
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function esVercelCron(req: NextRequest) {
  return req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function GET(req: NextRequest) {
  if (!esVercelCron(req)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const ahora = new Date()

  const [tokensRecup, tokensVerif] = await Promise.all([
    // Tokens de recuperación: expirados O ya usados
    prisma.tokenRecuperacion.deleteMany({
      where: {
        OR: [
          { expira: { lt: ahora } },
          { usado: true },
        ],
      },
    }),
    // Tokens de verificación: expirados (los usados se borran solos al verificar)
    prisma.$executeRaw`
      DELETE FROM seguridad.tbltoken_verificacion
      WHERE expira < ${ahora}
    `,
  ])

  return NextResponse.json({
    ok: true,
    eliminados: {
      recuperacion: tokensRecup.count,
      verificacion: Number(tokensVerif),
    },
  })
}
