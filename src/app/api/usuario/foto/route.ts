import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { image } = await req.json()

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "URL de imagen requerida" }, { status: 400 })
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { correo: session.user.email },
      data: { image },
    })

    return NextResponse.json({ success: true, image: usuarioActualizado.image })

  } catch (error: unknown) {
    console.error("Error al guardar foto en BD:", error)
    return NextResponse.json({
      error: "No se pudo guardar la foto en la base de datos"
    }, { status: 500 })
  }
}