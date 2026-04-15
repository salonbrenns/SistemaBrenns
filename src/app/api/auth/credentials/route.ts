// src/app/api/auth/credentials/route.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { correo, password } = await req.json()

    if (!correo || !password) {
      return Response.json({ error: "Correo y contraseña requeridos" }, { status: 400 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { correo: correo as string },
    })

    if (!usuario) {
      return Response.json({ error: "Correo o contraseña incorrectos" }, { status: 401 })
    }

    if (usuario.cuenta_bloqueada) {
      return Response.json({ error: "Tu cuenta está bloqueada." }, { status: 403 })
    }

    if (!usuario.activo) {
      return Response.json({ error: "Tu cuenta está desactivada." }, { status: 403 })
    }

    const passwordValida = await bcrypt.compare(password as string, usuario.password)

    if (!passwordValida) {
      const intentos = usuario.intentos_fallidos + 1

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { 
          intentos_fallidos: intentos, 
          cuenta_bloqueada: intentos >= 5 
        },
      })

      return Response.json({ error: "Correo o contraseña incorrectos" }, { status: 401 })
    }

    // Resetear intentos fallidos
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { intentos_fallidos: 0 },
    })

    return Response.json({
      id: String(usuario.id),
      name: usuario.nombre,
      email: usuario.correo,
      role: usuario.rol,
      telefono: usuario.telefono,
    })
  } catch (error) {
    console.error("Error en /api/auth/credentials:", error)
    
    // Mejor manejo del error sin usar 'any'
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Error interno del servidor"

    return Response.json({ 
      error: errorMessage 
    }, { status: 500 })
  }
}