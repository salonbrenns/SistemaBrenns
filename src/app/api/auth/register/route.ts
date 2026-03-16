import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const ROLES_VALIDOS = ["ADMIN", "DOCENTE", "EMPLEADO", "CLIENTE"]

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, telefono, rol } = await req.json()

    if (!name || !email || !password || !telefono) {
      return NextResponse.json(
        { error: "Nombre, correo, teléfono y contraseña son requeridos" },
        { status: 400 }
      )
    }

    const rolFinal = ROLES_VALIDOS.includes(rol) ? rol : "CLIENTE"

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

    await prisma.$executeRaw`
      INSERT INTO seguridad.tblusuarios 
        (nombre, correo, password, telefono, rol, activo, intentos_fallidos, cuenta_bloqueada)
      VALUES 
        (${name}, ${email}, ${passwordHash}, ${telefono}, ${rolFinal}::"Rol", true, 0, false)
    `

    const nuevoUsuario = await prisma.usuario.findUnique({
      where: { correo: email },
    })

    return NextResponse.json(
      {
        message: "Usuario registrado exitosamente",
        user: {
          id: nuevoUsuario!.id,
          nombre: nuevoUsuario!.nombre,
          correo: nuevoUsuario!.correo,
          telefono: nuevoUsuario!.telefono,
          rol: nuevoUsuario!.rol,
        },
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