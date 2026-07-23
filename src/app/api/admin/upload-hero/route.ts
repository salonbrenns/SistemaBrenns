import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"
import { validarArchivo } from "@/lib/uploadValidation"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const session = await auth()
  
  // Verificación de seguridad
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData    = await req.formData()
    const file        = formData.get("file") as File | null
    const folderParam = formData.get("folder") as string | null

    // Whitelist de carpetas permitidas para evitar inyección de rutas en Cloudinary
    const CARPETAS_PERMITIDAS = ["Brenns-Home", "Brenns-Banner", "Brenns-Galeria"]
    const folder = CARPETAS_PERMITIDAS.includes(folderParam ?? "")
      ? (folderParam as string)
      : "Brenns-Home"

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
    }

    const validacion = validarArchivo(file)
    if (!validacion.ok) {
      return NextResponse.json({ error: validacion.error }, { status: validacion.status })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (err) {
    console.error("Error en upload:", err)
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 })
  }
}