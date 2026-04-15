import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PERMISOS_SISTEMA } from "@/lib/permisos" 

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}


export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const usuario_id = Number(searchParams.get("usuario_id"))
  if (!usuario_id) return NextResponse.json({ error: "usuario_id requerido" }, { status: 400 })

  const permisos = await prisma.permisoUsuario.findMany({
    where: { usuario_id },
  })

  // Combinar con lista completa
  const resultado = PERMISOS_SISTEMA.map(p => ({
    ...p,
    activo: permisos.find(x => x.permiso === p.key)?.activo ?? false,
  }))

  return NextResponse.json(resultado)
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { usuario_id, permiso, activo } = await req.json()

  await prisma.permisoUsuario.upsert({
    where: { usuario_id_permiso: { usuario_id, permiso } },
    update: { activo },
    create: { usuario_id, permiso, activo },
  })

  return NextResponse.json({ ok: true })
}
