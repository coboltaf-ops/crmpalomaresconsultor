import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function POST(req: NextRequest) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  })

  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = (result.rows as any[]).map(r => r.name)

    const preserve = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']
    const toDelete = tables.filter(t => !preserve.includes(t))

    const deleted = []
    for (const t of toDelete) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${t}`)
      const rows = (count.rows[0] as any).cnt || 0
      await db.execute(`DELETE FROM ${t}`)
      deleted.push({ table: t, rows })
    }

    return NextResponse.json({ ok: true, deleted })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 })
  }
}
