import { Producto } from '@prisma/client'

export function serializeProducto(producto: Producto) {
  return {
    ...producto,
    precio_costo: producto.precio_costo.toNumber(),
    precio_venta: producto.precio_venta.toNumber(),
  }
}