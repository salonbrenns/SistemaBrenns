'use server'

import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Helper para subir a Cloudinary (mismo que usas en productos)
async function uploadToCloudinary(files: File[]): Promise<string[]> {
  if (!files.length) return []
  return Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'Brenns-cursos', resource_type: 'auto' }, (err, result) => {
            if (err || !result) return reject(new Error(err?.message ?? 'Upload fallido'))
            resolve(result.secure_url)
          })
          .end(buffer)
      })
    })
  )
}

async function resolverImagenes(formData: FormData): Promise<string[]> {
  const existentes = (formData.getAll('existing_images[]') as string[]).filter(Boolean)
  const nuevos = (formData.getAll('imagenes') as File[]).filter(f => f instanceof File && f.size > 0)
  const nuevasUrls = await uploadToCloudinary(nuevos)
  return [...existentes, ...nuevasUrls].slice(0, 4)
}

export async function createCurso(formData: FormData) {
  try {
    const imagenes = await resolverImagenes(formData)

    await prisma.curso.create({
      data: {
        codigo: formData.get('codigo') as string,
        titulo: formData.get('titulo') as string,
        descripcion: formData.get('descripcion') as string,
        precio_total: Number(formData.get('precio_total')),
        cupo_maximo: Number(formData.get('cupo_maximo')),
        duracion_horas: formData.get('duracion_horas') ? Number(formData.get('duracion_horas')) : null,
        nivel: formData.get('nivel') as string,
        fecha_inicio: formData.get('fecha_inicio') ? new Date(formData.get('fecha_inicio') as string) : null,
        fecha_fin: formData.get('fecha_fin') ? new Date(formData.get('fecha_fin') as string) : null,
        activo: formData.get('activo') === 'true' || formData.get('activo') === 'on',
        imagenes: imagenes,
      },
    })
  } catch (error) {
    console.error('Error en createCurso:', error)
    throw new Error('Error al crear curso')
  }
  revalidatePath('/admin/cursos')
  redirect('/admin/cursos')
}

export async function updateCurso(id: number, formData: FormData) {
  try {
    const imagenes = await resolverImagenes(formData)

    await prisma.curso.update({
      where: { id },
      data: {
        codigo: formData.get('codigo') as string,
        titulo: formData.get('titulo') as string,
        descripcion: formData.get('descripcion') as string,
        precio_total: Number(formData.get('precio_total')),
        cupo_maximo: Number(formData.get('cupo_maximo')),
        duracion_horas: formData.get('duracion_horas') ? Number(formData.get('duracion_horas')) : null,
        nivel: formData.get('nivel') as string,
        fecha_inicio: formData.get('fecha_inicio') ? new Date(formData.get('fecha_inicio') as string) : null,
        fecha_fin: formData.get('fecha_fin') ? new Date(formData.get('fecha_fin') as string) : null,
        activo: formData.get('activo') === 'true' || formData.get('activo') === 'on',
        imagenes: imagenes,
      },
    })
  } catch (error) {
    console.error('Error en updateCurso:', error)
    throw new Error('Error al actualizar curso')
  }
  revalidatePath('/admin/cursos')
  redirect('/admin/cursos')
}