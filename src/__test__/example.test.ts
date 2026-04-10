import {
  validarEmail,
  validarCampoVacio,
  validarContraseña,
  validarCoincidencia,
  validarTelefono,
  validarNumeroTarjeta,
  validarCVV,
  validarExpiracion,
  validarNombre,
  validarCantidad,
  validarRegistro,
  validarLogin,
  validarInscripcion,
} from '@/lib/validation'

// ── validarEmail ──────────────────────────────────────────────
describe('validarEmail', () => {
  it('acepta un correo válido', () => {
    expect(validarEmail('test@ejemplo.com')).toBe(true)
  })
  it('rechaza correo sin @', () => {
    expect(validarEmail('testejemplo.com')).toBe(false)
  })
  it('rechaza correo vacío', () => {
    expect(validarEmail('')).toBe(false)
  })
  it('rechaza correo mayor a 254 caracteres', () => {
    expect(validarEmail('a'.repeat(250) + '@x.com')).toBe(false)
  })
})

// ── validarCampoVacio ─────────────────────────────────────────
describe('validarCampoVacio', () => {
  it('retorna true si hay contenido', () => {
    expect(validarCampoVacio('hola')).toBe(true)
  })
  it('retorna false si está vacío', () => {
    expect(validarCampoVacio('')).toBe(false)
  })
  it('retorna false si solo hay espacios', () => {
    expect(validarCampoVacio('   ')).toBe(false)
  })
})

// ── validarContraseña ─────────────────────────────────────────
describe('validarContraseña', () => {
  it('acepta contraseña que cumple todos los requisitos', () => {
    expect(validarContraseña('Segura1!')).toEqual({ valida: true, errores: [] })
  })
  it('rechaza contraseña corta', () => {
    const r = validarContraseña('Ab1!')
    expect(r.valida).toBe(false)
    expect(r.errores).toContain('Mínimo 8 caracteres')
  })
  it('rechaza contraseña sin mayúscula', () => {
    const r = validarContraseña('segura1!')
    expect(r.errores).toContain('Una mayúscula (A-Z)')
  })
  it('rechaza contraseña sin número', () => {
    const r = validarContraseña('Seguraa!')
    expect(r.errores).toContain('Un número (0-9)')
  })
  it('rechaza contraseña sin símbolo', () => {
    const r = validarContraseña('Segura11')
    expect(r.errores).toContain('Un símbolo (!@#$%^&*)')
  })
})

// ── validarCoincidencia ───────────────────────────────────────
describe('validarCoincidencia', () => {
  it('retorna true si los valores son iguales', () => {
    expect(validarCoincidencia('abc', 'abc')).toBe(true)
  })
  it('retorna false si los valores difieren', () => {
    expect(validarCoincidencia('abc', 'xyz')).toBe(false)
  })
  it('retorna false si ambos están vacíos', () => {
    expect(validarCoincidencia('', '')).toBe(false)
  })
})

// ── validarTelefono ───────────────────────────────────────────
describe('validarTelefono', () => {
  it('acepta número de 10 dígitos', () => {
    expect(validarTelefono('7712345678')).toBe(true)
  })
  it('rechaza número de 9 dígitos', () => {
    expect(validarTelefono('771234567')).toBe(false)
  })
  it('rechaza número con letras', () => {
    expect(validarTelefono('771234567a')).toBe(false)
  })
})

// ── validarNumeroTarjeta ──────────────────────────────────────
describe('validarNumeroTarjeta', () => {
  it('acepta número de 16 dígitos', () => {
    expect(validarNumeroTarjeta('1234567812345678')).toBe(true)
  })
  it('acepta número con espacios', () => {
    expect(validarNumeroTarjeta('1234 5678 1234 5678')).toBe(true)
  })
  it('rechaza número de 15 dígitos', () => {
    expect(validarNumeroTarjeta('123456781234567')).toBe(false)
  })
})

// ── validarCVV ────────────────────────────────────────────────
describe('validarCVV', () => {
  it('acepta CVV de 3 dígitos', () => {
    expect(validarCVV('123')).toBe(true)
  })
  it('acepta CVV de 4 dígitos', () => {
    expect(validarCVV('1234')).toBe(true)
  })
  it('rechaza CVV de 2 dígitos', () => {
    expect(validarCVV('12')).toBe(false)
  })
})

