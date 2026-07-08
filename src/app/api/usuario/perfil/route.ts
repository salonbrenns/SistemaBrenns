// src/app/api/usuario/perfil/route.ts
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { withRasp } from "@/lib/withRasp"

// GET — devuelve datos del perfil incluyendo fecha de registro
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(session.user.id) },
      select: { nombre: true, correo: true, telefono: true, fecha_registro: true },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      nombre:          usuario.nombre,
      correo:          usuario.correo,
      telefono:        usuario.telefono,
      fecha_registro:  usuario.fecha_registro.toISOString(),
    })
  } catch (err) {
    console.error("Error obteniendo perfil:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PUT — actualiza nombre, correo y teléfono
async function profileHandler(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { nombre, correo, telefono } = await req.json()

    if (!nombre || !correo) {
      return NextResponse.json({ error: "Nombre y correo son requeridos" }, { status: 400 })
    }
