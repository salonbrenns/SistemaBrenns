/**
 * Diagnóstico rápido: ¿a qué base de datos estamos conectados y qué esquema tiene?
 * Ejecutar:  node prisma/diagnostico-bd.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const [info] = await prisma.$queryRawUnsafe(`
    SELECT current_database() AS base, current_user AS usuario, version() AS version
  `);
  console.log('Base:', info.base, '| Usuario:', info.usuario);

  const [tablas] = await prisma.$queryRawUnsafe(`
    SELECT
      to_regclass('sistema.tblavisos_admin')::text         AS avisos_admin,
      to_regclass('sistema.tblconfig_sitio')::text         AS config_sitio,
      to_regclass('agenda.tbldias_bloqueados')::text       AS dias_bloqueados,
      to_regclass('catalogos.tblproductos')::text          AS productos,
      to_regclass('ventas.tblfavoritos_productos')::text   AS favoritos_productos
  `);
  console.log('Tablas del esquema NUEVO (null = no existe aquí):', tablas);

  const columnas = await prisma.$queryRawUnsafe(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'agenda' AND table_name = 'tblcitas'
    ORDER BY ordinal_position
  `);
  console.log('Columnas de tblcitas:', columnas.map((c) => c.column_name).join(', '));

  try {
    const [conteos] = await prisma.$queryRawUnsafe(`
      SELECT (SELECT COUNT(*)::int FROM agenda.tblcitas) AS citas,
             (SELECT COUNT(*)::int FROM ventas.tblpedidos) AS pedidos
    `);
    console.log('Conteos:', conteos);
  } catch (e) {
    console.log('No se pudieron contar citas/pedidos:', e.message?.split('\n')[0]);
  }

  console.log('\nHost del DATABASE_URL en uso:');
  const url = process.env.DATABASE_URL ?? '(no definido en el entorno)';
  console.log(' ', url.replace(/\/\/[^@]+@/, '//<credenciales>@'));
}

main()
  .catch((e) => console.error('ERROR:', e))
  .finally(() => prisma.$disconnect());
