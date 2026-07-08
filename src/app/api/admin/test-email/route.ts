// src/app/api/admin/test-email/route.ts
// Endpoint SOLO para pruebas — envía emails de muestra al admin
// Acceso: GET /api/admin/test-email?tipo=agendada&para=tu@correo.com
// Eliminar o proteger antes de producción

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  sendCitaAgendada,
  sendCitaConfirmada,
  sendCitaCancelada,
  sendRecordatorioCita,
} from "@/lib/email"

const TIPOS = ["agendada", "confirmada", "cancelada-cliente", "cancelada-admin", "recordatorio"] as const

export async function GET(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json({ error: "Solo admins" }, { status: 401 })

  const tipo = req.nextUrl.searchParams.get("tipo") as typeof TIPOS[number] | null
  const para = req.nextUrl.searchParams.get("para") || session.user.email!

  if (!tipo || !TIPOS.includes(tipo)) {
    return NextResponse.json({
      mensaje: "Especifica ?tipo=...",
      tipos_disponibles: TIPOS,
      ejemplo: `/api/admin/test-email?tipo=agendada&para=${para}`,
    })
  }

  // Datos de muestra
  const datos = {
    to:       para,
    nombre:   "Clienta de Prueba",
    servicio: "Manicure Semipermanente",
    fecha:    new Date(Date.now() + 24 * 60 * 60 * 1000), // mañana
    hora:     "10:30",
  }

  let ok = false

  if (tipo === "agendada") {
    ok = await sendCitaAgendada({ ...datos, notas: "Sin alérgenos por favor" })
  } else if (tipo === "confirmada") {
    ok = await sendCitaConfirmada(datos)
  } else if (tipo === "cancelada-cliente") {
    ok = await sendCitaCancelada({
      ...datos,
      motivo: "Cancelada por la clienta con más de 24 horas de anticipación. El reembolso será procesado en 3-5 días hábiles.",
    })
  } else if (tipo === "cancelada-admin") {
    ok = await sendCitaCancelada({
      ...datos,
      motivo: "Cancelada por el salón. Lamentamos los inconvenientes — contáctanos para reagendar.",
    })
  } else if (tipo === "recordatorio") {
    ok = await sendRecordatorioCita(datos)
  }

  return NextResponse.json({
    ok,
    tipo,
    enviado_a: para,
    mensaje: ok
      ? `✅ Email "${tipo}" enviado a ${para}`
      : "❌ No se pudo enviar — revisa GMAIL_USER y GMAIL_APP_PASSWORD en .env",
  })
}
