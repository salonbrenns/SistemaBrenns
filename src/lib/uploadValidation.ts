/**
 * Validación de archivos para rutas de upload.
 * Centraliza la lógica para que todos los endpoints sean consistentes.
 */

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const TAMANO_MAXIMO_MB = 5
const TAMANO_MAXIMO_BYTES = TAMANO_MAXIMO_MB * 1024 * 1024

export function validarArchivo(file: File): { ok: true } | { ok: false; error: string; status: number } {
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return {
      ok:     false,
      error:  `Tipo de archivo no permitido. Solo se aceptan: ${TIPOS_PERMITIDOS.join(", ")}`,
      status: 415,
    }
  }

  if (file.size > TAMANO_MAXIMO_BYTES) {
    return {
      ok:     false,
      error:  `El archivo supera el límite de ${TAMANO_MAXIMO_MB} MB`,
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
