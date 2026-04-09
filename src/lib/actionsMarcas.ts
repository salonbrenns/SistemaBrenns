'use server'
import { revalidatePath } from 'next/cache'
import {prisma} from '@/lib/prisma'


export async function createMarca(formData: FormData) {
  const nombre = formData.get('nombre') as string
  

  await prisma.marca.create({
    data: {
      nombre,
      
    },
  })

  revalidatePath('/admin/marcas')
}


export async function updateMarca(id: number, formData: FormData) {
  const nombre = formData.get('nombre') as string

  await prisma.marca.update({
    where: { id },
    data: {
      nombre,
    },
  })

  revalidatePath('/admin/marcas')
}


export async function toggleMarca(id: number, activo: boolean) {
  await prisma.marca.update({
    where: { id },
    data: { activo },
  
  })

  revalidatePath('/admin/marcas')
}