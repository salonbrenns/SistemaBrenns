/**
 * seed-citas.mjs — Datos sintéticos para el modelo de predicción de
 * cancelación de citas (Solución 2).
 *
 * Reglas de disciplina (igual que seed-ml.mjs):
 *  - SOLO INSERTA datos nuevos, nunca modifica lo existente.
 *  - Reutiliza los mismos usuarios sintéticos (@seed-ml.demo) del recomendador
 *    — no se le inventa historial de citas a clientes reales.
 *  - Semilla fija y determinista → reproducible.
 *  - Para revertir todo: node prisma/seed-citas-cleanup.mjs
 *
 * A diferencia de una primera versión, aquí la probabilidad de cancelación
 * SÍ depende de variables reales (anticipación, método de pago, día de la
 * semana, historial del cliente, canal registrado/invitado) — sin esto,
 * un clasificador entrenado con las citas no tendría ningún patrón que
 * aprender (precision/recall/F1/ROC-AUC saldrían iguales a puro azar).
 *
 * Ejecutar:  node prisma/seed-citas.mjs
 */
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// ---------- RNG determinista (mismo patrón que seed-ml.mjs, semilla distinta) ----------
let _seed = 20260722;
function rand() {
  _seed = (_seed * 1103515245 + 12345) % 2147483648;
  return _seed / 2147483648;
}
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickPonderado = (opciones) => {
  // opciones: [[valor, peso], ...]
  const total = opciones.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [valor, peso] of opciones) {
    if (r < peso) return valor;
    r -= peso;
  }
  return opciones[opciones.length - 1][0];
};

const SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00'];
const NUM_CITAS_PASADAS = 900;   // ya "resueltas": CONFIRMADA o CANCELADA
const NUM_CITAS_FUTURAS = 150;   // aún abiertas: PENDIENTE/CONFIRMADA (para demo del panel)
const PCT_INVITADOS = 0.08;      // % de citas walk-in sin cuenta

const NOTAS = [
  'Primera visita', 'Alergia a productos con fragancia', 'Prefiere productos naturales',
  'Cliente frecuente', 'Solicita manicura francesa', 'Prefiere colores nude',
  null, null, null, null,
];
const NOMBRES_INV = ['Karla', 'Fernando', 'Itzel', 'Ricardo', 'Brenda', 'Omar'];
const APELLIDOS_INV = ['Domínguez', 'Salazar', 'Cordero', 'Ibarra'];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function esDiaHabil(date) {
  const d = date.getDay();
  return d >= 1 && d <= 6; // lunes a sábado
}
function siguienteDiaHabil(date) {
  let d = new Date(date);
  while (!esDiaHabil(d)) d = addDays(d, 1);
  return d;
}

