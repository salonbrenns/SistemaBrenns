/**
 * Verificación del volumen de datos para la Solución 1 (recomendador de
 * productos): cuenta registros reales vs sintéticos (seed) SOLO en las
 * tablas que alimentan este modelo. No toca ni cuenta nada de citas.
 *
 * Ejecutar:  node prisma/verificar-volumen.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('=== Totales actuales por tabla (recomendador de productos) ===');
  const pedidos = await prisma.pedido.count();
  const detalles = await prisma.detallePedido.count();
  const favoritos = await prisma.favorito.count();
  const carrito = await prisma.carritoItem.count();
  const productos = await prisma.producto.count({ where: { activo: true } });
  const usuarios = await prisma.usuario.count();

  console.log('pedidos:', pedidos);
  console.log('detalle_pedidos:', detalles);
  console.log('favoritos:', favoritos);
  console.log('carrito:', carrito);
  console.log('productos activos (catálogo):', productos);
  console.log('usuarios:', usuarios);

  // Solo cuentan detalle_pedidos + favoritos: pedidos es el mismo evento que
  // detalle_pedidos visto a nivel encabezado, y carrito no se usa en el dataset.
  const totalOperativo = detalles + favoritos;
  console.log(`\nTotal registros de interaccion (detalle_pedidos + favoritos): ${totalOperativo}`);
  console.log(totalOperativo >= 2000
    ? '>> CUMPLE el minimo de 2000 registros'
    : `>> NO alcanza 2000 todavia (faltan ${2000 - totalOperativo})`);

  console.log('\n=== Desglose real vs sintético (usuarios del seed) ===');
  const demo = await prisma.usuario.findMany({
    where: { correo: { endsWith: '@seed-ml.demo' } },
    select: { id: true },
  });
  const demoIds = demo.map(u => u.id);
  console.log('Usuarios sintéticos (seed):', demoIds.length);

  if (demoIds.length > 0) {
    const detDemo = await prisma.detallePedido.count({ where: { pedido: { usuario_id: { in: demoIds } } } });
    const favDemo = await prisma.favorito.count({ where: { usuario_id: { in: demoIds } } });

    console.log('Detalle sintéticos:', detDemo, ' | reales:', detalles - detDemo, 'de', detalles);
    console.log('Favoritos sintéticos:', favDemo, ' | reales:', favoritos - favDemo, 'de', favoritos);

    const totalSintetico = detDemo + favDemo;
    const totalReal = totalOperativo - totalSintetico;
    console.log(`\nProporción: ${totalReal} reales (${(100 * totalReal / totalOperativo).toFixed(1)}%) / ${totalSintetico} sintéticos (${(100 * totalSintetico / totalOperativo).toFixed(1)}%)`);
  }

  console.log('\n=== Pedidos por estado ===');
  const porEstado = await prisma.pedido.groupBy({ by: ['estado'], _count: true });
  porEstado.forEach(r => console.log(r.estado, r._count));
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());