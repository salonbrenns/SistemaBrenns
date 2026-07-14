// src/app/api/admin/empleadas/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

// GET — listar empleadas
export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  // rol::text workaround — Prisma multi-schema enum comparison fails in WHERE clauses
  const ids = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM seguridad.tblusuarios WHERE rol::text = 'EMPLEADO'
  `
  const empleadas = await prisma.usuario.findMany({
    where: { id: { in: ids.map(r => r.id) } },
    select: {
      id: true, nombre: true, correo: true, telefono: true,
      activo: true, fecha_registro: true, image: true,
      _count: { select: { citasComoEmpleado: true } },
    },
    orderBy: { nombre: "asc" },
  })

  return NextResponse.json(empleadas)
}

// POST — crear nueva empleada
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { nombre, correo, telefono, password } = await req.json()

  if (!nombre || !correo || !password)
    return NextResponse.json({ error: "Nombre, correo y contraseña son requeridos" }, { status: 400 })

  const existe = await prisma.usuario.findUnique({ where: { correo } })
  if (existe) return NextResponse.json({ error: "Ya existe un usuario con ese correo" }, { status: 409 })

  const hash = await bcrypt.hash(password, 10)

  const empleada = await prisma.usuario.create({
    data: { nombre, correo, telefono: telefono || null, password: hash, rol: "EMPLEADO", activo: true },
    select: { id: true, nombre: true, correo: true, telefono: true, activo: true },
  })

  return NextResponse.json(empleada, { status: 201 })
}
