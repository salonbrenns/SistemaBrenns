// GET  /api/admin/certificados/plantilla  → devuelve la URL actual de la plantilla
// POST /api/admin/certificados/plantilla  → sube nueva imagen a Cloudinary y guarda la URL
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

const CLAVE = "certificado_plantilla"

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  const row = await prisma.configSitio.findUnique({ where: { clave: CLAVE } })
  return NextResponse.json({ plantilla: row?.valor ?? null })
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No se envió archivo" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "Brenns-certificados", resource_type: "image" },
          (err, result) => {
            if (err || !result) return reject(new Error(err?.message ?? "Upload fallido"))
            resolve(result.secure_url)
          }
        )
        .end(buffer)
    })

    await prisma.configSitio.upsert({
      where:  { clave: CLAVE },
      update: { valor: url },
      create: { clave: CLAVE, valor: url },
    })

    return NextResponse.json({ url })
  } catch (e) {
    console.error("[certificado/plantilla]", e)
    return NextResponse.json({ error: "Error al subir plantilla" }, { status: 500 })
  }
}
