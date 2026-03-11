// src/app/api/admin/usuarios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""

  const usuarios = await prisma.usuario.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { correo: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, nombre: true, correo: true, telefono: true },
    take: 5,
  })

  return NextResponse.json(usuarios)
}