'use server'
import { revalidatePath } from 'next/cache'
import {prisma} from '@/lib/prisma'


export async function createCategoria(formData: FormData) {
  const nombre = formData.get('nombre') as string
  
  //const activa = formData.get('activa') === 'on'

  await prisma.categoria.create({
    data: {
      nombre,
      
    },
  })

  revalidatePath('/admin/categorias')
}


export async function updateCategoria(id: number, formData: FormData) {
  const nombre = formData.get('nombre') as string

  await prisma.categoria.update({
    where: { id },
    data: {
      nombre,
    },
  })

  revalidatePath('/admin/categorias')
}


export async function toggleCategorias(id: number, activo: boolean) {
  await prisma.categoria.update({
    where: { id },
    data: { activo },
  
  })

  revalidatePath('/admin/categorias')
}