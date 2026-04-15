// src/app/api/usuario/password/route.ts
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { passwordActual, passwordNueva } = await req.json()

    if (!passwordActual || !passwordNueva) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    if (passwordNueva.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener mínimo 8 caracteres" }, { status: 400 })
    }

    // Obtener usuario con su password actual
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(session.user.id) },
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password)
    if (!passwordValida) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 })
    }

    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(passwordNueva, 12)

    await prisma.usuario.update({
      where: { id: Number(session.user.id) },
      data: { password: passwordHash },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error cambiando contraseña:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}