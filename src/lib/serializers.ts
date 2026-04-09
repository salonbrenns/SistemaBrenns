import { Producto } from '@prisma/client'

/** Convierte JsonValue → string[] de forma segura */
function parseImagenes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.startsWith('http'))
  }
  if (typeof value === 'string' && value.startsWith('http')) {
    return [value]
  }
  return []
}

export function serializeProducto(producto: Producto & { marca?: unknown; categoria?: unknown }) {
  return {
    ...producto,
    precio_costo: producto.precio_costo.toNumber(),
    precio_venta: producto.precio_venta.toNumber(),
    imagenes: parseImagenes(producto.imagen), // ← string[] limpio
  }
}