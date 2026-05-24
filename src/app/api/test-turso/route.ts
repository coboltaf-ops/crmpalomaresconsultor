import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE || process.env.TURSO_CONNECTION_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  return NextResponse.json({
    TURSO_DATABASE: process.env.TURSO_DATABASE ? '✅ CONFIGURED' : '❌ MISSING',
    TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? '✅ CONFIGURED' : '❌ MISSING',
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? '✅ CONFIGURED' : '❌ MISSING',
    urlResumed: tursoUrl ? tursoUrl.substring(0, 50) + '...' : 'NONE',
    tokenExists: tursoToken ? '✅ YES' : '❌ NO',
    dbAvailable: tursoUrl && tursoToken ? '✅ READY' : '❌ MISSING VALUES',
  })
}
