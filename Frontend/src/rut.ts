// Formateo visual del RUT mientras se escribe (sin validar módulo 11). Oracle valida y normaliza al guardar.
const MAX_BODY = 8

// Deja solo dígitos y una K final (dígito verificador), máximo 8 dígitos de cuerpo + 1 verificador
export function limpiarRut(raw: string): string {
  const s = raw.toUpperCase().replace(/[^0-9K]/g, '')
  const kFinal = s.endsWith('K') && s.length > 1
  const digitos = s.replace(/K/g, '')
  return kFinal ? digitos.slice(0, MAX_BODY) + 'K' : digitos.slice(0, MAX_BODY + 1)
}

// Recibe el texto limpio y devuelve el RUT con puntos y guion (ej. 12.345.678-9)
export function formatearRutLimpio(limpio: string): string {
  if (limpio.length <= 1) return limpio
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
}

export const formatearRut = (raw: string) => formatearRutLimpio(limpiarRut(raw))

// Cuenta los caracteres significativos (dígitos/K) antes de una posición
export const contarSignificativos = (texto: string, hasta: number) => texto.slice(0, hasta).replace(/[^0-9kK]/g, '').length

// Posición del cursor en el texto formateado tras `n` caracteres significativos
export function posicionTrasSignificativos(formateado: string, n: number): number {
  if (n <= 0) return 0
  let visto = 0
  for (let i = 0; i < formateado.length; i++) {
    if (/[0-9K]/.test(formateado[i]) && ++visto === n) return i + 1
  }
  return formateado.length
}
