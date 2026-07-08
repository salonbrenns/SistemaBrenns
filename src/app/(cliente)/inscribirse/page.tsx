import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import InscribirseClient from "./InscribirseClient"

export default async function InscribirsePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login?next=/inscribirse")
  }

  const params    = await searchParams
  const cursoId   = Number(params.id)
  const usuarioId = Number(session.user.id)

  if (isNaN(cursoId) || cursoId <= 0) {
    notFound()
  }

  // Cargar datos en paralelo
  const [rawCurso, rawUsuario, yaInscrito] = await Promise.all([
    prisma.curso.findUnique({ where: { id: cursoId, activo: true } }),
    prisma.usuario.findUnique({ where: { id: usuarioId } }),
    prisma.inscripcion.findFirst({
      where: { usuario_id: usuarioId, curso_id: cursoId, estado: "ACTIVO" },
    }),
  ])

  if (!rawCurso || !rawUsuario) notFound()

  // Si ya está inscrito, redirigir a mis-cursos
  if (yaInscrito) {
    redirect("/mis-cursos")
  }

  const curso = {
    id:            rawCurso.id,
    titulo:        rawCurso.titulo,
    nivel:         rawCurso.nivel ?? null,
    duracion_horas: rawCurso.duracion_horas ?? null,
    precio_total:  Number(rawCurso.precio_total),
    cupo_maximo:   rawCurso.cupo_maximo,
    inscritos:     rawCurso.inscritos,
    fecha_inicio:  rawCurso.fecha_inicio?.toISOString() ?? null,
    fecha_fin:     rawCurso.fecha_fin?.toISOString() ?? null,
    imagenes:      Array.isArray(rawCurso.imagenes) ? (rawCurso.imagenes as string[]) : [],
  }

  const usuario = {
    id:        rawUsuario.id,
    nombre:    rawUsuario.nombre,
    appaterno: rawUsuario.appaterno ?? null,
    apmaterno: rawUsuario.apmaterno ?? null,
    correo:    rawUsuario.correo,
    telefono:  rawUsuario.telefono ?? null,
  }

  return <InscribirseClient curso={curso} usuario={usuario} />
}
