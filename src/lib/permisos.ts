export const PERMISOS_SISTEMA = [
  // Ventas
  { key: "ventas.cobrar_ticket",      label: "Cobrar un ticket",                       categoria: "Ventas" },
  { key: "ventas.producto_comun",     label: "Utilizar Producto Común",                categoria: "Ventas" },
  { key: "ventas.registrar_entradas", label: "Registrar Entradas",                     categoria: "Ventas" },
  { key: "ventas.registrar_salidas",  label: "Registrar Salidas",                      categoria: "Ventas" },
  { key: "ventas.mayoreo_descuentos", label: "Aplicar Precio de Mayoreo y Descuentos", categoria: "Ventas" },
  { key: "ventas.historial",          label: "Revisar el historial de Ventas",         categoria: "Ventas" },
  { key: "ventas.credito",            label: "Cobrar a crédito",                       categoria: "Ventas" },
  // Inventario
  { key: "inv.agregar_mercancia",     label: "Agregar mercancía",                      categoria: "Inventario" },
  { key: "inv.ver_existencias",       label: "Ver existencias y mínimos",              categoria: "Inventario" },
  { key: "inv.ajustar",               label: "Ajustar el inventario",                  categoria: "Inventario" },
  { key: "inv.movimientos",           label: "Ver movimiento de inventarios",          categoria: "Inventario" },
  // Productos
  { key: "prod.crear",                label: "Crear productos",                        categoria: "Productos" },
  { key: "prod.modificar",            label: "Modificar productos",                    categoria: "Productos" },
  { key: "prod.eliminar",             label: "Eliminar productos",                     categoria: "Productos" },
  { key: "prod.reporte_ventas",       label: "Ver reporte de Ventas",                  categoria: "Productos" },
  { key: "prod.promociones",          label: "Crear promociones",                      categoria: "Productos" },
  // Clientes
  { key: "cli.credito",               label: "Administrar crédito de clientes",        categoria: "Clientes" },
  { key: "cli.crud",                  label: "Crear, modificar o eliminar clientes",   categoria: "Clientes" },
  // Agenda
  { key: "agenda.ver_citas",          label: "Ver citas",                              categoria: "Agenda" },
  { key: "agenda.crear_citas",        label: "Crear/agendar citas",                    categoria: "Agenda" },
  { key: "agenda.cancelar_citas",     label: "Cancelar citas",                         categoria: "Agenda" },
  // Otros
  { key: "otros.configuracion",       label: "Cambiar la configuración",               categoria: "Otros" },
  { key: "otros.corte_dia",           label: "Realizar el corte del día",              categoria: "Otros" },
  { key: "otros.ver_ganancias",       label: "Ver Ganancia del día",                   categoria: "Otros" },
]