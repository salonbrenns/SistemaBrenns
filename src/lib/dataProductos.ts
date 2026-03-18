import { PrismaClient } from '@prisma/client'
import { serializeProducto } from './serializers'
const prisma = new PrismaClient()

export async function fetchProductoById(id: string) {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { marca: true, categoria: true },
  })

  if (!producto) return null

  return serializeProducto(producto)
}