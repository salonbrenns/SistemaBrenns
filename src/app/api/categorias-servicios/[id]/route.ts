// src/app/api/categorias-servicios/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === 'ADMIN'
}

// PUT - actualizar nombre (solo ADMIN)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id } = await params
    const { nombre } = await request.json()

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar duplicado (excluyendo el actual)
    const existe = await prisma.categoriaServicio.findFirst({
      where: {
        nombre: { equals: nombre.trim(), mode: 'insensitive' },
        NOT:    { id: Number(id) },
      },
    })
    if (existe) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 })
    }

    const categoria = await prisma.categoriaServicio.update({
      where: { id: Number(id) },
      data:  { nombre: nombre.trim() },
    })

    return NextResponse.json(categoria)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar la categoría' }, { status: 500 })
  }
}

// PATCH - toggle activo (solo ADMIN)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const { id } = await params
    const { activo } = await request.json()

    const categoria = await prisma.categoriaServicio.update({
      where: { id: Number(id) },
      data:  { activo },
    })

    return NextResponse.json(categoria)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar el estado' }, { status: 500 })
  }
}