import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function fetchCategoriaById(id: string) {
  return prisma.categoria.findUnique({
    where: { id: Number(id) },
  })
}


