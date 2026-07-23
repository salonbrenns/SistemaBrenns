/**
 * Seed de datos sintéticos para el modelo de minería de datos (recomendador).
 *
 * - SOLO INSERTA datos nuevos: no modifica ni borra nada existente.
 * - Los usuarios demo se identifican por correo *@seed-ml.demo
 * - Para revertir todo: node prisma/seed-ml-cleanup.mjs
 *
 * Ejecutar:  node prisma/seed-ml.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient, Prisma } = pkg;

const prisma = new PrismaClient();

// ---------- RNG determinista (reproducible) ----------
let _seed = 20260715;
function rand() {
  _seed = (_seed * 1103515245 + 12345) % 2147483648;
  return _seed / 2147483648;
}
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const NUM_USUARIOS = 320; // duplicado (antes 160) para dar más profundidad a las canastas
const DOMINIO = 'seed-ml.demo';
// Hash bcrypt de una cadena aleatoria larga: nadie puede iniciar sesión con estas cuentas
const PASSWORD_HASH = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

const NOMBRES = ['María','José','Ana','Luis','Carmen','Juan','Laura','Carlos','Sofía','Miguel','Lucía','Pedro','Elena','Jorge','Rosa','Diego','Paola','Andrés','Valeria','Raúl'];
const APELLIDOS = ['Hernández','García','Martínez','López','González','Pérez','Sánchez','Ramírez','Cruz','Flores','Gómez','Torres','Vázquez','Reyes','Morales'];

async function main() {
  console.log('== Seed ML: recomendador de productos ==');

  // 1) Productos activos con variantes activas (datos reales del catálogo)
  let productos = await prisma.producto.findMany({
    where: { activo: true, variantes: { some: { activo: true } } },
    include: { variantes: { where: { activo: true } } },
  });
  if (productos.length < 8) {
    console.error(`Solo hay ${productos.length} productos activos con variantes. Se necesitan al menos 8 para generar patrones útiles.`);
    process.exit(1);
  }
  console.log(`Productos en catálogo: ${productos.length}`);

  // Limitar a un subconjunto de productos "populares" para que la matriz
  // usuario x producto no quede demasiado dispersa (mejores patrones).
  const MAX_PRODUCTOS = 150;
  if (productos.length > MAX_PRODUCTOS) {
    // barajado determinista
    for (let i = productos.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [productos[i], productos[j]] = [productos[j], productos[i]];
    }
    productos = productos.slice(0, MAX_PRODUCTOS);
  }
  console.log(`Productos usados para el seed: ${productos.length}`);

  // 2) Agrupar por categoría (grupos de afinidad)
  const porCategoria = new Map();
  for (const p of productos) {
    const cat = p.categoria_id ?? 0;
    if (!porCategoria.has(cat)) porCategoria.set(cat, []);
    porCategoria.get(cat).push(p);
  }
  const categorias = [...porCategoria.keys()];

  // 3) Pares de co-compra: productos de la misma categoría que "van juntos"
  const combo = new Map(); // producto_id -> producto compañero
  for (const lista of porCategoria.values()) {
    for (let i = 0; i + 1 < lista.length; i += 2) {
      combo.set(lista[i].id, lista[i + 1]);
      combo.set(lista[i + 1].id, lista[i]);
    }
  }

  // 4) Crear usuarios demo (idempotente vía upsert)
  const usuarios = [];
  for (let i = 1; i <= NUM_USUARIOS; i++) {
    const nombre = pick(NOMBRES);
    const correo = `cliente${i}@${DOMINIO}`;
    // SQL directo: evita el error de casteo del enum Rol entre schemas.
    // rol se omite y la BD aplica su default CLIENTE.
    const filas = await prisma.$queryRaw`
      INSERT INTO seguridad.tblusuarios (nombre, appaterno, apmaterno, correo, password, telefono)
      VALUES (${nombre}, ${pick(APELLIDOS)}, ${pick(APELLIDOS)}, ${correo}, ${PASSWORD_HASH}, ${`771${String(randInt(1000000, 9999999))}`})
      ON CONFLICT (correo) DO UPDATE SET nombre = EXCLUDED.nombre
      RETURNING id, nombre, appaterno, correo, telefono
    `;
    const u = filas[0];
    // Preferencias: 1 o 2 categorías favoritas por usuario
    const prefs = [pick(categorias)];
    if (rand() < 0.5 && categorias.length > 1) {
      let c2 = pick(categorias);
      if (c2 !== prefs[0]) prefs.push(c2);
    }
    usuarios.push({ u, prefs });
  }
  console.log(`Usuarios demo listos: ${usuarios.length}`);

  const productoPreferido = (prefs) => {
    // 80% de las veces compra de su categoría preferida, 20% de cualquiera
    if (rand() < 0.8) return pick(porCategoria.get(pick(prefs)));
    return pick(productos);
  };

  // 5) Pedidos con patrones de co-compra
  let totalDetalles = 0, totalPedidos = 0;
  const ahora = Date.now();
  for (const { u, prefs } of usuarios) {
    const yaTiene = await prisma.pedido.count({ where: { usuario_id: u.id } });
    if (yaTiene > 0) continue; // idempotente: no duplicar si se corre dos veces

    const numPedidos = randInt(2, 7);
    for (let p = 0; p < numPedidos; p++) {
      const fecha = new Date(ahora - randInt(1, 365) * 24 * 3600 * 1000);
      const items = new Map(); // variante_id -> {variante, producto, cantidad}

      const agregar = (prod) => {
        const v = pick(prod.variantes);
        if (!items.has(v.id)) items.set(v.id, { v, prod, cantidad: randInt(1, 2) });
      };

      const ancla = productoPreferido(prefs);
      agregar(ancla);
      // 55%: agregar el producto "compañero" (patrón que el modelo debe descubrir)
      if (combo.has(ancla.id) && rand() < 0.55) agregar(combo.get(ancla.id));
      // items extra
      const extras = randInt(0, 2);
      for (let e = 0; e < extras; e++) agregar(productoPreferido(prefs));

      const detalles = [...items.values()].map(({ v, prod, cantidad }) => {
        const precio = Number(v.precio_venta);
        return {
          variante_id: v.id,
          nombre_producto: prod.nombre,
          descripcion_variante: [v.tono, v.presentacion].filter(Boolean).join(' ') || null,
          precio_unitario: precio,
          cantidad,
          subtotal: +(precio * cantidad).toFixed(2),
        };
      });
      const subtotal = +detalles.reduce((s, d) => s + d.subtotal, 0).toFixed(2);
      const envio = rand() < 0.4 ? 99 : 0;
      // Literal de enum controlado (solo valores fijos, sin entrada externa):
      const estadoSql = Prisma.raw(rand() < 0.85 ? `'ENTREGADO'` : `'PAGADO'`);

      // SQL directo para evitar el casteo del enum EstadoPedido entre schemas
      const ped = await prisma.$queryRaw`
        INSERT INTO ventas.tblpedidos
          (usuario_id, estado, subtotal, costo_envio, total,
           nombre_cliente, correo_cliente, telefono_cliente, fecha_pedido)
        VALUES
          (${u.id}, ${estadoSql}, ${subtotal}, ${envio}, ${+(subtotal + envio).toFixed(2)},
           ${`${u.nombre} ${u.appaterno ?? ''}`.trim()}, ${u.correo}, ${u.telefono}, ${fecha})
        RETURNING id
      `;
      await prisma.detallePedido.createMany({
        data: detalles.map((d) => ({ ...d, pedido_id: ped[0].id })),
      });
      totalPedidos++;
      totalDetalles += detalles.length;
    }
  }
  console.log(`Pedidos creados: ${totalPedidos} (detalles: ${totalDetalles})`);

  // 6) Favoritos (señal adicional para el modelo)
  let totalFavs = 0;
  for (const { u, prefs } of usuarios) {
    const n = randInt(2, 8);
    const data = [];
    const vistos = new Set();
    for (let f = 0; f < n; f++) {
      const prod = productoPreferido(prefs);
      if (vistos.has(prod.id)) continue;
      vistos.add(prod.id);
      data.push({ usuario_id: u.id, producto_id: prod.id });
    }
    const res = await prisma.favorito.createMany({ data, skipDuplicates: true });
    totalFavs += res.count;
  }
  console.log(`Favoritos creados: ${totalFavs}`);

  // 7) Carrito (interacción débil)
  let totalCarrito = 0;
  for (const { u, prefs } of usuarios) {
    if (rand() < 0.4) continue;
    const n = randInt(1, 3);
    const data = [];
    const vistos = new Set();
    for (let c = 0; c < n; c++) {
      const prod = productoPreferido(prefs);
      const v = pick(prod.variantes);
      if (vistos.has(v.id)) continue;
      vistos.add(v.id);
      data.push({ usuario_id: u.id, variante_id: v.id, cantidad: randInt(1, 2) });
    }
    const res = await prisma.carritoItem.createMany({ data, skipDuplicates: true });
    totalCarrito += res.count;
  }
  console.log(`Items de carrito creados: ${totalCarrito}`);

  const totalInteracciones = totalDetalles + totalFavs + totalCarrito;
  console.log('----------------------------------------');
  console.log(`TOTAL de interacciones generadas: ${totalInteracciones}`);
  console.log(totalInteracciones >= 1000 ? 'OK: se cumple el requisito de >= 1000 registros' : 'AVISO: vuelve a revisar, quedaron menos de 1000');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
