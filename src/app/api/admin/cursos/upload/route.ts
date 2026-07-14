import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EMPLEADO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 })
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: "Brenns-cursos",
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result?.secure_url)
            }
          ).end(buffer)
        })
      })
    )

    return NextResponse.json({ urls: uploads })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Error subiendo imágenes" }, { status: 500 })
  }
}