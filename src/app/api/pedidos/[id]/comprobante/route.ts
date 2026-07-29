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
  const pedidoId = Number(id)
  if (isNaN(pedidoId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  // Verificar que el pedido pertenece al usuario
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      usuario: { select: { nombre: true, correo: true } },
    },
  })

  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
  }

  const userId    = Number(session.user.id)
  const userEmail = session.user.email ?? ""
  const esOwner   = (!isNaN(userId) && pedido.usuario_id === userId)
                  || (!!userEmail && pedido.usuario?.correo === userEmail)

  if (!esOwner) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  if (pedido.estado === "CANCELADO" || pedido.estado === "ENTREGADO") {
    return NextResponse.json({ error: "No se puede subir comprobante para este pedido" }, { status: 400 })
  }

  if (pedido.comprobante_url) {
    return NextResponse.json({ error: "Ya subiste un comprobante para este pedido" }, { status: 409 })
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

    // Guardar URL — el pedido queda PENDIENTE hasta que el admin verifique
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { comprobante_url: result.secure_url },
    })

    // Notificar al admin para revisión manual
    const clienteNombre = pedido.usuario?.nombre || pedido.nombre_cliente
    const clienteEmail  = pedido.correo_cliente

    sendEmail({
      to:      ADMIN_EMAIL,
      subject: `💳 Comprobante de pedido #${String(pedidoId).padStart(6, '0')} — pendiente de revisión`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
          <h2 style="color:#be123c;margin:0 0 12px;">💳 Comprobante de transferencia recibido</h2>
          <p style="color:#374151;margin:0 0 20px;">
            La clienta <strong>${clienteNombre}</strong> subió su comprobante de transferencia.
            <strong style="color:#d97706;">Revísalo y marca el pedido como PAGADO desde el panel si es correcto.</strong>
          </p>
          <table style="width:100%;border-radius:12px;background:#fef2f2;padding:16px;margin-bottom:20px;border:1px solid #fecaca;border-spacing:0;">
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;"># Pedido</td><td style="padding:4px 0;color:#374151;font-size:14px;">#${String(pedidoId).padStart(6, '0')}</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Cliente</td><td style="padding:4px 0;color:#374151;font-size:14px;">${clienteNombre} (${clienteEmail})</td></tr>
            <tr><td style="padding:4px 0;color:#9d174d;font-size:13px;font-weight:600;">Total</td><td style="padding:4px 0;color:#374151;font-size:14px;">$${Number(pedido.total).toLocaleString("es-MX")} MXN</td></tr>
          </table>
          <a href="${result.secure_url}" target="_blank"
            style="display:inline-block;background:#be123c;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
            Ver comprobante 🔍
          </a>
          <p style="color:#9ca3af;font-size:12px;margin-top:20px;">Panel admin → Pedidos para ver los detalles completos.</p>
        </div>
      `,
    }).catch(err => console.error("[comprobante-pedido] email admin:", err))

    return NextResponse.json({ ok: true, url: result.secure_url })
  } catch (err) {
    console.error("[comprobante-pedido] upload error:", err)
    return NextResponse.json({ error: "Error al subir comprobante" }, { status: 500 })
  }
}
