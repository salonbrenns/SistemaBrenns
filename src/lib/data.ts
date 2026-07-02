import { Marca } from '@/interfaces/marca/page'
import { Categoria } from '@/interfaces/categoria/page'
import { Producto } from '@/interfaces/producto/page'

export async function fetchMarcas(): Promise<Marca[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/marcas`, {
    cache: 'no-store',
  })
  return res.json()
}

export async function fetchCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categorias`, {
    cache: 'no-store',
  })
  return res.json()
}

export async function fetchProductos(): Promise<Producto[]> {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/productos`, {
    cache: 'no-store',
  })
  return res.json()
}