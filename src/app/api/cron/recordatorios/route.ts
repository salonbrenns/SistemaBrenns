// src/app/api/cron/recordatorios/route.ts
// Llama este endpoint desde un cron externo (Vercel Cron, cron-job.org, etc.)
// cada día a las 10:00 AM para enviar recordatorios de citas del día siguiente.
// Proteger con: CRON_SECRET en .env

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendRecordatorioCita } from "@/lib/email"

export async function GET(req: NextRequest) {
  // Verificar clave secreta
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Rango: mañana 00:00 → 23:59
  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const inicio = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0,  0,  0)
  const fin    = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59)

  // Citas del día siguiente que están PENDIENTE o CONFIRMADA y NO tienen recordatorio enviado
  const citas = await prisma.cita.findMany({
    where: {
      fecha: { gte: inicio, lte: fin },
      estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      recordatorio_enviado: false,
    },
    select: {
      id: true,
      hora: true,
      fecha: true,
      usuario: { select: { nombre: true, correo: true } },
      servicio: { select: { nombre: true } },
      empleado: { select: { nombre: true } },
    },
  })

  let enviados = 0
  let errores  = 0

  for (const cita of citas) {
    if (!cita.usuario) continue
    const usuario  = cita.usuario
    const horaStr = cita.hora.slice(0, 5) // "HH:MM"

    try {
      await sendRecordatorioCita({
        to:       usuario.correo,
        nombre:   usuario.nombre,
        servicio: cita.servicio.nombre,
        fecha:    cita.fecha,
        hora:     horaStr,
      })

      // Marcar recordatorio enviado
      await prisma.cita.update({
        where: { id: cita.id },
        data:  { recordatorio_enviado: true },
      })

      enviados++
    } catch (err) {
      console.error(`Error al enviar recordatorio cita #${cita.id}:`, err)
      errores++
    }
  }

  return NextResponse.json({
    ok: true,
    total: citas.length,
    enviados,
    errores,
  })
}
