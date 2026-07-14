// PUT /api/admin/cursos/pagos/[id]
// Confirma o rechaza un pago de curso (PENDIENTE → PAGADO | RECHAZADO)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendPagoCursoConfirmado, sendPagoCursoRechazado } from "@/lib/email"

async function isAdminOrEmpleado() {
  const session = await auth()
  const role = session?.user?.role
  return role === "ADMIN" || role === "EMPLEADO"
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdminOrEmpleado()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const pagoId = Number(id)
  if (isNaN(pagoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const { estado } = await req.json() as { estado: "PAGADO" | "RECHAZADO" }
  if (!["PAGADO", "RECHAZADO"].includes(estado)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
  }

  try {
    const pago = await prisma.pagoCurso.update({
      where: { id: pagoId },
      data:  { estado },
    })

    // Enviar email de notificación al alumno (sin bloquear la respuesta)
    void (async () => {
      try {
        const inscripcion = await prisma.inscripcion.findUnique({
          where: { id: pago.inscripcion_id },
        })
        if (!inscripcion) return

        const [usuario, curso] = await Promise.all([
          prisma.usuario.findUnique({ where: { id: inscripcion.usuario_id } }),
          prisma.curso.findUnique({ where: { id: inscripcion.curso_id } }),
        ])
        if (!usuario?.correo || !curso) return

        const nombre = [usuario.nombre, usuario.appaterno].filter(Boolean).join(" ")
        const monto  = Number(pago.monto)

        if (estado === "PAGADO") {
          await sendPagoCursoConfirmado({ to: usuario.correo, nombre, curso: curso.titulo, monto })
        } else {
          await sendPagoCursoRechazado({ to: usuario.correo, nombre, curso: curso.titulo, monto })
        }
      } catch (emailErr) {
        console.error("Error enviando email de pago curso:", emailErr)
      }
    })()

    return NextResponse.json(pago)
  } catch {
    return NextResponse.json({ error: "Error al actualizar pago" }, { status: 500 })
  }
}
