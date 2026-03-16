// src/app/api/horarios/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const fechaStr   = searchParams.get("fecha")
    const servicioId = searchParams.get("servicioId")

    if (!fechaStr) return NextResponse.json([])

    const [anio, mes, dia] = fechaStr.split("-").map(Number)
    const fecha = new Date(anio, mes - 1, dia)
    const jsDia = fecha.getDay()
    const diaSemana = jsDia === 0 ? null : jsDia

    if (diaSemana === null) return NextResponse.json([])

    const horariosActivos = await prisma.horarioDisponible.findMany({
      where: { diaSemana, activo: true },
      orderBy: { hora: "asc" },
    })

    if (horariosActivos.length === 0) return NextResponse.json([])

    const fechaInicio = new Date(fechaStr + "T00:00:00")
    const fechaFin    = new Date(fechaStr + "T23:59:59")

    let citasExistentes: { hora: string }[] = []

    if (servicioId && servicioId !== "") {
      citasExistentes = await prisma.$queryRaw<{ hora: string }[]>`
        SELECT hora FROM agenda.tblcitas
        WHERE fecha >= ${fechaInicio}
        AND fecha <= ${fechaFin}
        AND estado::text IN ('PENDIENTE', 'CONFIRMADA')
        AND servicio_id = ${Number(servicioId)}
      `
    } else {
      citasExistentes = await prisma.$queryRaw<{ hora: string }[]>`
        SELECT hora FROM agenda.tblcitas
        WHERE fecha >= ${fechaInicio}
        AND fecha <= ${fechaFin}
        AND estado::text IN ('PENDIENTE', 'CONFIRMADA')
      `
    }

    const horasBloqueadas = await prisma.horaBloqueada.findMany({
      where: { fecha: { gte: fechaInicio, lte: fechaFin } },
      select: { hora: true },
    })

    const horasOcupadas = new Set(citasExistentes.map(c => c.hora))
    const horasBloq     = new Set(horasBloqueadas.map(h => h.hora))

    const ahora    = new Date()
    const ahoraStr = ahora.toLocaleDateString("en-CA")
    const esHoy    = fechaStr === ahoraStr

    const resultado = horariosActivos.map(h => {
      let horaYaPaso = false
      if (esHoy) {
        const [horaH, minH] = h.hora.split(":").map(Number)
        horaYaPaso = horaH < ahora.getHours() ||
          (horaH === ahora.getHours() && minH <= ahora.getMinutes())
      }
      return {
        id:         h.id,
        hora:       h.hora,
        disponible: !horasOcupadas.has(h.hora) && !horasBloq.has(h.hora) && !horaYaPaso,
      }
    })

    return NextResponse.json(resultado)

  } catch (error) {
    console.error("❌ Error en horarios:", error)
    return NextResponse.json([])
  }
}