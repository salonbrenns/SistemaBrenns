/**
 * Elimina TODOS los datos sintéticos creados por seed-ml.mjs
 * (solo lo asociado a usuarios *@seed-ml.demo; no toca nada más).
 *
 * Ejecutar:  node prisma/seed-ml-cleanup.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.usuario.findMany({
    where: { correo: { endsWith: '@seed-ml.demo' } },
    select: { id: true },
  });
  const ids = demo.map((u) => u.id);
  console.log(`Usuarios demo encontrados: ${ids.length}`);
  if (ids.length === 0) return;

  const det = await prisma.detallePedido.deleteMany({ where: { pedido: { usuario_id: { in: ids } } } });
  const ped = await prisma.pedido.deleteMany({ where: { usuario_id: { in: ids } } });
  const fav = await prisma.favorito.deleteMany({ where: { usuario_id: { in: ids } } });
  const car = await prisma.carritoItem.deleteMany({ where: { usuario_id: { in: ids } } });
  const usu = await prisma.usuario.deleteMany({ where: { id: { in: ids } } });

  console.log(`Eliminados -> detalles: ${det.count}, pedidos: ${ped.count}, favoritos: ${fav.count}, carrito: ${car.count}, usuarios: ${usu.count}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
