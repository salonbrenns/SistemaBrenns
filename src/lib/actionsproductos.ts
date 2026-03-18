'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { subirImagen } from '@/lib/cloudinary'

export async function createProducto(formData: FormData) {
  const codigo = formData.get('codigo') as string
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string
  const precio_costo = Number(formData.get('precio_costo'))
  const precio_venta = Number(formData.get('precio_venta'))
  const stock = Number(formData.get('stock'))
  const activo = formData.get('activo') === 'on'
  const marca_id = formData.get('marca_id')
    ? Number(formData.get('marca_id'))
    : null
  const categoria_id = formData.get('categoria_id')
    ? Number(formData.get('categoria_id'))
    : null

  const imagenFile = formData.get('imagen') as File
  let imagen: string | null = null

  if (imagenFile && imagenFile.size > 0) {
    imagen = await subirImagen(imagenFile)  // devuelve la URL de Cloudinary
  }
  await prisma.producto.create({
    data: {
      codigo,
      nombre,
      descripcion,
      precio_costo,
      precio_venta,
      stock,
      imagen,
      activo,
      marca_id,
      categoria_id,
    },
  })

  revalidatePath('/admin/productos')
}

export async function updateProducto(id: number, formData: FormData) {
  const codigo = formData.get('codigo') as string
  const nombre = formData.get('nombre') as string
  const descripcion = formData.get('descripcion') as string
  const precio_costo = Number(formData.get('precio_costo'))
  const precio_venta = Number(formData.get('precio_venta'))
  const stock = Number(formData.get('stock'))
  const activo = formData.get('activo') === 'on'
  const marca_id = formData.get('marca_id') ? Number(formData.get('marca_id')) : null
  const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null
  
  const imagenFile = formData.get('imagen') as File
  let imagenUrl: string | undefined = undefined

  if (imagenFile && imagenFile.size > 0) {
    imagenUrl = await subirImagen(imagenFile)
  }

  
  await prisma.producto.update({
    where: { id },
    data: {
      codigo,
      nombre,
      descripcion,
      precio_costo,
      precio_venta,
      stock,
      activo,
      marca_id,
      categoria_id,
      ...(imagenUrl !== undefined && { imagen: imagenUrl }),
    },
  })

  revalidatePath('/admin/productos')
}

export async function toggleProducto(id: number, activo: boolean) {
  await prisma.producto.update({
    where: { id },
    data: { activo },
  })

  revalidatePath('/admin/productos')
}