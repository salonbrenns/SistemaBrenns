// POST /api/pagos-curso/[id]/comprobante
// La alumna sube su comprobante de transferencia para un PagoCurso PENDIENTE.
// Guarda la URL en Cloudinary, actualiza comprobante_url en PagoCurso
// y notifica al admin por email.
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { validarComprobante } from "@/lib/uploadValidation"
import { sendComprobantesCursoAdmin } from "@/lib/email"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ADMIN_EMAIL = "salonbrenns11@gmail.com"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const pagoId    = Number(id)
  const usuarioId = Number(session.user.id)

  if (isNaN(pagoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  // Cargar el pago con su inscripción y curso
  const pago = await prisma.pagoCurso.findUnique({
    where: { id: pagoId },
    include: {
      inscripcion: {
        include: {
          curso: { select: { titulo: true } },
        },
      },
    },
  })

  if (!pago) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
  }

  // Solo el dueño de la inscripción puede subir el comprobante
  if (pago.inscripcion.usuario_id !== usuarioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Cargar datos del usuario por separado
  const alumnaDb = await prisma.usuario.findUnique({
    where: { id: pago.inscripcion.usuario_id },
    select: { nombre: true, appaterno: true, correo: true },
  })

  if (pago.estado !== "PENDIENTE") {
    return NextResponse.json({ error: "Solo puedes subir comprobante para un pago pendiente" }, { status: 400 })
  }

  if (pago.comprobante_url) {
    return NextResponse.json({ error: "Ya subiste un comprobante para este pago" }, { status: 409 })
  }

  // Recibir archivo
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
  }

  const validacion = validarComprobante(file)
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: validacion.status })
  }

  try {
    // Subir a Cloudinary
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "Brenns-Comprobantes-Cursos" },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    // Guardar URL en el pago (estado sigue PENDIENTE — admin confirma)
    await prisma.pagoCurso.update({
      where: { id: pagoId },
      data:  { comprobante_url: result.secure_url },
    })

    // Notificar al admin
    const nombre  = [alumnaDb?.nombre, alumnaDb?.appaterno].filter(Boolean).join(" ") || "Alumna"
    const correo  = alumnaDb?.correo || ""
    const curso   = pago.inscripcion.curso?.titulo || "Curso"
    const monto   = Number(pago.monto)

    sendComprobantesCursoAdmin({
      to:             ADMIN_EMAIL,
      alumna:         nombre,
      correoAlumna:   correo,
      curso,
      monto,
      pagoId,
      comprobanteUrl: result.secure_url,
    }).catch(err => console.error("[comprobante-curso] email admin:", err))

    return NextResponse.json({ ok: true, url: result.secure_url })
  } catch (err) {
    console.error("[comprobante-curso] upload error:", err)
    return NextResponse.json({ error: "Error al subir comprobante" }, { status: 500 })
  }
}