async function main() {
  console.log('== Seed citas: predicción de cancelación ==');

  const clientes = await prisma.$queryRawUnsafe(`
    SELECT id, nombre, correo FROM seguridad.tblusuarios WHERE correo LIKE '%@seed-ml.demo'
  `);
  const servicios = await prisma.$queryRawUnsafe(`
    SELECT id, nombre, precio FROM catalogos.tblservicios WHERE activo = true
  `);
  const empleados = await prisma.$queryRawUnsafe(`
    SELECT id FROM seguridad.tblusuarios WHERE rol::text = 'EMPLEADO'
  `);
  if (clientes.length === 0) throw new Error('No hay usuarios @seed-ml.demo. Corre primero prisma/seed-ml.mjs.');
  if (servicios.length === 0) throw new Error('No hay servicios activos.');
  console.log(`Clientes sintéticos: ${clientes.length} · Servicios: ${servicios.length} · Empleados: ${empleados.length}`);

  const hoy = new Date();
  const empleadoUnico = empleados.length > 0 ? empleados[0].id : null;

  // ---------- 1) Armar el "esqueleto" de cada cita (todo lo que se conoce al agendar) ----------
  const total = NUM_CITAS_PASADAS + NUM_CITAS_FUTURAS;
  const citas = [];
  for (let i = 0; i < total; i++) {
    const esPasada = i < NUM_CITAS_PASADAS;
    const esInvitado = rand() < PCT_INVITADOS;

    let fecha = esPasada
      ? addDays(hoy, -randInt(1, 270))
      : addDays(hoy, randInt(1, 45));
    fecha = siguienteDiaHabil(fecha);
    fecha.setHours(12, 0, 0, 0);

    const anticipacion = randInt(0, 35); // días entre agendar y la cita
    const createdAt = addDays(fecha, -anticipacion);

    const cliente = esInvitado ? null : pick(clientes);
    const servicio = pick(servicios);
    const hora = pick(SLOTS);

    // Método de pago: depende del canal (igual que el código real: cliente
    // registrado agenda con tarjeta/transferencia; invitado paga en el salón).
    const metodo_pago = esInvitado
      ? pickPonderado([['EFECTIVO', 0.6], ['TARJETA', 0.4]])
      : pickPonderado([['TARJETA', 0.65], ['TRANSFERENCIA', 0.35]]);

    citas.push({
      usuario_id: cliente?.id ?? null,
      nombre_contacto: cliente ? null : `${pick(NOMBRES_INV)} ${pick(APELLIDOS_INV)}`,
      telefono_contacto: cliente ? null : `000${randInt(1000000, 9999999)}`, // prefijo 000 = marca de invitado sintético
      servicio_id: servicio.id,
      empleado_id: empleadoUnico,
      fecha,
      hora,
      createdAt,
      anticipacion,
      metodo_pago,
      esPasada,
      esInvitado,
      notas: pick(NOTAS),
    });
  }

  // ---------- 2) Asignar estado en orden CRONOLÓGICO por cliente ----------
  // (para que la "tasa histórica de cancelación" de cada cliente se calcule
  // solo con SUS citas anteriores, nunca mirando el futuro — evita fuga de datos)
  const historial = new Map(); // usuario_id -> { citas, canceladas }
  const ordenCronologico = citas
    .map((c, idx) => idx)
    .sort((a, b) => citas[a].fecha - citas[b].fecha);

  const TASA_GLOBAL_BASE = 0.20;

  for (const idx of ordenCronologico) {
    const c = citas[idx];

    if (!c.esPasada) {
      // Futuras: aún no hay resultado. Estado inicial igual que la lógica real
      // (TRANSFERENCIA -> PENDIENTE, si no -> CONFIRMADA). No entran a entrenar.
      c.estado = c.metodo_pago === 'TRANSFERENCIA' ? 'PENDIENTE' : 'CONFIRMADA';
      continue;
    }

    const h = c.usuario_id != null ? historial.get(c.usuario_id) : null;
    const tasaCliente = h && h.citas > 0 ? h.canceladas / h.citas : TASA_GLOBAL_BASE;

    let p = TASA_GLOBAL_BASE;
    p += c.anticipacion <= 1 ? -0.06 : c.anticipacion >= 20 ? 0.12 : 0;
    p += c.metodo_pago === 'TARJETA' ? -0.10 : c.metodo_pago === 'EFECTIVO' ? 0.05 : 0;
    p += c.fecha.getDay() === 1 ? 0.06 : 0; // lunes: un poco más de cancelaciones
    p += c.esInvitado ? 0.05 : 0.5 * (tasaCliente - TASA_GLOBAL_BASE); // historial solo aplica a clientes registrados
    p = Math.min(0.85, Math.max(0.03, p));

    const cancelada = rand() < p;
    c.estado = cancelada ? 'CANCELADA' : 'CONFIRMADA';
    c.cancelado_por = cancelada ? (rand() < 0.6 ? 'CLIENTE' : 'ADMIN') : null;
    c.cancelado_en = cancelada ? addDays(c.createdAt, randInt(0, c.anticipacion)) : null;

    if (c.usuario_id != null) {
      if (!h) historial.set(c.usuario_id, { citas: 1, canceladas: cancelada ? 1 : 0 });
      else { h.citas++; if (cancelada) h.canceladas++; }
    }
  }

  // ---------- 3) Insertar ----------
  console.log(`Insertando ${citas.length} citas...`);
  const BATCH = 50;
  for (let i = 0; i < citas.length; i += BATCH) {
    const chunk = citas.slice(i, i + BATCH);
    const values = chunk.map((_, j) => {
      const b = j * 12;
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11},$${b + 12})`;
    }).join(',');
    const params = chunk.flatMap(c => [
      c.usuario_id, c.servicio_id, c.empleado_id, c.fecha, c.hora, c.createdAt,
      c.estado, c.metodo_pago, c.notas, c.nombre_contacto, c.telefono_contacto,
      c.cancelado_por ?? null,
    ]);
    await prisma.$queryRawUnsafe(`
      INSERT INTO agenda.tblcitas
        (usuario_id, servicio_id, empleado_id, fecha, hora, "createdAt",
         estado, metodo_pago, notas, nombre_contacto, telefono_contacto, cancelado_por)
      VALUES ${values}
    `, ...params);
    process.stdout.write(`  ${Math.min(i + BATCH, citas.length)}/${citas.length}\r`);
  }

  const canceladas = citas.filter(c => c.estado === 'CANCELADA').length;
  const pasadasResueltas = citas.filter(c => c.esPasada).length;
  console.log(`\nListo. Citas pasadas (con resultado): ${pasadasResueltas} · Canceladas: ${canceladas} (${(100 * canceladas / pasadasResueltas).toFixed(1)}%)`);
  console.log(`Citas futuras (pendientes, para demo del panel): ${citas.length - pasadasResueltas}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
