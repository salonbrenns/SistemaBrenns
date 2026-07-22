import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Solo clientes pueden inscribirse; admin/empleado gestionan desde el panel
  const role = session.user.role as string | undefined
  if (role && role !== "CLIENTE") {
    return NextResponse.json({ error: "Solo clientes pueden inscribirse en cursos" }, { status: 403 })
  }

  const { id } = await params
  const cursoId   = Number(id)
  const usuarioId = Number(session.user.id)

  if (isNaN(cursoId)) {
    return NextResponse.json({ error: "ID de curso inválido" }, { status: 400 })
  }

  const body = await req.json()
  // Solo se acepta pago completo por transferencia
  const metodoPago = "TRANSFERENCIA"
  const tipoPago   = "COMPLETO"

  try {
    // 1. Verificar que el curso existe y está activo (pre-check)
    const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
    if (!curso || !curso.activo) {
      return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })
    }

    // 2. Verificar que el usuario no esté ya inscrito
    const yaInscrito = await prisma.inscripcion.findFirst({
      where: { usuario_id: usuarioId, curso_id: cursoId, estado: "ACTIVO" },
    })
    if (yaInscrito) {
      return NextResponse.json({ error: "Ya estás inscrito en este curso" }, { status: 409 })
    }

    // 3. Monto = precio total completo
    const precioTotal = Number(curso.precio_total)
    const monto = precioTotal

    // 4. Crear inscripción + pago en transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 4a. Re-verificar cupo dentro de la transacción (previene race conditions)
      const cursoActual = await tx.curso.findUnique({
        where:  { id: cursoId },
        select: { inscritos: true, cupo_maximo: true },
      })
      if (!cursoActual || cursoActual.inscritos >= cursoActual.cupo_maximo) {
        throw new Error("cupo_agotado")
      }

      const inscripcion = await tx.inscripcion.create({
        data: {
          usuario_id: usuarioId,
          curso_id:   cursoId,
          estado:     "ACTIVO",
        },
      })

      const pago = await tx.pagoCurso.create({
        data: {
          inscripcion_id: inscripcion.id,
          numero_pago:    1,
          monto:          monto,
          metodo_pago:    metodoPago,
          estado:         "PENDIENTE",
        },
      })

      await tx.curso.update({
        where: { id: cursoId },
        data:  { inscritos: { increment: 1 } },
      })

      return { inscripcion, pago }
    })

    return NextResponse.json({
      success: true,
      inscripcionId: resultado.inscripcion.id,
      pagoId:        resultado.pago.id,
      monto,
      tipoPago,
      metodoPago,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "cupo_agotado") {
      return NextResponse.json({ error: "El cupo del curso está completo" }, { status: 409 })
    }
    console.error("[inscribir]", error)
    return NextResponse.json({ error: "Error al procesar la inscripción" }, { status: 500 })
  }
}
