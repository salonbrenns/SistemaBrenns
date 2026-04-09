'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import cloudinary from '@/lib/cloudinary'
import { redirect } from 'next/navigation'

/**
 * Función auxiliar robusta para subir a Cloudinary
 */
async function uploadToCloudinary(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const uploadPromises = files.map(async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'Brenns-productos',
          resource_type: 'auto' 
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Error al obtener resultado de Cloudinary"));
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  });

  return Promise.all(uploadPromises);
}

export async function createProducto(formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio_costo = Number(formData.get('precio_costo'));
    const precio_venta = Number(formData.get('precio_venta'));
    const stock = Number(formData.get('stock'));
    const activo = formData.get('activo') === 'on' || formData.get('activo') === 'true';
    const marca_id = formData.get('marca_id') ? Number(formData.get('marca_id')) : null;
    const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null;

    // 1. Obtener archivos del input "imagenes"
    // Asegúrate que el input en ImageUpload tenga name="imagenes"
    const imageFiles = formData.getAll('imagenes') as File[];
    const validFiles = imageFiles.filter((f) => f instanceof File && f.size > 0);

    // 2. Subida de imágenes (solo si hay archivos válidos)
    let urls: string[] = [];
    if (validFiles.length > 0) {
      urls = await uploadToCloudinary(validFiles);
    }

    // 3. Guardar en Prisma
    await prisma.producto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        precio_costo,
        precio_venta,
        stock,
        imagen: urls, // Se guarda como un array JSON: ["url1", "url2"]
        activo,
        marca_id,
        categoria_id,
      },
    });

  } catch (error) {
    console.error("Error en createProducto:", error);
    throw new Error("No se pudo crear el producto");
  }

  revalidatePath('/admin/productos');
  redirect('/admin/productos');
}

export async function updateProducto(id: number, formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const nombre = formData.get('nombre') as string;
    const descripcion = formData.get('descripcion') as string;
    const precio_costo = Number(formData.get('precio_costo'));
    const precio_venta = Number(formData.get('precio_venta'));
    const stock = Number(formData.get('stock'));
    const activo = formData.get('activo') === 'on' || formData.get('activo') === 'true';
    const marca_id = formData.get('marca_id') ? Number(formData.get('marca_id')) : null;
    const categoria_id = formData.get('categoria_id') ? Number(formData.get('categoria_id')) : null;

    // 1. Imágenes existentes que el usuario NO borró
    // Nota el uso de 'existing_images[]' para coincidir con el input hidden
    const existingImages = formData.getAll('existing_images[]') as string[];

    // 2. Nuevos archivos seleccionados
    const newFiles = (formData.getAll('imagenes') as File[]).filter(f => f instanceof File && f.size > 0);
    
    let newUrls: string[] = [];
    if (newFiles.length > 0) {
      newUrls = await uploadToCloudinary(newFiles);
    }

    // 3. Mezclar y limitar a 4 fotos
    const totalImages = [...existingImages, ...newUrls].slice(0, 4);

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
        imagen: totalImages, // Actualiza el campo JSON
      },
    });

  } catch (error) {
    console.error("Error en updateProducto:", error);
    throw new Error("No se pudo actualizar el producto");
  }

  revalidatePath('/admin/productos');
  redirect('/admin/productos');
}

export async function toggleProducto(id: number, activo: boolean) {
  await prisma.producto.update({
    where: { id },
    data: { activo },
  });
  revalidatePath('/admin/productos');
}