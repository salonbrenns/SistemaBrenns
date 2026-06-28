// src/app/api/admin/reportes/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const hoy = new Date()
  const inicioAnio = new Date(hoy.getFullYear(), 0, 1)

  // Ingresos por mes (citas COMPLETADAS, últimos 12 meses)
  const doce = new Date(hoy)
  doce.setMonth(doce.getMonth() - 11)
  doce.setDate(1)
  doce.setHours(0, 0, 0, 0)

  const citasMes = await prisma.cita.groupBy({
    by: ["fecha"],
    where: { estado: "COMPLETADO", fecha: { gte: doce } },
    _sum: { total: true },
    _count: { id: true },
  })

  // Agrupar por mes manualmente
  const mapaIngresos: Record<string, { ingresos: number; citas: number }> = {}
  for (const c of citasMes) {
    const key = `${c.fecha.getFullYear()}-${String(c.fecha.getMonth() + 1).padStart(2, "0")}`
    if (!mapaIngresos[key]) mapaIngresos[key] = { ingresos: 0, citas: 0 }
    mapaIngresos[key].ingresos += Number(c._sum.total ?? 0)
    mapaIngresos[key].citas    += c._count.id
  }

  const ingresosPorMes = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(doce.getFullYear(), doce.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const mes = d.toLocaleString("es-MX", { month: "short" })
    return { mes: `${mes} ${d.getFullYear()}`, ...( mapaIngresos[key] ?? { ingresos: 0, citas: 0 }) }
  })

  // Top 5 servicios más solicitados
  const topServicios = await prisma.cita.groupBy({
    by: ["servicio_id"],
    where: { estado: { notIn: ["CANCELADO"] }, fecha: { gte: inicioAnio } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  })

  const topServiciosDetalle = await Promise.all(
    topServicios.map(async (s) => {
      const servicio = await prisma.servicio.findUnique({
        where: { id: s.servicio_id },
        select: { nombre: true },
      })
      return { nombre: servicio?.nombre ?? "Desconocido", citas: s._count.id }
    })
  )

  // Top 3 empleadas por citas completadas (este año)
  const topEmpleadas = await prisma.cita.groupBy({
    by: ["empleado_id"],
    where: { estado: "COMPLETADO", fecha: { gte: inicioAnio }, empleado_id: { not: null } },
    _count: { id: true },
    _sum: { total: true },
    orderBy: { _count: { id: "desc" } },
    take: 3,
  })

  const topEmpleadasDetalle = await Promise.all(
    topEmpleadas.map(async (e) => {
      const empleada = await prisma.usuario.findUnique({
        where: { id: e.empleado_id! },
        select: { nombre: true },
      })
      return {
        nombre: empleada?.nombre ?? "Desconocida",
        citas: e._count.id,
        ingresos: Number(e._sum.total ?? 0),
      }
    })
  )

  // Resumen general
  const [totalCitasAnio, totalIngresosAnio, citasHoy, clientesTotal] = await Promise.all([
    prisma.cita.count({ where: { estado: { notIn: ["CANCELADO"] }, fecha: { gte: inicioAnio } } }),
    prisma.cita.aggregate({ where: { estado: "COMPLETADO", fecha: { gte: inicioAnio } }, _sum: { total: true } }),
    prisma.cita.count({ where: { fecha: { gte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59) }, estado: { notIn: ["CANCELADO"] } } }),
    prisma.usuario.count({ where: { rol: "CLIENTE", activo: true } }),
  ])

  return NextResponse.json({
    resumen: {
      totalCitasAnio,
      totalIngresosAnio: Number(totalIngresosAnio._sum.total ?? 0),
      citasHoy,
      clientesTotal,
    },
    ingresosPorMes,
    topServicios: topServiciosDetalle,
    topEmpleadas: topEmpleadasDetalle,
  })
}
