// src/app/api/admin/mensajes/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { sendAvisoAdmin } from "@/lib/email"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { cita_id, usuario_id, mensaje } = await req.json()

  if (!cita_id || !mensaje) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
  }

  try {
    // 1. Guardar el aviso en BD
    const aviso = await prisma.avisoAdmin.create({
      data: {
        cita_id:    Number(cita_id),
        usuario_id: usuario_id ? Number(usuario_id) : null,
        mensaje,
        leido:      false,
      },
    })

    // 2. Obtener datos de la cita + usuario para el correo
    const cita = await prisma.cita.findUnique({
      where: { id: Number(cita_id) },
      include: {
        servicio: { select: { nombre: true } },
        usuario:  { select: { nombre: true, correo: true } },
      },
    })

    // 3. Enviar correo si hay cliente con cuenta y correo
    if (cita?.usuario?.correo) {
      await sendAvisoAdmin({
        to:       cita.usuario.correo,
        nombre:   cita.usuario.nombre,
        mensaje,
        servicio: cita.servicio.nombre,
        fecha:    cita.fecha,
        hora:     cita.hora,
      }).catch(err => console.error("⚠️ Error al enviar email de aviso:", err))
    }

    return NextResponse.json({ ...aviso, emailEnviado: !!cita?.usuario?.correo }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 })
  }
}