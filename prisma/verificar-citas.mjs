/**
 * Verificación de la señal en los datos sintéticos de citas: revisa que la
 * tasa de cancelación sí varíe por segmento (si no varía, el modelo no
 * tendría nada que aprender). Solo mira citas PASADAS (con resultado
 * decidido), igual que hará la libreta.
 *
 * Ejecutar:  node prisma/verificar-citas.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

function pct(cancel, total) {
  return total > 0 ? `${(100 * cancel / total).toFixed(1)}% (${cancel}/${total})` : 'n/a';
}

async function main() {
  const filas = await prisma.$queryRawUnsafe(`
    SELECT
      c.estado,
      c.metodo_pago,
      c.usuario_id,
      EXTRACT(DOW FROM c.fecha)::int AS dia_semana,
      (c.fecha::date - c."createdAt"::date) AS anticipacion
    FROM agenda.tblcitas c
    WHERE c.fecha < NOW()
      AND c.usuario_id IN (SELECT id FROM seguridad.tblusuarios WHERE correo LIKE '%@seed-ml.demo')
  `);

  const total = filas.length;
  const canceladas = filas.filter(f => f.estado === 'CANCELADA').length;
  console.log(`=== Balance de clases (citas pasadas, sintéticas) ===`);
  console.log(`Total: ${total} · Canceladas: ${pct(canceladas, total)}`);

  console.log(`\n=== Por método de pago ===`);
  for (const m of ['TARJETA', 'TRANSFERENCIA', 'EFECTIVO']) {
    const sub = filas.filter(f => f.metodo_pago === m);
    console.log(`  ${m}: ${pct(sub.filter(f => f.estado === 'CANCELADA').length, sub.length)}`);
  }

  console.log(`\n=== Por anticipación ===`);
  const buckets = [['corta (<=1 día)', f => f.anticipacion <= 1], ['media (2-19 días)', f => f.anticipacion > 1 && f.anticipacion < 20], ['larga (>=20 días)', f => f.anticipacion >= 20]];
  for (const [nombre, filtro] of buckets) {
    const sub = filas.filter(filtro);
    console.log(`  ${nombre}: ${pct(sub.filter(f => f.estado === 'CANCELADA').length, sub.length)}`);
  }

  console.log(`\n=== Por día de la semana ===`);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  for (let d = 1; d <= 6; d++) {
    const sub = filas.filter(f => f.dia_semana === d);
    if (sub.length === 0) continue;
    console.log(`  ${dias[d]}: ${pct(sub.filter(f => f.estado === 'CANCELADA').length, sub.length)}`);
  }

  console.log(`\n=== Invitados vs registrados ===`);
  const invitados = await prisma.$queryRawUnsafe(`
    SELECT estado FROM agenda.tblcitas WHERE fecha < NOW() AND usuario_id IS NULL
  `);
  console.log(`  Invitados: ${pct(invitados.filter(f => f.estado === 'CANCELADA').length, invitados.length)}`);
  console.log(`  Registrados: ${pct(canceladas, total)}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
