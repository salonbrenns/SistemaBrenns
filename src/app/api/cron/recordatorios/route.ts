// src/app/api/cron/recordatorios/route.ts
// Llama este endpoint desde un cron externo (Vercel Cron, cron-job.org, etc.)
// cada día a las 10:00 AM para enviar recordatorios de citas del día siguiente.
// Proteger con: CRON_SECRET en .env

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getMailTransporter } from "@/lib/email"

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
    const fechaStr = cita.fecha.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    const horaStr  = cita.hora.slice(0, 5) // "HH:MM"

    try {
      const transporter = getMailTransporter()
      await transporter?.sendMail({
        from:    `"Brenn's" <${process.env.GMAIL_USER}>`,
        to:      usuario.correo,
        subject: `Recordatorio: tu cita es mañana a las ${horaStr} — Brenn's`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ec4899, #f43f5e); padding: 28px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 26px;">Brenn's</h1>
              <p style="color: #fce7f3; margin: 6px 0 0; font-size: 14px;">Recordatorio de cita</p>
            </div>
            <div style="background: #fff; padding: 28px; border: 1px solid #fce7f3; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 16px;">Hola <strong>${usuario.nombre}</strong> 👋</p>
              <p style="color: #6b7280;">Te recordamos que tienes una cita programada para <strong>mañana</strong>:</p>

              <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <table style="width: 100%; font-size: 14px; color: #374151; border-collapse: collapse;">
                  <tr><td style="padding: 4px 0; color: #9ca3af; width: 120px;">📅 Fecha</td><td style="font-weight: 600; text-transform: capitalize;">${fechaStr}</td></tr>
                  <tr><td style="padding: 4px 0; color: #9ca3af;">🕐 Hora</td><td style="font-weight: 600;">${horaStr}</td></tr>
                  <tr><td style="padding: 4px 0; color: #9ca3af;">✨ Servicio</td><td style="font-weight: 600;">${cita.servicio.nombre}</td></tr>
                  ${cita.empleado ? `<tr><td style="padding: 4px 0; color: #9ca3af;">👩‍🎨 Estilista</td><td style="font-weight: 600;">${cita.empleado.nombre}</td></tr>` : ""}
                </table>
              </div>

              <p style="color: #6b7280; font-size: 14px;">Si necesitas cancelar o reagendar, visita <a href="${process.env.AUTH_URL}/mis-citas" style="color: #ec4899; font-weight: bold;">mis citas</a> con anticipación.</p>
              <p style="color: #6b7280; font-size: 14px;">¡Nos vemos mañana! 💅</p>

              <hr style="border: none; border-top: 1px solid #fce7f3; margin: 20px 0;" />
              <p style="color: #d1d5db; font-size: 11px; text-align: center;">Brenn's Beauty · Este correo es automático, no respondas.</p>
            </div>
          </div>
        `,
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
    total