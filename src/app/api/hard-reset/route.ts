import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const KV_KEYS_TO_CLEAR = [
  'nova-pqrs-externas',
  'crm-palomares-prospectos',
  'nova-correos-log',
  'nova-empresa-publica',
  'nova-smtp-config',
]

export async function POST() {
  try {
    console.log('🔨 HARD RESET iniciado - Borrando TODOS los datos...')

    const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
    const cleared: string[] = []

    if (USE_KV) {
      for (const key of KV_KEYS_TO_CLEAR) {
        try {
          await kv.del(key)
          cleared.push(`✓ KV: ${key}`)
          console.log(`✓ Borrado de KV: ${key}`)
        } catch (err) {
          console.error(`✗ Error al borrar ${key}:`, err)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: '🔨 HARD RESET COMPLETADO - Todos los datos del servidor fueron borrados',
      servidor_borrado: cleared,
      instrucciones: [
        '1. Abre tu navegador en modo incógnito',
        '2. Ve a https://crmpalomaresconsultor.vercel.app',
        '3. Los datos del navegador también serán borrados automáticamente',
      ],
      estatus: 'limpio',
    })
  } catch (err) {
    console.error('Error en hard-reset:', err)
    return NextResponse.json({ error: 'Error al hacer hard-reset' }, { status: 500 })
  }
}
