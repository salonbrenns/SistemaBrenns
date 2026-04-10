import { cn } from '@/lib/utils'
import { PERMISOS_SISTEMA } from '@/lib/permisos'

// ── cn (utils) ────────────────────────────────────────────────
describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })
  it('ignora valores falsy', () => {
    expect(cn('foo', undefined, null, false, '')).toBe('foo')
  })
  it('resuelve conflictos de tailwind (la última gana)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
  it('combina clases condicionales', () => {
    expect(cn('base', true && 'activo', false && 'inactivo')).toBe('base activo')
  })
  it('retorna string vacío si no hay clases', () => {
    expect(cn()).toBe('')
  })
})

// ── PERMISOS_SISTEMA (permisos) ───────────────────────────────
describe('PERMISOS_SISTEMA', () => {
  it('es un array no vacío', () => {
    expect(Array.isArray(PERMISOS_SISTEMA)).toBe(true)
    expect(PERMISOS_SISTEMA.length).toBeGreaterThan(0)
  })
  it('cada permiso tiene key, label y categoria', () => {
    PERMISOS_SISTEMA.forEach(p => {
      expect(p).toHaveProperty('key')
      expect(p).toHaveProperty('label')
      expect(p).toHaveProperty('categoria')
    })
  })
  it('no hay keys duplicadas', () => {
    const keys = PERMISOS_SISTEMA.map(p => p.key)
    const unique = new Set(keys)
    expect(unique.size).toBe(keys.length)
  })
  it('contiene permisos de todas las categorías esperadas', () => {
    const categorias = new Set(PERMISOS_SISTEMA.map(p => p.categoria))
    expect(categorias.has('Ventas')).toBe(true)
    expect(categorias.has('Inventario')).toBe(true)
    expect(categorias.has('Productos')).toBe(true)
    expect(categorias.has('Clientes')).toBe(true)
    expect(categorias.has('Agenda')).toBe(true)
    expect(categorias.has('Otros')).toBe(true)
  })
  it('tiene exactamente 24 permisos', () => {
    expect(PERMISOS_SISTEMA.length).toBe(24)
  })
  it('todos los keys siguen el formato categoria.accion', () => {
    PERMISOS_SISTEMA.forEach(p => {
      expect(p.key).toMatch(/^[a-z_]+\.[a-z_]+$/)
    })
  })
})