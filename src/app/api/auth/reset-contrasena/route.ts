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

  const registro = await prisma.tokenRecuperacion.findUnique({
    where: { token },
    include: { usuario: true },
  })

  console.log("🔍 Token encontrado:", !!registro)
  console.log("👤 Usuario ID:", registro?.usuario_id)

  if (!registro) return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
  if (registro.usado) return NextResponse.json({ error: "Este enlace ya fue usado" }, { status: 400 })
  if (new Date() > registro.expira) return NextResponse.json({ error: "El enlace ha expirado" }, { status: 400 })

  const hash = await bcrypt.hash(password, 10)
  console.log("🔑 Hash generado:", hash.substring(0, 20) + "...")

  try {
    const actualizado = await prisma.usuario.update({
      where: { id: registro.usuario_id },
      data: { password: hash, intentos_fallidos: 0, cuenta_bloqueada: false },
    })
    console.log("✅ Contraseña actualizada para:", actualizado.correo)
  } catch (err) {
    console.error("❌ Error actualizando contraseña:", err)
    return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 })
  }

  await prisma.tokenRecuperacion.update({
    where: { token },
    data: { usado: true },
  })

  return NextResponse.json({ ok: true })
}