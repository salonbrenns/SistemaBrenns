// src/lib/validation.ts

// Validar email con regex
export const validarEmail = (email: string): boolean => {
  if (email.length > 254) return false
  const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

// Validar que un campo no esté vacío
export const validarCampoVacio = (valor: string): boolean => {
  return valor.trim().length > 0
}

// Validar requisitos de contraseña
export const validarContraseña = (password: string): {
  valida: boolean
  errores: string[]
} => {
  const errores: string[] = []

  if (password.length < 8) {
    errores.push("Mínimo 8 caracteres")
  }
  if (!/[A-Z]/.test(password)) {
    errores.push("Una mayúscula (A-Z)")
  }
  if (!/[a-z]/.test(password)) {
    errores.push("Una minúscula (a-z)")
  }
  if (!/\d/.test(password)) {
    errores.push("Un número (0-9)")
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|`~]/.test(password)) {
    errores.push("Un símbolo (!@#$%^&*)")
  }

  return {
    valida: errores.length === 0,
    errores,
  }
}

// Validar que dos campos coincidan
export const validarCoincidencia = (valor1: string, valor2: string): boolean => {
  return valor1 === valor2 && valor1.length > 0
}

// Validar teléfono (formato mexicano: 10 dígitos)
export const validarTelefono = (telefono: string): boolean => {
  const regex = /^\d{10}$/
  return regex.test(telefono.replace(/\s/g, ""))
}

// Validar número de tarjeta (básico: 16 dígitos)
export const validarNumeroTarjeta = (numero: string): boolean => {
  const cleaned = numero.replace(/\s/g, "")
  return /^\d{16}$/.test(cleaned)
}

// Validar CVV (3-4 dígitos)
export const validarCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv)
}

// Validar fecha expiración (MM/YY o MM/YYYY)
export const validarExpiracion = (expiracion: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2,4}$/
  if (!regex.test(expiracion)) return false

  const [mes, año] = expiracion.split("/")
  const mesNum = parseInt(mes)
  const añoNum = parseInt(año)

  if (mesNum < 1 || mesNum > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Convertir a año completo si es de 2 dígitos
  const fullYear = año.length === 2 ? 2000 + añoNum : añoNum

  // Verificar que la tarjeta no esté expirada
  if (fullYear < currentYear) return false
  if (fullYear === currentYear && mesNum < currentMonth) return false

  return true
}

// Validar nombre (mínimo 2 caracteres, solo letras y espacios)
export const validarNombre = (nombre: string): boolean => {
  const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{2,}$/
  return regex.test(nombre)
}

// Validar cantidad (número positivo)
export const validarCantidad = (cantidad: string | number): boolean => {
  const num = typeof cantidad === "string" ? parseInt(cantidad) : cantidad
  return !isNaN(num) && num > 0 && num <= 99
}

// Validar formulario de registro completo
export const validarRegistro = (data: {
  nombre: string
  email: string
  password: string
}): { valido: boolean; errores: Record<string, string> } => {
  const errores: Record<string, string> = {}

  if (!validarCampoVacio(data.nombre)) {
    errores.nombre = "El nombre es requerido"
  } else if (!validarNombre(data.nombre)) {
    errores.nombre = "El nombre debe tener al menos 2 caracteres"
  }

  if (!validarCampoVacio(data.email)) {
    errores.email = "El correo es requerido"
  } else if (!validarEmail(data.email)) {
    errores.email = "El correo no es válido"
  }

  const validacionPassword = validarContraseña(data.password)
  if (!validacionPassword.valida) {
    errores.password = "La contraseña no cumple con los requisitos mínimos"
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}

// Validar formulario de login
export const validarLogin = (data: {
  email: string
  password: string
}): { valido: boolean; errores: Record<string, string> } => {
  const errores: Record<string, string> = {}

  if (!validarCampoVacio(data.email)) {
    errores.email = "El correo es requerido"
  } else if (!validarEmail(data.email)) {
    errores.email = "El correo no es válido"
  }

  if (!validarCampoVacio(data.password)) {
    errores.password = "La contraseña es requerida"
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}

// Validar formulario de inscripción a curso
export const validarInscripcion = (data: {
  nombre: string
  apellido: string
  correo: string
  telefono: string
  nombreTarjeta: string
  numeroTarjeta: string
  expiracion: string
  cvv: string
}): { valido: boolean; errores: Record<string, string> } => {
  const errores: Record<string, string> = {}

  if (!validarCampoVacio(data.nombre)) {
    errores.nombre = "El nombre es requerido"
  }

  if (!validarCampoVacio(data.apellido)) {
    errores.apellido = "El apellido es requerido"
  }

  if (!validarCampoVacio(data.correo)) {
    errores.correo = "El correo es requerido"
  } else if (!validarEmail(data.correo)) {
    errores.correo = "El correo no es válido"
  }

  if (!validarCampoVacio(data.telefono)) {
    errores.telefono = "El teléfono es requerido"
  } else if (!validarTelefono(data.telefono)) {
    errores.telefono = "El teléfono debe tener 10 dígitos"
  }

  if (!validarCampoVacio(data.nombreTarjeta)) {
    errores.nombreTarjeta = "El nombre en la tarjeta es requerido"
  }

  if (!validarCampoVacio(data.numeroTarjeta)) {
    errores.numeroTarjeta = "El número de tarjeta es requerido"
  } else if (!validarNumeroTarjeta(data.numeroTarjeta)) {
    errores.numeroTarjeta = "El número de tarjeta debe tener 16 dígitos"
  }

  if (!validarCampoVacio(data.expiracion)) {
    errores.expiracion = "La fecha de expiración es requerida"
  } else if (!validarExpiracion(data.expiracion)) {
    errores.expiracion = "La fecha de expiración no es válida"
  }

  if (!validarCampoVacio(data.cvv)) {
    errores.cvv = "El CVV es requerido"
  } else if (!validarCVV(data.cvv)) {
    errores.cvv = "El CVV debe tener 3 o 4 dígitos"
  }

  return {
    valido: Object.keys(errores).length === 0,
    errores,
  }
}
