// Server Component — sin 'use client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DetalleProductoClient from '@/components/productos/DetalleProductoclient'
import Recomendaciones from '@/components/productos/Recomendaciones'

export const revalidate = 3600 // revalidar cada hora

export async function generateStaticParams() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { id: true },
  })
  return productos.map(p => ({ id: String(p.id) }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id), activo: true },
    select: { nombre: true, descripcion: true, imagen: true },
  })
  if (!producto) return { title: "Producto no encontrado" }

  const imagenes = Array.isArray(producto.imagen) ? producto.imagen as string[] : []
  const imagen   = imagenes[0] ?? "/logo/logo.png"

  return {
    title: producto.nombre,
    description: producto.descripcion ?? `Compra ${producto.nombre} en Brenn's Beauty`,
    openGraph: {
      title: producto.nombre,
      description: producto.descripcion ?? `Compra ${producto.nombre} en Brenn's Beauty`,
      images: [{ url: imagen }],
    },
    twitter: {
      card: "summary_large_image",
      title: producto.nombre,
      images: [imagen],
    },
  }
}

export default async function DetalleProductoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const productoId = Number(id)

  // Promoción activa asignada específicamente a este producto
  const hoy = new Date()
  const promoProducto = await prisma.promocionProducto.findFirst({
    where: {
      producto_id: productoId,
      promocion: {
        activo: true,
        fecha_inicio: { lte: hoy },
        fecha_fin:    { gte: hoy },
      },
    },
    include: { promocion: { select: { descuento: true } } },
    orderBy: { promocion: { descuento: 'desc' } },
  })
  const descuentoProducto = promoProducto ? Number(promoProducto.promocion.descuento) : 0

  const raw = await prisma.producto.findUnique({
    where: { id: productoId, activo: true },
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

  const imagenesPadre: string[] = Array.isArray(raw.imagen)
    ? (raw.imagen as string[]).filter((u): u is string => typeof u === 'string')
    : []

  const producto = {
    id:           raw.id,
    nombre:       raw.nombre,
    descripcion:  raw.descripcion ?? null,
    marca:        raw.marca       ?? null,
    categoria:    raw.categoria   ?? null,
    imagenesPadre,
    variantes: raw.variantes.map(v => ({
      id:           v.id,
      tono:         v.tono         ?? null,
      presentacion: v.presentacion ?? null,
      precio_venta: Number(v.precio_venta),
      stock:        v.stock,
      imagenes: Array.isArray(v.imagen)
        ? (v.imagen as string[]).filter((u): u is string => typeof u === 'string')
        : [],
    })),
  }

  return (
    <>
      <DetalleProductoClient producto={producto} descuentoProducto={descuentoProducto} />
      <Recomendaciones productoId={productoId} />
    </>
  )
}