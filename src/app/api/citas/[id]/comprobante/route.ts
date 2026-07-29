import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { validarComprobante } from "@/lib/uploadValidation"
import { sendEmail } from "@/lib/email"

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
  const citaId = Number(id)
  if (isNaN(citaId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  // Verificar que la cita pertenece al usuario
  const cita = await prisma.cita.findUnique({
    where: { id: citaId },
    include: {
      servicio: { select: { nombre: true } },
      usuario:  { select: { nombre: true, correo: true } },
    },
  })

  if (!cita) {
    return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
  }

  // Verificar que la cita pertenece al usuario
  // Primero por ID numérico (caso normal); fallback por email (sesiones antiguas con UUID)
  const userId    = Number(session.user.id)
  const userEmail = session.user.email ?? ""
  const esOwner   = (!isNaN(userId) && cita.usuario_id === userId)
                  || (!!userEmail && cita.usuario?.correo === userEmail)
  if (!esOwner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (cita.estado === "CANCELADA" || cita.estado === "COMPLETADA") {
    return NextResponse.json({ error: "No se puede subir comprobante para esta cita" }, { status: 400 })
  }
  if (cita.comprobante) {
    return NextResponse.json({ error: "Ya subiste un comprobante para esta cita" }, { status: 409 })
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
        { folder: "Brenns-Comprobantes" },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    // Guardar comprobante — la cita queda PENDIENTE hasta que el admin la verifique
    await prisma.cita.update({
      where: { id: citaId },
      data: { comprobante: result.secure_url },
    })

    const clienteNombre = cita.usuario?.nombre || session.user.name || "Cliente"

    // Notificar al admin para que revise manualmente
    const fechaStr = cita.fecha.toLocaleDateString("es-MX", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })

    sendEmail({
      to:      ADMIN_EMAIL,
      subject: `💳 Comprobante recibido — ${cita.servicio.nombre} (pendiente de revisión)`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#be123c;margin:0 0 12px;">💳 Comprobante de pago recibido</h2>
          <p style="color:#374151;margin:0 0 20px;">
            La clienta <strong>${clienteNombre}</strong> subió su comprobante de transferencia.
            <strong style="color:#d97706;">Revísalo y confirma o rechaza la cita desde el panel.</strong>
          </p>
          <table style="width:100%;border-radius:12px;background:#fdf2f8;padding:16px;margin-bottom:20px;border:1px solid #fbcfe8;border-spacing:0;">
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Servicio</td><td style="padding:4px 0;color:#374151;font-size:14px;">${cita.servicio.nombre}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Fecha</td><td style="padding:4px 0;color:#374151;font-size:14px;">${fechaStr}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Hora</td><td style="padding:4px 0;color:#374151;font-size:14px;">${cita.hora}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Monto</td><td style="padding:4px 0;color:#374151;font-size:14px;">${cita.total ? `$${Number(cita.total).toLocaleString("es-MX")} MXN` : "—"}</td></tr>
          </table>
          <a href="${result.secure_url}" target="_blank"
            style="display:inline-block;background:#be123c;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
            Ver comprobante 🔍
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:20px;">Panel admin → Pagos para confirmar o rechazar.</p>
        </div>
      `,
    }).catch(err => console.error("[comprobante] email admin:", err))

    return NextResponse.json({ ok: true, url: result.secure_url })
  } catch (err) {
    console.error("[comprobante] upload error:", err)
    return NextResponse.json({ error: "Error al subir comprobante" }, { status: 500 })
  }
}
