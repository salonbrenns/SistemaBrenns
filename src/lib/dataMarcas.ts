import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function fetchMarcaById(id: string) {
  return prisma.marca.findUnique({
    where: { id: Number(id) },
  })
}


