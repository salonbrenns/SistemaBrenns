// src/app/api/categorias-servicios/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - listar todas (útil para selects)
export async function GET() {
  try {
    const categorias = await prisma.categoriaServicio.findMany({
      where:   { activo: true },
      select:  { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(categorias)
  } catch {
    return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
  }
}

// POST - crear nueva
export async function POST(request: Request) {
  try {
    const { nombre } = await request.json()

    if (!nombre?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    // Verificar si ya existe
    const existe = await prisma.categoriaServicio.findFirst({
      where: { nombre: { equals: nombre.trim(), mode: 'insensitive' } },
    })
    if (existe) {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 })
    }

    const categoria = await prisma.categoriaServicio.create({
      data: { nombre: nombre.trim() },
    })

    return NextResponse.json(categoria, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear la categoría' }, { status: 500 })
  }
}