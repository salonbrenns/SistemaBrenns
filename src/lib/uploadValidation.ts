/**
 * Validación de archivos para rutas de upload.
 * Centraliza la lógica para que todos los endpoints sean consistentes.
 */

// Imágenes solamente (para subidas de productos, perfil, etc.)
const TIPOS_IMAGEN   = ["image/jpeg", "image/png", "image/webp", "image/gif"]
// Comprobantes: imágenes + PDF
const TIPOS_COMPROBANTE = [...TIPOS_IMAGEN, "application/pdf"]

const TAMANO_IMAGEN_MB       = 5
const TAMANO_COMPROBANTE_MB  = 10
const MB                     = 1024 * 1024

export function validarArchivo(file: File): { ok: true } | { ok: false; error: string; status: number } {
  if (!TIPOS_IMAGEN.includes(file.type)) {
    return {
      ok:     false,
      error:  `Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP o GIF`,
      status: 415,
    }
  }

  if (file.size > TAMANO_IMAGEN_MB * MB) {
    return {
      ok:     false,
      error:  `El archivo supera el límite de ${TAMANO_IMAGEN_MB} MB`,
      status: 413,
    }
  }

  return { ok: true }
}

// Validación específica para comprobantes de pago (acepta PDF + imágenes, hasta 10 MB)
export function validarComprobante(file: File): { ok: true } | { ok: false; error: string; status: number } {
  if (!TIPOS_COMPROBANTE.includes(file.type)) {
    return {
      ok:     false,
      error:  `Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP o PDF`,
      status: 415,
    }
  }

  if (file.size > TAMANO_COMPROBANTE_MB * MB) {
    return {
      ok:     false,
      error:  `El archivo supera el límite de ${TAMANO_COMPROBANTE_MB} MB`,
      status: 413,
    }
  }

  return { ok: true }
}

export function validarArchivos(
  files: File[],
  maxFiles = 10
): { ok: true } | { ok: false; error: string; status: number } {
  if (files.length > maxFiles) {
    return {
      ok:     false,
      error:  `Se permiten máximo ${maxFiles} archivos por subida`,
      status: 400,
    }
  }

  for (const file of files) {
    const result = validarArchivo(file)
    if (!result.ok) return result
  }

  return { ok: true }
}
