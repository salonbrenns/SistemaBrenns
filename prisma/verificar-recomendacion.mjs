/**
 * Diagnóstico: ¿por qué NO aparece ni la recomendación de Apriori NI el
 * respaldo de "Populares de esta categoría" para un producto?
 *
 * Revisa: categoría del producto, y cuántos OTROS productos activos con
 * stock existen en esa misma categoría (eso es lo que necesita el
 * respaldo `respaldoPopulares` de route.ts para no quedar vacío).
 *
 * Ejecutar:  node prisma/verificar-recomendacion.mjs 93
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const id = Number(process.argv[2]);
  if (!Number.isFinite(id)) {
    console.log('Uso: node prisma/verificar-recomendacion.mjs <id_producto>');
    process.exit(1);
  }

  const p = await prisma.producto.findUnique({
    where: { id },
    include: { categoria: true, variantes: true },
  });
  if (!p) {
    console.log(`Producto ${id}: NO EXISTE`);
    return;
  }

  console.log(`Producto ${id} — "${p.nombre}"`);
  console.log(`  activo: ${p.activo}`);
  console.log(`  categoria_id: ${p.categoria_id ?? '(sin categoría)'} — ${p.categoria?.nombre ?? ''}`);
  console.log(`  variantes activas con stock > 0: ${p.variantes.filter(v => v.activo && v.stock > 0).length} de ${p.variantes.length}`);

  if (p.categoria_id == null) {
    console.log('\n  Sin categoría asignada: el respaldo de populares no filtraría por categoría (buscaría en todo el catálogo).');
    return;
  }

  const companeros = await prisma.producto.findMany({
    where: {
      id: { not: id },
      activo: true,
      categoria_id: p.categoria_id,
      variantes: { some: { activo: true, stock: { gt: 0 } } },
    },
    select: { id: true, nombre: true },
  });

  console.log(`\n  Otros productos activos CON stock en la misma categoría: ${companeros.length}`);
  companeros.slice(0, 10).forEach(c => console.log(`    - ${c.id}: ${c.nombre}`));

  console.log(companeros.length > 0
    ? '\n  => El respaldo de populares SÍ debería tener productos para mostrar.'
    : '\n  => El respaldo de populares está vacío: por eso no se muestra nada (ni apriori ni populares).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