// ── validarExpiracion ─────────────────────────────────────────
describe('validarExpiracion', () => {
  it('acepta fecha futura válida', () => {
    expect(validarExpiracion('12/99')).toBe(true)
  })
  it('rechaza formato incorrecto', () => {
    expect(validarExpiracion('1299')).toBe(false)
  })
  it('rechaza mes 00', () => {
    expect(validarExpiracion('00/99')).toBe(false)
  })
})

// ── validarNombre ─────────────────────────────────────────────
describe('validarNombre', () => {
  it('acepta nombre con letras y espacios', () => {
    expect(validarNombre('Ana García')).toBe(true)
  })
  it('rechaza nombre de 1 carácter', () => {
    expect(validarNombre('A')).toBe(false)
  })
  it('rechaza nombre con números', () => {
    expect(validarNombre('Ana123')).toBe(false)
  })
})

// ── validarCantidad ───────────────────────────────────────────
describe('validarCantidad', () => {
  it('acepta cantidad positiva', () => {
    expect(validarCantidad(5)).toBe(true)
  })
  it('rechaza cantidad 0', () => {
    expect(validarCantidad(0)).toBe(false)
  })
  it('rechaza cantidad mayor a 99', () => {
    expect(validarCantidad(100)).toBe(false)
  })
  it('acepta string numérico válido', () => {
    expect(validarCantidad('10')).toBe(true)
  })
})

// ── validarRegistro ───────────────────────────────────────────
describe('validarRegistro', () => {
  it('retorna válido con datos correctos', () => {
    const r = validarRegistro({ nombre: 'Ana García', email: 'ana@test.com', password: 'Segura1!' })
    expect(r.valido).toBe(true)
  })
  it('retorna error si falta nombre', () => {
    const r = validarRegistro({ nombre: '', email: 'ana@test.com', password: 'Segura1!' })
    expect(r.errores.nombre).toBeDefined()
  })
  it('retorna error si el correo es inválido', () => {
    const r = validarRegistro({ nombre: 'Ana', email: 'noesvalido', password: 'Segura1!' })
    expect(r.errores.email).toBeDefined()
  })
})

// ── validarLogin ──────────────────────────────────────────────
describe('validarLogin', () => {
  it('retorna válido con datos correctos', () => {
    const r = validarLogin({ email: 'ana@test.com', password: '123456' })
    expect(r.valido).toBe(true)
  })
  it('retorna error si falta email', () => {
    const r = validarLogin({ email: '', password: '123456' })
    expect(r.errores.email).toBeDefined()
  })
  it('retorna error si falta contraseña', () => {
    const r = validarLogin({ email: 'ana@test.com', password: '' })
    expect(r.errores.password).toBeDefined()
  })
})

// ── validarInscripcion ────────────────────────────────────────
describe('validarInscripcion', () => {
  const base = {
    nombre: 'Ana',
    apellido: 'García',
    nombreTarjeta: 'Ana García',
    numeroTarjeta: '1234567812345678',
    expiracion: '12/99',
    cvv: '123',
  }
  it('retorna válido con datos completos', () => {
    expect(validarInscripcion(base).valido).toBe(true)
  })
  it('retorna error si falta nombre', () => {
    const r = validarInscripcion({ ...base, nombre: '' })
    expect(r.errores.nombre).toBe('El nombre es requerido')
  })
  it('retorna error si falta apellido', () => {
    const r = validarInscripcion({ ...base, apellido: '' })
    expect(r.errores.apellido).toBe('El apellido es requerido')
  })
  it('retorna error si falta nombre en tarjeta', () => {
    const r = validarInscripcion({ ...base, nombreTarjeta: '' })
    expect(r.errores.nombreTarjeta).toBe('El nombre en la tarjeta es requerido')
  })
  it('retorna error si el CVV es inválido', () => {
    const r = validarInscripcion({ ...base, cvv: '1' })
    expect(r.errores.cvv).toBe('El CVV debe tener 3 o 4 dígitos')
  })
  it('retorna error si la tarjeta tiene menos de 16 dígitos', () => {
    const r = validarInscripcion({ ...base, numeroTarjeta: '1234' })
    expect(r.errores.numeroTarjeta).toBe('El número de tarjeta debe tener 16 dígitos')
  })
})