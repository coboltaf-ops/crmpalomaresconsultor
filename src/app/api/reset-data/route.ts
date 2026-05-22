import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const KEYS_TO_CLEAR = [
  'clientes-store',
  'contactos-store',
  'cotizaciones-store',
  'oportunidades-store',
  'pqrs-store',
  'productos-store',
  'referencias-store',
]

const KV_KEYS_TO_CLEAR = [
  'nova-pqrs-externas',
  'crm-palomares-prospectos',
  'nova-correos-log',
  'nova-empresa-publica',
  'nova-smtp-config',
]

export async function POST() {
  try {
    console.log('🧹 Iniciando limpieza de datos...')
    console.log(`Limpiando ${KEYS_TO_CLEAR.length} módulos del cliente`)
    console.log(`Limpiando ${KV_KEYS_TO_CLEAR.length} datos de Vercel KV`)

    const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    const cleared = []

    if (USE_KV) {
      for (const key of KV_KEYS_TO_CLEAR) {
        try {
          await kv.del(key)
          cleared.push(`✓ ${key}`)
          console.log(`✓ Borrado: ${key}`)
        } catch (err) {
          console.error(`✗ Error al borrar ${key}:`, err)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: '✅ Todos los datos han sido borrados. Abre el navegador en modo incógnito para actualizar el caché.',
      localStorage_keys: KEYS_TO_CLEAR,
      kv_keys_cleared: cleared,
    })
  } catch (err) {
    console.error('Error en reset:', err)
    return NextResponse.json({ error: 'Error al limpiar datos' }, { status: 500 })
  }
}
