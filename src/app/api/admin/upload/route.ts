// src/app/api/admin/upload/route.ts
import { NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file     = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Nombre único para evitar colisiones
    const ext      = file.name.split(".").pop() || "jpg"
   const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`
    // Guardar en public/uploads/
    const uploadDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error("Error upload:", err)
    return NextResponse.json({ error: "Error al subir imagen" }, { status: 500 })
  }
}