'use server'

import { prisma } from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Cloudinary helper ────────────────────────────────────────────────────────

async function uploadToCloudinary(files: File[]): Promise<string[]> {
  if (!files.length) return []
  return Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'Brenns-productos', resource_type: 'auto' }, (err, result) => {
            if (err || !result) return reject(err)
            resolve(result.secure_url)
          })
          .end(buffer)
      })
    })
  )
}

// ─── Parsers de FormData ──────────────────────────────────────────────────────

function parseImagenesExistentes(formData: FormData): string[] {
  return (formData.getAll('existing_images[]') as string[]).filter(Boolean)
}

async function resolverImagenes(formData: FormData): Promise<string[]> {
  const existentes = parseImagenesExistentes(formData)
  const nuevos = (formData.getAll('imagenes') as File[]).filter(f => f instanceof File && f.size > 0)
  const nuevasUrls = await uploadToCloudinary(nuevos)
  return [...existentes, ...nuevasUrls].slice(0, 4)
}

// Parsea todas las variantes que vienen del form
// Cada variante lleva índice: variante_codigo_0, variante_tono_0, etc.
interface VarianteInput {
  id?: number           // si ya existe en BD
  codigo: string
  tono: string
  presentacion: string
  precio_costo: number
  precio_venta: number
  stock: number
  activo: boolean
}

function parseVariantes(formData: FormData): VarianteInput[] {
  const variantes: VarianteInput[] = []
  let i = 0
  while (formData.has(`variante_precio_venta_${i}`)) {
    variantes.push({
      id: formData.get(`variante_id_${i}`)
        ? Number(formData.get(`variante_id_${i}`))
        : undefined,
      codigo:       (formData.get(`variante_codigo_${i}`)       as string) || '',
      tono:         (formData.get(`variante_tono_${i}`)         as string) || '',
      presentacion: (formData.get(`variante_presentacion_${i}`) as string) || '',
      precio_costo: Number(formData.get(`variante_precio_costo_${i}`)),
      precio_venta: Number(formData.get(`variante_precio_venta_${i}`)),
      stock:        Number(formData.get(`variante_stock_${i}`)),
      activo:       formData.get(`variante_activo_${i}`) === 'true',
    })
    i++
  }
  return variantes
}

// ─── createProducto ───────────────────────────────────────────────────────────

export async function createProducto(formData: FormData) {
  try {
    const nombre       = formData.get('nombre')       as string
    const descripcion  = formData.get('descripcion')  as string
    const marca_id     = formData.get('marca_id')     ? Number(formData.get('marca_id'))     : null
    const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null
    const activo       = formData.get('activo') === 'on' || formData.get('activo') === 'true'

    const imagenes = await resolverImagenes(formData)
    const variantes = parseVariantes(formData)

    if (variantes.length === 0) throw new Error('Debe haber al menos una variante')

    await prisma.producto.create({
      data: {
        nombre,
        descripcion,
        marca_id,
        categoria_id,
        activo,
        imagen: imagenes,
        variantes: {
          create: variantes.map(v => ({
            codigo:       v.codigo       || null,
            tono:         v.tono         || null,
            presentacion: v.presentacion || null,
            precio_costo: v.precio_costo,
            precio_venta: v.precio_venta,
            stock:        v.stock,
            activo:       v.activo,
          })),
        },
      },
    })
  } catch (error) {
    console.error('Error en createProducto:', error)
    throw new Error('No se pudo crear el producto')
  }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

// ─── updateProducto ───────────────────────────────────────────────────────────

export async function updateProducto(id: number, formData: FormData) {
  try {
    const nombre       = formData.get('nombre')       as string
    const descripcion  = formData.get('descripcion')  as string
    const marca_id     = formData.get('marca_id')     ? Number(formData.get('marca_id'))     : null
    const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null
    const activo       = formData.get('activo') === 'on' || formData.get('activo') === 'true'

    const imagenes  = await resolverImagenes(formData)
    const variantes = parseVariantes(formData)

    // IDs que siguen existiendo en el form
    const idsEnForm = variantes.filter(v => v.id).map(v => v.id!)

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar producto padre
      await tx.producto.update({
        where: { id },
        data: { nombre, descripcion, marca_id, categoria_id, activo, imagen: imagenes },
      })

      // 2. Eliminar variantes que el usuario borró del form
      await tx.variante.deleteMany({
        where: { producto_id: id, id: { notIn: idsEnForm } },
      })

      // 3. Upsert de cada variante
      for (const v of variantes) {
        const data = {
          codigo:       v.codigo       || null,
          tono:         v.tono         || null,
          presentacion: v.presentacion || null,
          precio_costo: v.precio_costo,
          precio_venta: v.precio_venta,
          stock:        v.stock,
          activo:       v.activo,
        }
        if (v.id) {
          await tx.variante.update({ where: { id: v.id }, data })
        } else {
          await tx.variante.create({ data: { ...data, producto_id: id } })
        }
      }
    })
  } catch (error) {
    console.error('Error en updateProducto:', error)
    throw new Error('No se pudo actualizar el producto')
  }

  revalidatePath('/admin/productos')
  redirect('/admin/productos')
}

// ─── toggleProducto ───────────────────────────────────────────────────────────

export async function toggleProducto(id: number, activo: boolean) {
  await prisma.producto.update({ where: { id }, data: { activo } })
  revalidatePath('/admin/productos')
}