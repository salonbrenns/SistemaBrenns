import { prisma } from '@/lib/prisma'

export async function fetchCategoriaById(id: string) {
  return prisma.categoria.findUnique({
    where: { id: Number(id) },
  })
}
