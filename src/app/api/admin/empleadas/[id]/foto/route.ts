import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { validarArchivo } from "@/lib/uploadValidation"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

  const validacion = validarArchivo(file)
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.error }, { status: validacion.status })
  }

  try {
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder:           "Brenns-empleadas",
          public_id:        `empleada-${id}`,
          overwrite:        true,
          transformation:   [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
        },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    await prisma.usuario.update({
      where: { id: Number(id) },
      data:  { image: result.secure_url },
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error("Error upload foto empleada:", err)
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 })
  }
}
