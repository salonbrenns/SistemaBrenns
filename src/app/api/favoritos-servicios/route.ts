// src/app/api/favoritos-servicios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from"@/lib/auth"
import { prisma } from '@/lib/prisma'

async function getUsuarioId(): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return Number(session.user.id)
}

// GET /api/favoritos-servicios — lista de favoritos del usuario
export async function GET() {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const favoritos = await prisma.favoritoServicio.findMany({
    where: { usuario_id: usuarioId },
    include: {
      servicio: {
        select: {
          id:          true,
          nombre:      true,
          imagen:      true,
          precio:      true,
          activo:      true,
          categoria:   { select: { nombre: true } },
        },
      },
    },
    orderBy: { creado_en: 'desc' },
  })

  const serialized = favoritos.map(f => ({
    id:          f.id,
    servicio_id: f.servicio_id,
    servicio: {
      id:         f.servicio.id,
      nombre:     f.servicio.nombre,
      imagen:     f.servicio.imagen,
      categoria:  f.servicio.categoria?.nombre ?? null,
      precio_min: Number(f.servicio.precio),
      disponible: f.servicio.activo,
    },
  }))

  return NextResponse.json(serialized)
}

// POST /api/favoritos-servicios — toggle: agrega si no existe, elimina si existe
// Body: { servicio_id }
export async function POST(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { servicio_id } = await req.json()
  if (!servicio_id) return NextResponse.json({ error: 'servicio_id requerido' }, { status: 400 })

  const existe = await prisma.favoritoServicio.findUnique({
    where: { usuario_id_servicio_id: { usuario_id: usuarioId, servicio_id: Number(servicio_id) } },
  })

  if (existe) {
    await prisma.favoritoServicio.delete({ where: { id: existe.id } })
    return NextResponse.json({ ok: true, accion: 'eliminado' })
  }

  await prisma.favoritoServicio.create({ data: { usuario_id: usuarioId, servicio_id: Number(servicio_id) } })
  return NextResponse.json({ ok: true, accion: 'agregado' })
}

// DELETE /api/favoritos-servicios?id=X — elimina un favorito por id
export async function DELETE(req: NextRequest) {
  const usuarioId = await getUsuarioId()
  if (!usuarioId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  await prisma.favoritoServicio.deleteMany({ where: { id: Number(id), usuario_id: usuarioId } })
  return NextResponse.json({ ok: true })
}