type ProductoRaw = {
  precio_costo?: { toNumber: () => number } | null
  precio_venta?: { toNumber: () => number } | null
  imagen?: unknown
  [key: string]: unknown
}

export function serializeProducto(producto: ProductoRaw) {
  return {
    ...producto,
    precio_costo: producto.precio_costo?.toNumber() ?? null,
    precio_venta: producto.precio_venta?.toNumber() ?? null,
    imagen: Array.isArray(producto.imagen)
      ? (producto.imagen as string[])
      : producto.imagen ?? null,
  }
}
