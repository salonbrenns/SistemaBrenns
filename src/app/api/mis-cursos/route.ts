import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const usuarioId = Number(session.user.id)

  try {
    // 1. Obtener inscripciones del usuario
    const inscripciones = await prisma.inscripcion.findMany({
      where: { usuario_id: usuarioId },
      orderBy: { fecha_inscripcion: "desc" },
    })

    if (inscripciones.length === 0) {
      return NextResponse.json({ cursos: [] })
    }

    // 2. Obtener datos de los cursos
    const cursoIds = inscripciones.map((i) => i.curso_id)
    const cursos = await prisma.curso.findMany({
      where: { id: { in: cursoIds } },
    })

    // 3. Obtener pagos y asistencias de cada inscripción
    const inscripcionIds = inscripciones.map((i) => i.id)
    const [pagos, asistencias] = await Promise.all([
      prisma.pagoCurso.findMany({ where: { inscripcion_id: { in: inscripcionIds } } }),
      prisma.asistencia.findMany({
        where:   { inscripcion_id: { in: inscripcionIds }, presente: true },
        select:  { inscripcion_id: true, fecha: true },
        orderBy: { fecha: 'asc' },
      }),
    ])

    // 4. Combinar datos
    const resultado = inscripciones.map((insc) => {
      const curso        = cursos.find((c) => c.id === insc.curso_id)
      const pagosCurso   = pagos.filter((p) => p.inscripcion_id === insc.id)
      const totalPagado  = pagosCurso.reduce((sum, p) => sum + Number(p.monto), 0)
      const misAsistencias = asistencias
        .filter(a => a.inscripcion_id === insc.id)
        .map(a => new Date(a.fecha).toISOString().slice(0, 10))

      return {
        inscripcionId:     insc.id,
        estado:            insc.estado,
        fecha_inscripcion: insc.fecha_inscripcion,
        diasAsistidos:     misAsistencias.length,
        asistencias:       misAsistencias,
        curso: curso
          ? {
              id:            curso.id,
              titulo:        curso.titulo,
              nivel:         curso.nivel,
              duracion_horas: curso.duracion_horas,
              fecha_inicio:  curso.fecha_inicio,
              fecha_fin:     curso.fecha_fin,
              precio_total:  Number(curso.precio_total),
              imagenes:      curso.imagenes ?? [],
            }
          : null,
        pagos:       pagosCurso.map((p) => ({
          id:          p.id,
          numero_pago: p.numero_pago,
          monto:       Number(p.monto),
          metodo_pago: p.metodo_pago,
          estado:      p.estado,
          fecha_pago:  p.fecha_pago,
        })),
        totalPagado,
      }
    })

    return NextResponse.json({ cursos: resultado })
  } catch (error) {
    console.error("[mis-cursos]", error)
    return NextResponse.json({ error: "Error al obtener cursos" }, { status: 500 })
  }
}
