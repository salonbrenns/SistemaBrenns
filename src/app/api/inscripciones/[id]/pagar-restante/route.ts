import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const inscripcionId = Number(id)
  const usuarioId     = Number(session.user.id)

  if (isNaN(inscripcionId)) {
    return NextResponse.json({ error: "ID de inscripción inválido" }, { status: 400 })
  }

  try {
    // 1. Cargar inscripción con pagos y curso
    const inscripcion = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      include: {
        curso: { select: { precio_total: true } },
        pagos: true,
      },
    })

    if (!inscripcion) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 })
    }

    // 2. Solo el dueño de la inscripción puede hacer este pago
    if (inscripcion.usuario_id !== usuarioId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // 3. La inscripción debe estar activa
    if (inscripcion.estado !== "ACTIVO") {
      return NextResponse.json({ error: "La inscripción no está activa" }, { status: 400 })
    }

    // 4. Calcular saldo restante
    const precioTotal  = Number(inscripcion.curso?.precio_total ?? 0)
    const totalPagado  = inscripcion.pagos
      .filter((p) => p.estado === "PAGADO")
      .reduce((sum, p) => sum + Number(p.monto), 0)
    const restante = precioTotal - totalPagado

    if (restante <= 0) {
      return NextResponse.json({ error: "El curso ya está completamente pagado" }, { status: 400 })
    }

    // 5. No debe haber un pago pendiente ya registrado
    const hayPendiente = inscripcion.pagos.some((p) => p.estado === "PENDIENTE")
    if (hayPendiente) {
      return NextResponse.json({
        error: "Ya tienes un pago pendiente de verificación. Espera a que el administrador lo confirme.",
      }, { status: 409 })
    }

    // 6. Crear el pago del saldo restante (PENDIENTE hasta que admin confirme)
    const numeroPago = inscripcion.pagos.length + 1
    const pago = await prisma.pagoCurso.create({
      data: {
        inscripcion_id: inscripcionId,
        numero_pago:    numeroPago,
        monto:          restante,
        metodo_pago:    "TRANSFERENCIA",
        estado:         "PENDIENTE",
      },
    })

    return NextResponse.json({
      success: true,
      pagoId:  pago.id,
      monto:   restante,
      message: "Pago registrado. El administrador lo verificará y confirmará tu pago.",
    })
  } catch (error) {
    console.error("[pagar-restante]", error)
    return NextResponse.json({ error: "Error al registrar el pago" }, { status: 500 })
  }
}
