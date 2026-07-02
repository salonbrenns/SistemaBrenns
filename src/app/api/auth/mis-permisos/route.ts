// src/app/api/auth/mis-permisos/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json([])

  const userId = parseInt((session.user as { id?: string })?.id ?? "0")
  if (!userId) return NextResponse.json([])

  const permisos = await prisma.permisoUsuario.findMany({
    where: { usuario_id: userId, activo: true },
    select: { permiso: true },
  })

  return NextResponse.json(permisos.map(p => p.permiso))
}