// src/app/api/auth/reset-contrasena/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
  }

  // Buscar token válido
  const registro = await prisma.tokenRecuperacion.findUnique({
    where: { token },
    include: { usuario: true },
  })

  if (!registro) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
  }

  if (registro.usado) {
    return NextResponse.json({ error: "Este enlace ya fue usado" }, { status: 400 })
  }

  if (new Date() > registro.expira) {
    return NextResponse.json({ error: "El enlace ha expirado. Solicita uno nuevo" }, { status: 400 })
  }

  // Actualizar contraseña
  const hash = await bcrypt.hash(password, 10)
  await prisma.usuario.update({
    where: { id: registro.usuario_id },
    data:  { password: hash, intentos_fallidos: 0, cuenta_bloqueada: false },
  })

  // Marcar token como usado
  await prisma.tokenRecuperacion.update({
    where: { token },
    data:  { usado: true },
  })

  return NextResponse.json({ ok: true })
}