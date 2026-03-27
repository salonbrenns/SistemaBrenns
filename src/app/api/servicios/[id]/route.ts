// src/app/api/servicios/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// --- FUNCIÓN GET (La que ya tenías) ---
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const servicio = await prisma.servicio.findUnique({
      where: { id: Number(id), activo: true },
      select: {
        id:       true,
        nombre:   true,
        precio:   true,
        duracion: true,
        imagen:   true,
      },
    })

    if (!servicio) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      ...servicio,
      precio: Number(servicio.precio),
    })
    
  } catch (_err) {
    console.error("Error obteniendo servicio:", _err)
    return NextResponse.json(
      { error: "Error interno del servidor" }, 
      { status: 500 }
    )
  }
}

// --- NUEVA FUNCIÓN PATCH (Para deshabilitar) ---
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const servicioActualizado = await prisma.servicio.update({
      where: { id: Number(id) },
      data: {
        // Esto actualizará el campo 'activo' con el valor que enviamos (false)
        activo: body.activo, 
      },
    })

    return NextResponse.json(servicioActualizado)
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json(
      { error: "Error al actualizar el servicio" },
      { status: 500 }
    )
  }
}