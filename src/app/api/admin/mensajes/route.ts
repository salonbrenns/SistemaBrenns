// src/app/api/admin/mensajes/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { cita_id, usuario_id, mensaje } = await req.json()

  if (!cita_id || !mensaje) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  try {
    const aviso = await prisma.avisoAdmin.create({
      data: {
        cita_id:    Number(cita_id),
        usuario_id: usuario_id ? Number(usuario_id) : null,
        mensaje,
        leido:      false,
      },
    })
    return NextResponse.json(aviso, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 })
  }
}