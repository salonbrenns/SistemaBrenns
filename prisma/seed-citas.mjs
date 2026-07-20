/**
 * seed-citas.mjs — Genera ~1000 citas de prueba
 *
 * Ejecutar desde la carpeta raíz del proyecto:
 *   node prisma/seed-citas.mjs
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ── Config ────────────────────────────────────────────────────────────────────
const TOTAL_CITAS = 1000

// Cada servicio dura ~2h → slots disponibles (formato HH:MM)
const SLOTS = ["09:00", "11:00", "13:00", "15:00", "17:00"]

// Distribución de estados (pasadas y futuras)
const ESTADOS_PASADOS  = ["COMPLETADA", "COMPLETADA", "COMPLETADA", "CANCELADA"]
const ESTADOS_FUTUROS  = ["PENDIENTE", "PENDIENTE", "CONFIRMADA"]

// Métodos de pago
const METODOS = ["TARJETA", "TRANSFERENCIA", "EFECTIVO", null]

// Notas de ejemplo
const NOTAS = [
  "Primer visita",
  "Alergia a productos con fragancia",
  "Prefiere productos naturales",
  "Cliente frecuente — trato preferente",
  "Viene con su madre",
  "Solicita manicura francesa",
  "Prefiere colores nude",
  null, null, null,
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function randomDateBetween(start, end) {
  const ms = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return new Date(ms)
}

// Lunes=1 … Viernes=5, excluir domingos (0) y sábados (6)
function isWeekday(date) {
  const d = date.getDay()
  return d >= 1 && d <= 6  // lunes a sábado
}

function nextWeekday(date) {
  let d = new Date(date)
  while (!isWeekday(d)) d = addDays(d, 1)
  return d
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍 Cargando datos existentes...")

  const [clientes, servicios, empleados] = await Promise.all([
    prisma.$queryRawUnsafe(`SELECT id, nombre FROM seguridad.tblusuarios WHERE rol::text = 'CLIENTE'`),
    prisma.$queryRawUnsafe(`SELECT id, nombre, precio FROM catalogos.tblservicios WHERE activo = true`),
    prisma.$queryRawUnsafe(`SELECT id, nombre FROM seguridad.tblusuarios WHERE rol::text = 'EMPLEADO'`),
  ])

  if (clientes.length === 0)  throw new Error("❌ No hay clientes en la base de datos.")
  if (servicios.length === 0) throw new Error("❌ No hay servicios activos.")

  console.log(`✅ ${clientes.length} clientes, ${servicios.length} servicios, ${empleados.length} empleados`)

  const hoy       = new Date()
  const hace6M    = addDays(hoy, -180)  // 6 meses atrás
  const en3M      = addDays(hoy, 90)    // 3 meses adelante

  // Mapa para evitar conflictos de horario por empleado y fecha
  // clave: `empleadoId-fecha-hora`
  const ocupados = new Set()

  const lote = []

  let intentos = 0
  while (lote.length < TOTAL_CITAS && intentos < TOTAL_CITAS * 5) {
    intentos++

    const cliente  = pick(clientes)
    const servicio = pick(servicios)
    const empleado = empleados.length > 0 ? pick(empleados) : null
    const slot     = pick(SLOTS)

    // Fecha aleatoria entre hace 6 meses y 3 meses en el futuro
    let fecha = randomDateBetween(hace6M, en3M)
    fecha = nextWeekday(fecha)

    const fechaStr = fecha.toISOString().slice(0, 10) // "YYYY-MM-DD"

    // Evitar conflictos de empleado+fecha+hora
    const claveEmp = empleado ? `${empleado.id}-${fechaStr}-${slot}` : null
    if (claveEmp && ocupados.has(claveEmp)) continue
    if (claveEmp) ocupados.add(claveEmp)

    const esPasada  = fecha < hoy
    const estado    = esPasada ? pick(ESTADOS_PASADOS) : pick(ESTADOS_FUTUROS)
    const estadoCita = esPasada
      ? (estado === "CANCELADA" ? "CANCELADA" : "FINALIZADA")
      : "PENDIENTE"

    const cancelado_por = estado === "CANCELADA"
      ? (Math.random() > 0.4 ? "CLIENTE" : "ADMIN")
      : null
    const cancelado_en  = cancelado_por ? fecha : null

    lote.push({
      usuario_id:        cliente.id,
      servicio_id:       servicio.id,
      empleado_id:       empleado?.id ?? null,
      fecha:             new Date(`${fechaStr}T12:00:00.000Z`),
      hora:              slot,
      estado,
      estado_cita:       estadoCita,
      metodo_pago:       pick(METODOS),
      notas:             pick(NOTAS),
      total:             servicio.precio,
      nombre_contacto:   cliente.nombre,
      cancelado_por,
      cancelado_en,
      recordatorio_enviado: esPasada,
    })
  }

  console.log(`📝 Insertando ${lote.length} citas en lotes de 100...`)

  // Insertar en lotes de 50 usando SQL raw para evitar problemas de enum cross-schema
  const BATCH = 50
  for (let i = 0; i < lote.length; i += BATCH) {
    const chunk = lote.slice(i, i + BATCH)

    // Construir VALUES parametrizados
    const values = chunk.map((_, j) => {
      const base = j * 12
      return `($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10},$${base+11},$${base+12})`
    }).join(",")

    const params = chunk.flatMap(c => [
      c.usuario_id,
      c.servicio_id,
      c.empleado_id,
      c.fecha,
      c.hora,
      c.estado,
      c.estado_cita,
      c.metodo_pago,
      c.notas,
      c.total,
      c.nombre_contacto,
      c.cancelado_por,
    ])

    await prisma.$queryRawUnsafe(`
      INSERT INTO agenda.tblcitas
        (usuario_id, servicio_id, empleado_id, fecha, hora, estado, estado_cita,
         metodo_pago, notas, total, nombre_contacto, cancelado_por)
      VALUES ${values}
      ON CONFLICT DO NOTHING
    `, ...params)

    process.stdout.write(`  ${Math.min(i + BATCH, lote.length)}/${lote.length}\r`)
  }

  const [{ count }] = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM agenda.tblcitas`)
  console.log(`\n✅ Listo. Total de citas en la base de datos: ${count}`)
}

main()
  .catch(err => { console.error("❌ Error:", err.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
