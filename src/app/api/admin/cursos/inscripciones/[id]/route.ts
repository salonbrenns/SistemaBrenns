// PUT /api/admin/cursos/inscripciones/[id]
// Cambia el estado de una inscripción: COMPLETADO | CANCELADO | ACTIVO
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdminOrEmpleado() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminOrEmpleado()) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const inscripcionId = Number(id)
  if (isNaN(inscripcionId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  const { estado } = await req.json() as { estado: string }
  if (!["ACTIVO", "COMPLETADO", "CANCELADO"].includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    // Obtener la inscripción ANTES de modificarla para tener el curso_id original
    const inscripcionPrevia = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
    })
    if (!inscripcionPrevia) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    const inscripcion = await prisma.inscripcion.update({
      where: { id: inscripcionId },
      data:  { estado },
    })

    // Si se cancela, decrementar cupo del curso usando el curso_id previo
    if (estado === "CANCELADO" && inscripcionPrevia.estado !== "CANCELADO") {
      await prisma.curso.update({
        where: { id: inscripcionPrevia.curso_id },
        data:  { inscritos: { decrement: 1 } },
      })
    }

    return NextResponse.json(inscripcion)
  } catch {
    return NextResponse.json({ error: "Error al actualizar inscripción" }, { status: 500 })
  }
}
