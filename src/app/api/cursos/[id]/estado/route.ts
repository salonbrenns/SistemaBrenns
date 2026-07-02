import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ inscrito: false })
  }

  const { id } = await params
  const cursoId   = Number(id)
  const usuarioId = Number(session.user.id)

  const inscripcion = await prisma.inscripcion.findFirst({
    where: { usuario_id: usuarioId, curso_id: cursoId, estado: "ACTIVO" },
  })

  return NextResponse.json({ inscrito: !!inscripcion, inscripcionId: inscripcion?.id ?? null })
}
