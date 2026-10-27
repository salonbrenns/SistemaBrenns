/**
 * Restaura los triggers de auditoría en cursos.tblcursos
 * y verifica/corrige fn_auditoria() para que use sistema.auditoria
 *
 * Correr: node scripts/restore-triggers.mjs
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // 1. Ver la definición actual de fn_auditoria()
  const fnDef = await prisma.$queryRawUnsafe(`
    SELECT routine_schema, routine_name, routine_definition
    FROM information_schema.routines
    WHERE routine_name = 'fn_auditoria'
  `)
  console.log("\n📋 Definición actual de fn_auditoria():")
  console.log(JSON.stringify(fnDef, null, 2))

  // 2. Reemplazar fn_auditoria para que use sistema.auditoria con schema explícito
  console.log("\n🔧 Recreando fn_auditoria() con schema correcto...")
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION fn_auditoria()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'INSERT' THEN
        INSERT INTO sistema.auditoria (tabla, accion, datos_nuevos, fecha)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW)::jsonb, NOW());
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO sistema.auditoria (tabla, accion, datos_anteriores, datos_nuevos, fecha)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, NOW());
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO sistema.auditoria (tabla, accion, datos_anteriores, fecha)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD)::jsonb, NOW());
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = sistema, cursos, catalogos, public;
  `)
  console.log("✅ fn_auditoria() recreada")

  // 3. Recrear trigger auditoria_clientes en cursos.tblcursos
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER auditoria_clientes
    AFTER INSERT OR UPDATE OR DELETE ON cursos.tblcursos
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria()
  `)
  console.log("✅ Trigger auditoria_clientes recreado en cursos.tblcursos")

  // 4. Verificar que quedó bien
  const check = await prisma.$queryRawUnsafe(`
    SELECT trigger_name, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'cursos' AND event_object_table = 'tblcursos'
  `)
  console.log("\n✅ Triggers actuales en cursos.tblcursos:")
  console.log(JSON.stringify(check, null, 2))
}

main()
  .catch(e => { console.error("❌ Error:", e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
