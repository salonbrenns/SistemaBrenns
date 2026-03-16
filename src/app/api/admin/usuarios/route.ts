import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

type UsuarioRaw = {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  rol: string
  activo: boolean
  fecha_registro: Date
}

export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const todos = searchParams.get("todos") === "true"

  if (todos) {
    const usuarios = await prisma.$queryRaw<UsuarioRaw[]>`
      SELECT id, nombre, correo, telefono, rol::text, activo, fecha_registro
      FROM seguridad.tblusuarios
      WHERE rol::text IN ('ADMIN', 'DOCENTE', 'EMPLEADO')
      ORDER BY fecha_registro DESC
    `
    return NextResponse.json(usuarios)
  }

  const usuarios = await prisma.usuario.findMany({
    where: {
      OR: [
        { nombre: { contains: q, mode: "insensitive" } },
        { correo: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, nombre: true, correo: true, telefono: true },
    take: 5,
  })

  return NextResponse.json(usuarios)
}

export async function PATCH(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id, rol, activo } = await req.json()

  if (rol) {
    await prisma.$executeRaw`
      UPDATE seguridad.tblusuarios 
      SET rol = ${rol}::"Rol"
      WHERE id = ${id}
    `
    const usuario = await prisma.$queryRaw<UsuarioRaw[]>`
      SELECT id, nombre, correo, telefono, rol::text, activo, fecha_registro
      FROM seguridad.tblusuarios
      WHERE id = ${id}
    `
    return NextResponse.json(usuario[0])
  }

  const usuario = await prisma.usuario.update({
    where: { id },
    data: { ...(activo !== undefined && { activo }) },
  })

  return NextResponse.json(usuario)
}

export async function DELETE(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = Number(searchParams.get("id"))

  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  try {
    await prisma.usuario.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "No se puede eliminar este usuario" }, { status: 400 })
  }
}