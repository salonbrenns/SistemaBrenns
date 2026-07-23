/**
 * Diagnóstico rápido: ¿por qué un producto recomendado por el modelo no
 * aparece en la página web? Imprime si el producto está activo y si tiene
 * al menos una variante activa con stock > 0 (el filtro que usa la ruta
 * /api/recomendaciones antes de mostrar una recomendación).
 *
 * Ejecutar:  node prisma/verificar-producto.mjs 228 460
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const ids = process.argv.slice(2).map(Number).filter(Number.isFinite);
  if (ids.length === 0) {
    console.log('Uso: node prisma/verificar-producto.mjs <id1> <id2> ...');
    process.exit(1);
  }

  for (const id of ids) {
    const p = await prisma.producto.findUnique({
      where: { id },
      include: { variantes: true },
    });
    if (!p) {
      console.log(`Producto ${id}: NO EXISTE`);
      continue;
    }
    const variantesActivasConStock = p.variantes.filter(v => v.activo && v.stock > 0);
    console.log(`Producto ${id} — "${p.nombre}"`);
    console.log(`  activo: ${p.activo}`);
    console.log(`  variantes totales: ${p.variantes.length}`);
    console.log(`  variantes activas con stock > 0: ${variantesActivasConStock.length}`);
    console.log(`  ${p.activo && variantesActivasConStock.length > 0 ? '=> SÍ calificaría como recomendación' : '=> NO calificaría (por eso cae al respaldo de populares)'}`);
    console.log('');
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
