// src/app/api/admin/citas/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { servicio_id, fecha, hora, usuario_id, nombre_contacto,
          telefono_contacto, metodo_pago, notas, estado } = body

  if (!servicio_id || !fecha || !hora) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
  }

  try {
    const cita = await prisma.cita.create({
      data: {
        servicio_id:       Number(servicio_id),
        fecha: new Date(fecha + "T12:00:00"),
        hora,
        usuario_id:        usuario_id ? Number(usuario_id) : null,
        nombre_contacto:   nombre_contacto || null,
        telefono_contacto: telefono_contacto || null,
        metodo_pago:       metodo_pago || "EFECTIVO",
        notas:             notas || null,
        estado:            estado || "CONFIRMADA",
      },
    })
    return NextResponse.json(cita, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al crear la cita" }, { status: 500 })
  }
}