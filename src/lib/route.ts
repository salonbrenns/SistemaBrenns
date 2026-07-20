import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { withRasp } from "@/lib/withRasp"
import { sendVerificacionEmail } from "@/lib/email"

async function registerHandler(req: NextRequest) {
  try {
    const { name, email, password, telefono } = await req.json()

    if (!name || !email || !password || !telefono) {
      return NextResponse.json(
        { error: "Nombre, correo, teléfono y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    // El registro público siempre crea un CLIENTE — nunca se acepta rol del body
    const rolFinal = "CLIENTE"

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { correo: email },
    })

    if (usuarioExistente) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // correo_verificado = false — debe verificar antes de iniciar sesión
    await prisma.$executeRaw`
      INSERT INTO seguridad.tblusuarios
        (nombre, correo, password, telefono, rol, activo, correo_verificado, intentos_fallidos, cuenta_bloqueada)
      VALUES
        (${name}, ${email}, ${passwordHash}, ${telefono}, ${rolFinal}::"Rol", true, false, 0, false)
    `

    const nuevoUsuario = await prisma.usuario.findUnique({
      where: { correo: email },
    })

    if (!nuevoUsuario) throw new Error("No se pudo recuperar el usuario creado")

    // Generar token de verificación (24 h)
    const token  = crypto.randomBytes(32).toString("hex")
    const expira = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.$executeRaw`
      INSERT INTO seguridad.tbltoken_verificacion (usuario_id, token, expira)
      VALUES (${nuevoUsuario.id}, ${token}, ${expira})
      ON CONFLICT (usuario_id) DO UPDATE SET token = ${token}, expira = ${expira}
    `

    // Enviar email (fire-and-forget, no bloquea el registro)
    sendVerificacionEmail({
      to:     nuevoUsuario.correo,
      nombre: nuevoUsuario.nombre,
      token,
    }).catch(err => console.error("Error enviando email de verificación:", err))

    return NextResponse.json(
      {
        message: "Cuenta creada. Revisa tu correo para verificarla.",
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export const POST = withRasp(registerHandler);
