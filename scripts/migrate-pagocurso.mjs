/**
 * Migración manual: agrega comprobante_url a tblpagos_curso
 * y cambia el default de estado a PENDIENTE.
 *
 * Correr UNA sola vez:  node scripts/migrate-pagocurso.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Aplicando migración en cursos.tblpagos_curso …")

  // 1. Agregar columna comprobante_url (IF NOT EXISTS = seguro si se corre 2 veces)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE cursos.tblpagos_curso
    ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(500)
  `)
  console.log("✅  Columna comprobante_url agregada")

  // 2. Cambiar default de estado a PENDIENTE
  await prisma.$executeRawUnsafe(`
    ALTER TABLE cursos.tblpagos_curso
    ALTER COLUMN estado SET DEFAULT 'PENDIENTE'
  `)
  console.log("✅  Default de estado cambiado a PENDIENTE")

  console.log("\n✅  Migración completada. Ahora corre: npx prisma generate")
}

main()
  .catch(e => { console.error("❌ Error:", e); process.exit(1) })
  .finally(() => prisma.$disconnect())
