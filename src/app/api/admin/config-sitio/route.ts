import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// ✅ Tipo para el body del POST en lugar de any
type ConfigBody = Record<string, string | number | boolean | object | null>

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const registros = await prisma.configSitio.findMany()
    const config: Record<string, unknown> = {}

    for (const r of registros) {
      try {
        if (r.valor.startsWith('{') || r.valor.startsWith('[')) {
          config[r.clave] = JSON.parse(r.valor)
        } else {
          config[r.clave] = r.valor
        }
      } catch {
        config[r.clave] = r.valor
      }
    }

    return NextResponse.json(config)
  } catch { // ✅ eliminada variable 'error' no usada
    return NextResponse.json({}, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const body = await req.json() as ConfigBody // ✅ tipo explícito

    await prisma.$transaction(
      Object.entries(body).map(([clave, valor]) => {
        const valorStr = (typeof valor === "object" && valor !== null)
          ? JSON.stringify(valor)
          : String(valor)

        return prisma.configSitio.upsert({
          where:  { clave },
          update: { valor: valorStr },
          create: { clave, valor: valorStr },
        })
      })
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error al guardar config:", err)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}