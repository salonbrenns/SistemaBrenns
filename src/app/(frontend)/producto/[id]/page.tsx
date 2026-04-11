// Server Component — sin 'use client'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DetalleProductoClient from '@/components/productos/DetalleProductoclient'

export default async function DetalleProductoPage({
  params,
}: {
  readonly params: Promise<{ id: string }>
}) {
  const { id } = await params

  const raw = await prisma.producto.findUnique({
    where: { id: Number(id), activo: true },
    include: {
      marca:     { select: { nombre: true } },
      categoria: { select: { nombre: true } },
      variantes: {
        where:   { activo: true },
        orderBy: { id: 'asc' },
      },
    },
  })

  if (!raw) return notFound()

  // Normalizar imágenes del producto padre (JsonValue → string[])
  const imagenesPadre: string[] = Array.isArray(raw.imagen)
    ? (raw.imagen as string[]).filter((u): u is string => typeof u === 'string')
    : []

 
  const producto = {
    id:          raw.id,
    nombre:      raw.nombre,
    descripcion: raw.descripcion ?? null,
    marca:       raw.marca   ?? null,
    categoria:   raw.categoria ?? null,
    imagenesPadre,
    variantes: raw.variantes.map(v => ({
      id:           v.id,
      tono:         v.tono         ?? null,
      presentacion: v.presentacion ?? null,
      precio_venta: Number(v.precio_venta),
      stock:        v.stock,
      // Imágenes propias de la variante (si tiene), si no se usan las del padre
      imagenes: Array.isArray(v.imagen)
        ? (v.imagen as string[]).filter((u): u is string => typeof u === 'string')
        : [],
    })),
  }

  return <DetalleProductoClient producto={producto} />
}