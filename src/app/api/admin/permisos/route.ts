import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "../../../../../auth"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN"
}

const PERMISOS_SISTEMA = [
  // Ventas
  { key: "ventas.cobrar_ticket",      label: "Cobrar un ticket",                    categoria: "Ventas" },
  { key: "ventas.producto_comun",     label: "Utilizar Producto Común",             categoria: "Ventas" },
  { key: "ventas.registrar_entradas", label: "Registrar Entradas",                  categoria: "Ventas" },
  { key: "ventas.registrar_salidas",  label: "Registrar Salidas",                   categoria: "Ventas" },
  { key: "ventas.mayoreo_descuentos", label: "Aplicar Precio de Mayoreo y Descuentos", categoria: "Ventas" },
  { key: "ventas.historial",          label: "Revisar el historial de Ventas",      categoria: "Ventas" },
  { key: "ventas.credito",            label: "Cobrar a crédito",                    categoria: "Ventas" },
  // Inventario
  { key: "inv.agregar_mercancia",     label: "Agregar mercancía",                   categoria: "Inventario" },
  { key: "inv.ver_existencias",       label: "Ver existencias y mínimos",           categoria: "Inventario" },
  { key: "inv.ajustar",               label: "Ajustar el inventario",               categoria: "Inventario" },
  { key: "inv.movimientos",           label: "Ver movimiento de inventarios",       categoria: "Inventario" },
  // Productos
  { key: "prod.crear",                label: "Crear productos",                     categoria: "Productos" },
  { key: "prod.modificar",            label: "Modificar productos",                 categoria: "Productos" },
  { key: "prod.eliminar",             label: "Eliminar productos",                  categoria: "Productos" },
  { key: "prod.reporte_ventas",       label: "Ver reporte de Ventas",               categoria: "Productos" },
  { key: "prod.promociones",          label: "Crear promociones",                   categoria: "Productos" },
  // Clientes
  { key: "cli.credito",               label: "Administrar crédito de clientes",     categoria: "Clientes" },
  { key: "cli.crud",                  label: "Crear, modificar o eliminar clientes",categoria: "Clientes" },
  // Agenda
  { key: "agenda.ver_citas",          label: "Ver citas",                           categoria: "Agenda" },
  { key: "agenda.crear_citas",        label: "Crear/agendar citas",                 categoria: "Agenda" },
  { key: "agenda.cancelar_citas",     label: "Cancelar citas",                      categoria: "Agenda" },
  // Otros
  { key: "otros.configuracion",       label: "Cambiar la configuración",            categoria: "Otros" },
  { key: "otros.corte_dia",           label: "Realizar el corte del día",           categoria: "Otros" },
  { key: "otros.ver_ganancias",       label: "Ver Ganancia del día",                categoria: "Otros" },
]

export { PERMISOS_SISTEMA }

export async function GET(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const usuario_id = Number(searchParams.get("usuario_id"))
  if (!usuario_id) return NextResponse.json({ error: "usuario_id requerido" }, { status: 400 })

  const permisos = await prisma.permisoUsuario.findMany({
    where: { usuario_id },
  })

  // Combinar con lista completa
  const resultado = PERMISOS_SISTEMA.map(p => ({
    ...p,
    activo: permisos.find(x => x.permiso === p.key)?.activo ?? false,
  }))

  return NextResponse.json(resultado)
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { usuario_id, permiso, activo } = await req.json()

  await prisma.permisoUsuario.upsert({
    where: { usuario_id_permiso: { usuario_id, permiso } },
    update: { activo },
    create: { usuario_id, permiso, activo },
  })

  return NextResponse.json({ ok: true })
}
