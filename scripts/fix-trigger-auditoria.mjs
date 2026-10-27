/**
 * Busca y elimina el trigger de auditoría en cursos.tblcursos
 * que rompe los updates de Prisma.
 *
 * Correr: node scripts/fix-trigger-auditoria.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 1. Ver todos los triggers en las tablas del schema cursos
  const triggers = await prisma.$queryRawUnsafe(`
    SELECT trigger_schema, trigger_name, event_object_table, action_statement
    FROM information_schema.triggers
    WHERE trigger_schema IN ('cursos', 'sistema', 'agenda', 'catalogos', 'ventas', 'seguridad')
    ORDER BY trigger_schema, event_object_table
  `)
  console.log("\n🔍 Triggers encontrados:")
  console.log(JSON.stringify(triggers, null, 2))

  // 2. Ver dónde está la tabla auditoria
  const audTables = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_name ILIKE 'auditoria%'
  `)
  console.log("\n📋 Tablas auditoria:")
  console.log(JSON.stringify(audTables, null, 2))

  // 3. Eliminar triggers que referencian auditoria en tblcursos
  const triggersCursos = await prisma.$queryRawUnsafe(`
    SELECT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'cursos'
      AND event_object_table = 'tblcursos'
  `)

  console.log("\n⚙️  Triggers en cursos.tblcursos:")
  console.log(JSON.stringify(triggersCursos, null, 2))

  if (Array.isArray(triggersCursos) && triggersCursos.length > 0) {
    for (const t of triggersCursos) {
      console.log(`\n🗑️  Eliminando trigger: ${t.trigger_name} ...`)
      await prisma.$executeRawUnsafe(
        `DROP TRIGGER IF EXISTS ${t.trigger_name} ON cursos.tblcursos CASCADE`
      )
      console.log(`✅  Trigger ${t.trigger_name} eliminado`)
    }
  } else {
    console.log("ℹ️  No se encontraron triggers en cursos.tblcursos")
    console.log("El trigger puede estar en otra tabla. Revisa la salida arriba.")
  }
}

main()
  .catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
