import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
const cols = await prisma.$queryRawUnsafe(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'sistema' AND table_name = 'auditoria'
  ORDER BY ordinal_position
`)
console.log(JSON.stringify(cols, null, 2))
await prisma.$disconnect()
