'use client'

interface NumeroInputProps {
  value: number | string | undefined
  onChange: (n: number) => void
  /** Cuántos decimales mostrar (por defecto 2). 0 = solo enteros. */
  decimales?: number
  /** Permitir negativos. Por defecto false. */
  permitirNegativo?: boolean
  /** Estilo del input. Pasarle inputStyle de la página. */
  style?: React.CSSProperties
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** Mostrar prefijo de moneda (ej. "$"). */
  prefijo?: string
  className?: string
}

const SEP_MILES = ','  // Coma para miles
const SEP_DEC = '.'    // Punto para decimales

/** Formatea un número a "1,234,567.89". */
export function formatearNumero(n: number, decimales = 2): string {
  if (!isFinite(n)) return ''
  const fixed = n.toFixed(decimales)
  const [entero, dec] = fixed.split('.')
  const enteroFormateado = entero.replace(/\B(?=(\d{3})+(?!\d))/g, SEP_MILES)
  return decimales > 0 && dec ? `${enteroFormateado}${SEP_DEC}${dec}` : enteroFormateado
}

/** Convierte el texto del input ("1,234.56") a número (1234.56). */
function parsearNumero(texto: string): number {
  // Quitar comas (miles), conservar punto decimal, quitar todo lo demás
  const limpio = texto
    .replace(/,/g, '')   // quitar comas de miles
    .replace(/[^\d.\-]/g, '')  // quitar cualquier otro caracter
  const n = parseFloat(limpio)
  return isFinite(n) ? n : 0
}

/**
 * Input numérico con formato automático "1,234,567.89".
 * Acepta el formato mientras escribes y devuelve el número limpio en onChange.
 */
export default function NumeroInput({
  value, onChange, decimales = 2, permitirNegativo = false,
  style, placeholder, required, disabled, prefijo,
}: NumeroInputProps) {
  const numeroActual = typeof value === 'number' ? value : parseFloat(String(value ?? 0)) || 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let texto = e.target.value
    // Permitir escribir libremente; solo dígitos, separadores y signo si aplica
    const validos = permitirNegativo ? /[^\d.,\-]/g : /[^\d.,]/g
    texto = texto.replace(validos, '')
    // Solo un signo "-" al inicio
    if (permitirNegativo) {
      texto = texto.replace(/(?!^)-/g, '')
    }
    // Solo un punto (decimal). Las comas se interpretan como miles (se ignoran al parsear).
    const partes = texto.split('.')
    if (partes.length > 2) texto = partes[0] + '.' + partes.slice(1).join('')
    // Limitar decimales a `decimales`
    const [ent, dec] = texto.split('.')
    if (dec !== undefined && dec.length > decimales) {
      texto = `${ent}.${dec.slice(0, decimales)}`
    }
    const n = parsearNumero(texto)
    onChange(n)
  }

  // Renderizamos el valor formateado del NÚMERO actual (no del texto crudo).
  // Esto fuerza que el formato sea siempre consistente.
  const display = numeroActual === 0
    ? '' // permitir borrar/empezar desde cero sin "0" molesto
    : formatearNumero(numeroActual, decimales)

  if (prefijo) {
    return (
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 700, pointerEvents: 'none',
        }}>{prefijo}</span>
        <input
          type="text"
          inputMode={decimales === 0 ? 'numeric' : 'decimal'}
          value={display}
          onChange={handleChange}
          placeholder={placeholder ?? '0'}
          required={required}
          disabled={disabled}
          style={{ ...style, paddingLeft: 28 }}
        />
      </div>
    )
  }

  return (
    <input
      type="text"
      inputMode={decimales === 0 ? 'numeric' : 'decimal'}
      value={display}
      onChange={handleChange}
      placeholder={placeholder ?? '0'}
      required={required}
      disabled={disabled}
      style={style}
    />
  )
}
