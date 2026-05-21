/**
 * Mapea el nombre de la moneda (texto libre del campo tipo_moneda) a su
 * código ISO de 3 letras. Usado para mostrar el prefijo en montos.
 *
 * Ejemplos:
 *   'Pesos Colombianos' → 'COP'
 *   'Dólares Estadounidenses' → 'USD'
 *   'Euros' → 'EUR'
 *
 * Si no reconoce la moneda, devuelve 'COP' (default Nova Seguridad).
 */
export function getCurrencyCode(tipoMoneda?: string | null): string {
  const t = (tipoMoneda || '').toLowerCase().trim()
  if (!t) return 'COP'
  // Detección por palabras clave
  if (t.includes('peso') && (t.includes('colomb') || t.includes('cop'))) return 'COP'
  if (t.includes('peso') && (t.includes('mex') || t.includes('mxn'))) return 'MXN'
  if (t.includes('peso') && (t.includes('arg') || t.includes('ars'))) return 'ARS'
  if (t.includes('peso') && (t.includes('chil') || t.includes('clp'))) return 'CLP'
  if (t.includes('dólar') || t.includes('dolar') || t.includes('usd')) return 'USD'
  if (t.includes('euro') || t.includes('eur')) return 'EUR'
  if (t.includes('libra') || t.includes('gbp') || t.includes('sterlin')) return 'GBP'
  if (t.includes('real') || t.includes('brasil') || t.includes('brl')) return 'BRL'
  if (t.includes('sol') || t.includes('peruano') || t.includes('pen')) return 'PEN'
  // Si el campo ya es un código de 3 letras, devolverlo en mayúsculas
  if (/^[a-z]{3}$/i.test(t)) return t.toUpperCase()
  return 'COP'
}

/** Combina código de moneda + monto formateado: "COP 1,234,567.89" */
export function formatCurrency(monto: number, tipoMoneda?: string | null): string {
  const code = getCurrencyCode(tipoMoneda)
  const formatted = monto.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `${code} ${formatted}`
}
