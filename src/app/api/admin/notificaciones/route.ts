// src/app/api/admin/notificaciones/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const hoy    = new Date()
  const inicio = new Date(hoy); inicio.setHours(0, 0, 0, 0)
  const fin    = new Date(hoy); fin.setDate(hoy.getDate() + 7); fin.setHours(23, 59, 59, 999)

  const citas = await prisma.cita.findMany({
    where: {
      fecha:  { gte: inicio, lte: fin },
      estado: { in: ["PENDIENTE", "CONFIRMADA"] },
    },
    include: {
      servicio: { select: { nombre: true, precio: true } },
      usuario:  { select: { id: true, nombre: true, correo: true, telefono: true } },
    },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  })

  const serialized = citas.map(c => ({
    ...c,
    fecha:     c.fecha.toISOString(),
    createdAt: c.createdAt.toISOString(),
    servicio: {
      nombre: c.servicio.nombre,
      precio: Number(c.servicio.precio),
    },
  }))

  return NextResponse.json(serialized)
}