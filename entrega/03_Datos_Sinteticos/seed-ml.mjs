/**
 * Seed de datos sintéticos para el modelo de minería de datos (recomendador).
 *
 * - SOLO INSERTA datos nuevos: no modifica ni borra nada existente.
 * - Los usuarios demo se identifican por correo *@seed-ml.demo
 * - Para revertir todo: node prisma/seed-ml-cleanup.mjs
 *
 * Reglas de generación (documentadas para la sección 3.2 de la entrega):
 *   1. Usuarios demo idempotentes (clienteN@seed-ml.demo), semilla fija 20260715.
 *   2. Cada usuario tiene 1-2 categorías preferidas; 80% de sus compras salen
 *      de ellas y 20% de cualquier categoría (ruido realista).
 *   3. Dentro de cada categoría se forman GRUPOS DE AFINIDAD de 3 productos
 *      (cada producto tiene 2 compañeros); al comprar un ancla, cada compañero
 *      se agrega a la canasta con probabilidad independiente del 50%.
 *   4. Cada usuario genera 2-7 pedidos; cantidades 1-2; 85% ENTREGADO / 15%
 *      PAGADO; el subtotal siempre es la suma real de los renglones.
 *
 * Ejecutar:  node prisma/seed-ml.mjs
 * (si ya existen datos demo de una versión anterior del seed, ejecutar antes
 *  node prisma/seed-ml-cleanup.mjs para regenerar desde cero)
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

  // 3) Grupos de afinidad de co-compra: productos de la misma categoría que
  // "van juntos" (p. ej. base + color + top coat). Se forman grupos de 3
  // dentro de cada categoría, de modo que cada producto tenga 2 compañeros
  // (el sobrante de una categoría queda en un grupo de 2, con 1 compañero).
  // Antes se usaban pares fijos (1 compañero por producto), lo que dejaba a
  // la mayoría de productos con solo 1-2 reglas de asociación posibles.
  const companeros = new Map(); // producto_id -> [productos compañeros]
  for (const lista of porCategoria.values()) {
    for (let i = 0; i < lista.length; i += 3) {
      const grupo = lista.slice(i, i + 3);
      if (grupo.length < 2) continue; // un producto solo no forma grupo
      for (const p of grupo) {
        companeros.set(p.id, grupo.filter((q) => q.id !== p.id));
      }
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
      // 50% por CADA compañero del grupo de afinidad (patrón que el modelo
      // debe descubrir). Con 2 compañeros, la canasta esperada crece a ~2-3
      // productos, generando más pares coocurrentes sin volver trivial la
      // asociación (cada compañero puede o no aparecer, de forma independiente).
      for (const comp of companeros.get(ancla.id) ?? []) {
        if (rand() < 0.5) agregar(comp);
      }
      // items extra (ruido realista: compras sueltas fuera del patrón)
      const extras = randInt(0, 2);
      for (let e = 0; e < extras; e++) agregar(productoPreferido(prefs));

      // Nota: el esquema actual de tbldetalle_pedidos ya no guarda
      // nombre_producto ni descripcion_variante (se resuelven por join
      // con tblvariantes/tblproductos), solo la referencia a la variante.
      const detalles = [...items.values()].map(({ v, cantidad }) => {
        const precio = Number(v.precio_venta);
        return {
          variante_id: v.id,
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
