import { prisma } from '@/lib/prisma'

export async function fetchMarcaById(id: string) {
  return prisma.marca.findUnique({
    where: { id: Number(id) },
  })
}
