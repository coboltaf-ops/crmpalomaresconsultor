import { NextResponse } from 'next/server'
import { getFromKV, setToKV } from '@/shared/lib/kv-direct'

export async function GET() {
  try {
    const USE_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

    const testData = {
      timestamp: new Date().toISOString(),
      message: 'Test de Vercel KV',
    }

    // Intentar guardar
    await setToKV('test-key-palomares', testData)

    // Intentar leer
    const retrieved = await getFromKV<any>('test-key-palomares', null)

    return NextResponse.json({
      USE_KV,
      KV_REST_API_URL: process.env.KV_REST_API_URL ? 'CONFIGURED' : 'MISSING',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? 'CONFIGURED' : 'MISSING',
      testData,
      retrieved,
      success: retrieved?.message === 'Test de Vercel KV',
    })
  } catch (err) {
    return NextResponse.json({
      error: String(err),
      USE_KV: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    })
  }
}
