/**
 * seed-citas-cleanup.mjs — Revierte TODAS las citas de prueba (tanto las de
 * prisma/seed-citas.mjs como el lote previo generado por otro script),
 * conservando únicamente las citas reales.
 *
 * Regla de "real" confirmada con el equipo: una cita es real solo si su
 * cliente tiene correo @uthh.edu.mx. Todo lo demás (incluyendo citas de
 * invitados sin cuenta, que nunca deberían ser reales en este proyecto) se
 * considera dato de prueba y se borra.
 *
 * Ejecutar:  node prisma/seed-citas-cleanup.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const [{ count: totalAntes }] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as count FROM agenda.tblcitas`
  );
  const [{ count: reales }] = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*)::int as count FROM agenda.tblcitas c
    JOIN seguridad.tblusuarios u ON u.id = c.usuario_id
    WHERE u.correo LIKE '%@uthh.edu.mx'
  `);
  console.log(`Citas totales antes: ${totalAntes} (de las cuales reales @uthh.edu.mx: ${reales})`);

  // Primero se eliminan los avisos ligados a las citas de prueba (tblavisos_admin
  // referencia tblcitas y bloquearía el DELETE por llave foránea).
  const avisos = await prisma.$executeRawUnsafe(`
    DELETE FROM sistema.tblavisos_admin
    WHERE cita_id IN (
      SELECT id FROM agenda.tblcitas
      WHERE usuario_id IS NULL
         OR usuario_id NOT IN (SELECT id FROM seguridad.tblusuarios WHERE correo LIKE '%@uthh.edu.mx')
    )
  `);
  console.log(`Avisos ligados a citas de prueba eliminados: ${avisos}`);

  const eliminadas = await prisma.$executeRawUnsafe(`
    DELETE FROM agenda.tblcitas
    WHERE usuario_id IS NULL
       OR usuario_id NOT IN (SELECT id FROM seguridad.tblusuarios WHERE correo LIKE '%@uthh.edu.mx')
  `);
  console.log(`Citas de prueba eliminadas: ${eliminadas}`);

  const [{ count: totalDespues }] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as count FROM agenda.tblcitas`
  );
  console.log(`Citas restantes (deberían ser solo las reales): ${totalDespues}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
