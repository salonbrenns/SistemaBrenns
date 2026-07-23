import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

// GET ?curso_id=X&fecha=YYYY-MM-DD
export async function GET(req: Request) {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user || (role !== "ADMIN" && role !== "EMPLEADO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const cursoId = Number(searchParams.get("curso_id"))
  const fecha   = searchParams.get("fecha") // YYYY-MM-DD

  if (!cursoId) {
    return NextResponse.json({ error: "Falta curso_id" }, { status: 400 })
  }

  // Sin fecha → devolver historial completo del curso
  if (!fecha) {
    try {
      const historial = await prisma.$queryRawUnsafe<{
        nombre: string
        fecha: string
        presente: boolean
      }[]>(`
        SELECT u.nombre, a.fecha::text, a.presente
        FROM cursos.tblasistencias a
        JOIN cursos.tblinscripciones i ON i.id = a.inscripcion_id
        JOIN seguridad.tblusuarios u ON u.id = i.usuario_id
        WHERE i.curso_id = $1
        ORDER BY a.fecha DESC, u.nombre
      `, cursoId)

      // Agrupar por alumna
      const porAlumna = new Map<string, { fecha: string; presente: boolean }[]>()
      for (const r of historial) {
        if (!porAlumna.has(r.nombre)) porAlumna.set(r.nombre, [])
        porAlumna.get(r.nombre)!.push({ fecha: r.fecha, presente: r.presente })
      }

      const resumen = Array.from(porAlumna.entries()).map(([nombre, registros]) => ({
        nombre,
        total:     registros.length,
        presentes: registros.filter(r => r.presente).length,
        fechas:    registros,
      }))

      return NextResponse.json({ historial: resumen })
    } catch {
      return NextResponse.json({ historial: [] }) // tabla no existe aún
    }
  }

  try {
    // 1. Alumnos activos del curso
    const alumnos = await prisma.$queryRawUnsafe<{
      inscripcion_id: number
      usuario_id: number
      nombre: string
    }[]>(`
      SELECT i.id AS inscripcion_id, i.usuario_id, u.nombre
      FROM cursos.tblinscripciones i
      JOIN seguridad.tblusuarios u ON u.id = i.usuario_id
      WHERE i.curso_id = $1 AND i.estado = 'ACTIVO'
      ORDER BY u.nombre
    `, cursoId)

    // 2. Asistencias para esa fecha (puede fallar si la tabla no existe aún)
    let asistenciaMap = new Map<number, boolean>()
    try {
      const asistencias = await prisma.$queryRawUnsafe<{
        inscripcion_id: number; presente: boolean
      }[]>(`
        SELECT inscripcion_id, presente
        FROM cursos.tblasistencias
        WHERE inscripcion_id = ANY($1::int[]) AND fecha = $2::date
      `, alumnos.map(a => a.inscripcion_id), fecha)

      asistenciaMap = new Map(asistencias.map(a => [Number(a.inscripcion_id), a.presente]))
    } catch {
      // La tabla aún no existe — se devuelven todos sin marcar
    }

    const resultado = alumnos.map(a => ({
      inscripcion_id: Number(a.inscripcion_id),
      usuario_id:     Number(a.usuario_id),
      nombre:         a.nombre,
      presente:       asistenciaMap.has(Number(a.inscripcion_id))
                        ? asistenciaMap.get(Number(a.inscripcion_id))
                        : null,
    }))

    return NextResponse.json({ alumnos: resultado })
  } catch (error) {
    console.error("[asistencia GET]", error)
    return NextResponse.json({ error: "Error al obtener alumnos" }, { status: 500 })
  }
}

// POST { curso_id, fecha, asistencias: [{inscripcion_id, presente}] }
export async function POST(req: Request) {
  const session = await auth()
  const role = session?.user?.role
  if (!session?.user || (role !== "ADMIN" && role !== "EMPLEADO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { fecha, asistencias } = await req.json() as {
      fecha: string
      asistencias: { inscripcion_id: number; presente: boolean }[]
    }

    if (!fecha || !Array.isArray(asistencias) || asistencias.length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    for (const a of asistencias) {
      await prisma.$queryRawUnsafe(`
        INSERT INTO cursos.tblasistencias (inscripcion_id, fecha, presente)
        VALUES ($1, $2::date, $3)
        ON CONFLICT (inscripcion_id, fecha)
        DO UPDATE SET presente = EXCLUDED.presente
      `, a.inscripcion_id, fecha, a.presente)
    }

    return NextResponse.json({ ok: true, guardadas: asistencias.length })
  } catch (error) {
    console.error("[asistencia POST]", error)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
