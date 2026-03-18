import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function subirImagen(file: File): Promise<string> {
  // Convierte el File a Buffer para enviarlo a Cloudinary
  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'Brenns-productos' },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve(result.secure_url) // ← esta es la URL que guardas en la BD
      }
    ).end(buffer)
  })
}