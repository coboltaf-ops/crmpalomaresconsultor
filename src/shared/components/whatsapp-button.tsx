'use client'

interface WhatsAppButtonProps {
  /** Número con o sin formato. Se limpia automáticamente. */
  telefono: string | undefined | null
  /** Nombre del destinatario para personalizar el saludo. */
  nombre?: string
  /** Mensaje personalizado. Si no se da, usa uno por defecto. */
  mensaje?: string
  /** Tamaño compacto (icon-only) para junto a inputs. */
  compacto?: boolean
}

/**
 * Limpia un número telefónico colombiano y lo deja listo para wa.me
 * - Quita espacios, guiones, paréntesis, +, etc.
 * - Si no empieza por 57 (Colombia) y tiene 10 dígitos (móvil colombiano), antepone 57.
 */
function limpiarNumero(tel: string): string {
  const soloDigitos = tel.replace(/\D/g, '')
  if (!soloDigitos) return ''
  // Si ya viene con código de país (10+ dígitos sin 57, o ya con 57)
  if (soloDigitos.startsWith('57') && soloDigitos.length >= 12) return soloDigitos
  if (soloDigitos.length === 10) return '57' + soloDigitos
  return soloDigitos
}

export default function WhatsAppButton({ telefono, nombre, mensaje, compacto }: WhatsAppButtonProps) {
  const numero = limpiarNumero(telefono || '')
  const habilitado = numero.length >= 10

  const texto = mensaje
    ?? (nombre
      ? `Hola ${nombre}, le contacto desde Nova Seguridad.`
      : 'Hola, le contacto desde Nova Seguridad.')

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!habilitado) {
      alert('Ingrese un número de teléfono válido (10 dígitos como mínimo).')
      return
    }
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const baseStyle: React.CSSProperties = {
    background: habilitado ? '#25D366' : 'rgba(37, 211, 102, 0.3)',
    color: '#ffffff',
    border: '1px solid ' + (habilitado ? '#128C7E' : 'rgba(18, 140, 126, 0.4)'),
    cursor: habilitado ? 'pointer' : 'not-allowed',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s',
  }

  if (compacto) {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={habilitado ? `Abrir WhatsApp con ${nombre || 'el contacto'}` : 'Número inválido'}
        style={{
          ...baseStyle,
          padding: '0 12px',
          height: 44,
          minWidth: 56,
          borderRadius: 10,
          fontSize: 18,
        }}
      >
        💚
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={habilitado ? `Abrir WhatsApp con ${nombre || 'el contacto'}` : 'Número inválido'}
      style={{
        ...baseStyle,
        padding: '10px 16px',
        borderRadius: 10,
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 16 }}>💚</span>
      <span>WhatsApp</span>
    </button>
  )
}
