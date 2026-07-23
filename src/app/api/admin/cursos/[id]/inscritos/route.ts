import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EMPLEADO")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const cursoId = Number(id)

  try {
    const curso = await prisma.curso.findUnique({ where: { id: cursoId } })
    if (!curso) return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 })

    const inscripciones = await prisma.inscripcion.findMany({
      where:   { curso_id: cursoId },
      orderBy: { fecha_inscripcion: "desc" },
    })

    if (inscripciones.length === 0) {
      return NextResponse.json({
        curso: { id: curso.id, titulo: curso.titulo, cupo_maximo: curso.cupo_maximo, inscritos: curso.inscritos },
        inscritos: [],
      })
    }

    const usuarioIds = inscripciones.map((i) => i.usuario_id)
    const inscripcionIds = inscripciones.map((i) => i.id)

    const [usuarios, pagos] = await Promise.all([
      prisma.usuario.findMany({
        where:  { id: { in: usuarioIds } },
        select: { id: true, nombre: true, appaterno: true, apmaterno: true, correo: true, telefono: true },
      }),
      prisma.pagoCurso.findMany({ where: { inscripcion_id: { in: inscripcionIds } } }),
    ])

    const inscritos = inscripciones.map((insc) => {
      const usuario = usuarios.find((u) => u.id === insc.usuario_id)
      const pagosCurso = pagos.filter((p) => p.inscripcion_id === insc.id)
      const totalPagado = pagosCurso.reduce((sum, p) => sum + Number(p.monto), 0)

      return {
        inscripcionId:     insc.id,
        estado:            insc.estado,
        fecha_inscripcion: insc.fecha_inscripcion,
        totalPagado,
        pagos: pagosCurso.map((p) => ({
          monto:       Number(p.monto),
          metodo_pago: p.metodo_pago,
          estado:      p.estado,
        })),
        usuario: usuario
          ? {
              id:        usuario.id,
              nombre:    usuario.nombre,
              appaterno: usuario.appaterno,
              apmaterno: usuario.apmaterno,
              correo:    usuario.correo,
              telefono:  usuario.telefono,
            }
          : null,
      }
    })

    return NextResponse.json({
      curso: {
        id:         curso.id,
        titulo:     curso.titulo,
        cupo_maximo: curso.cupo_maximo,
        inscritos:  curso.inscritos,
        precio_total: Number(curso.precio_total),
      },
      inscritos,
    })
  } catch (error) {
    console.error("[admin/cursos/inscritos]", error)
    return NextResponse.json({ error: "Error al obtener inscritos" }, { status: 500 })
  }
}
