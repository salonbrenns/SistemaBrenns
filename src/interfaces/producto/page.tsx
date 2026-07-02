export interface Producto {
  _id?: string
  nombre: string
  descripcion: string
  precio: number
  categoriaId: string
  marcaId: string
  imagen: string
  oferta: boolean
  stock: number
  createdAt?: Date
}