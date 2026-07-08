// src/app/api/config-sitio/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const registros = await prisma.configSitio.findMany()
    const config = Object.fromEntries(registros.map(r => [r.clave, r.valor]))
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({}, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body: { clave: string; valor: string }[] = await req.json()

    await Promise.all(
      body.map(({ clave, valor }) =>
        prisma.configSitio.upsert({
          where:  { clave },
          update: { valor },
          create: { clave, valor },
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("ERROR config-sitio PATCH:", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
