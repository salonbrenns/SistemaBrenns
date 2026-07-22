import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// En desarrollo, reutilizar el singleton entre hot-reloads para no crear
// nuevas conexiones con cada recarga del módulo.
if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma