import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { correo, password } = await req.json()

    if (!correo || !password) {
      return Response.json({ error: "Por favor ingresa tu correo y contrasena.", code: "MISSING_FIELDS" }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({ where: { correo: correo as string } })

    if (!usuario) {
      return Response.json({ error: "No existe una cuenta con ese correo electronico.", code: "USER_NOT_FOUND" }, { status: 401 })
    }

    if (usuario.cuenta_bloqueada) {
      return Response.json({ error: "Tu cuenta esta bloqueada por demasiados intentos fallidos. Contacta al administrador.", code: "ACCOUNT_LOCKED" }, { status: 403 })
    }

    if (!usuario.activo) {
      return Response.json({ error: "Tu cuenta esta desactivada. Contacta al administrador.", code: "ACCOUNT_INACTIVE" }, { status: 403 })
    }

    // Verificar que el correo haya sido confirmado
    const verif = await prisma.$queryRaw<{ correo_verificado: boolean }[]>`
      SELECT correo_verificado FROM seguridad.tblusuarios WHERE id = ${usuario.id}
    `
    if (verif[0] && !verif[0].correo_verificado) {
      return Response.json({
        error: "Debes verificar tu correo electrónico. Revisa tu bandeja de entrada.",
        code: "EMAIL_NOT_VERIFIED",
      }, { status: 403 })
    }

    const passwordValida = await bcrypt.compare(password as string, usuario.password)

    if (!passwordValida) {
      const intentos  = usuario.intentos_fallidos + 1
      const bloqueada = intentos >= 5

      await prisma.usuario.update({
        where: { id: usuario.id },
        data:  { intentos_fallidos: intentos, cuenta_bloqueada: bloqueada },
      })

      const restantes = 5 - intentos
      return Response.json({
        error: bloqueada
          ? "Cuenta bloqueada por 5 intentos fallidos. Contacta al administrador."
          : `Contrasena incorrecta. Te queda${restantes === 1 ? "" : "n"} ${restantes} intento${restantes === 1 ? "" : "s"}.`,
        code: bloqueada ? "ACCOUNT_LOCKED" : "WRONG_PASSWORD",
      }, { status: 401 })
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data:  { intentos_fallidos: 0 },
    })

    return Response.json({
      id:       String(usuario.id),
      name:     usuario.nombre,
      email:    usuario.correo,
      role:     usuario.rol,
      telefono: usuario.telefono,
    })
  } catch (error) {
    console.error("Error en /api/auth/credentials:", error)
    return Response.json({ error: "Error de conexion con el servidor. Intenta mas tarde.", code: "SERVER_ERROR" }, { status: 500 })
  }
}
