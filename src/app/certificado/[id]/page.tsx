import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import CertificadoClient from "./CertificadoClient"

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Demo para admin (solo accesible para ADMIN)
  if (id === "demo") {
    const sessionDemo = await auth()
    if (!sessionDemo?.user || sessionDemo.user.role !== "ADMIN") notFound()
    const plantillaRow = await prisma.configSitio.findUnique({
      where: { clave: "certificado_plantilla" },
    })
    return (
      <CertificadoClient
        alumno={{ nombre: "María Ejemplo López", foto: null }}
        curso={{ titulo: "Curso de Manicura Profesional", nivel: "Básico", fecha_inicio: "2025-01-10", fecha_fin: "2025-03-15" }}
        plantilla={plantillaRow?.valor ?? null}
        fecha={new Date().toISOString()}
        demo
      />
    )
  }

  const inscripcionId = Number(id)
  if (isNaN(inscripcionId)) notFound()

  const session = await auth()
  if (!session?.user) notFound()

  const isAdmin = session.user.role === "ADMIN"
  const usuarioId = Number(session.user.id)

  // Cargar inscripción
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
  })

  if (!inscripcion) notFound()

  // Solo el propio alumno o un admin pueden ver el certificado
  if (!isAdmin && inscripcion.usuario_id !== usuarioId) notFound()

  // Solo se puede ver si está COMPLETADO
  if (!isAdmin && inscripcion.estado !== "COMPLETADO") notFound()

  const [usuario, curso, plantillaRow] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: inscripcion.usuario_id } }),
    prisma.curso.findUnique({ where: { id: inscripcion.curso_id } }),
    prisma.configSitio.findUnique({ where: { clave: "certificado_plantilla" } }),
  ])

  if (!usuario || !curso) notFound()

  const nombreCompleto = [usuario.nombre, usuario.appaterno, usuario.apmaterno]
    .filter(Boolean)
    .join(" ")

  return (
    <CertificadoClient
      alumno={{ nombre: nombreCompleto, foto: usuario.image ?? null }}
      curso={{
        titulo:       curso.titulo,
        nivel:        curso.nivel ?? null,
        fecha_inicio: curso.fecha_inicio?.toISOString() ?? null,
        fecha_fin:    curso.fecha_fin?.toISOString()    ?? null,
      }}
      plantilla={plantillaRow?.valor ?? null}
      fecha={inscripcion.fecha_inscripcion?.toISOString() ?? new Date().toISOString()}
    />
  )
}
