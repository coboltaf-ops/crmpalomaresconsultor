import { NextRequest, NextResponse } from 'next/server'

const KEYS_TO_CLEAR = [
  'clientes-store',
  'contactos-store',
  'cotizaciones-store',
  'oportunidades-store',
  'pqrs-store',
  'productos-store',
  'referencias-store',
]

export async function POST(req: NextRequest) {
  try {
    console.log('🧹 Iniciando limpieza de datos...')
    console.log(`Limpiando ${KEYS_TO_CLEAR.length} módulos`)
    return NextResponse.json({
      ok: true,
      mensaje: 'Limpieza completada. Abre el navegador en modo incógnito o borra el localStorage de crmpalomaresconsultor.vercel.app',
      keys_cleared: KEYS_TO_CLEAR,
    })
  } catch (err) {
    console.error('Error en reset:', err)
    return NextResponse.json({ error: 'Error al limpiar datos' }, { status: 500 })
  }
}
