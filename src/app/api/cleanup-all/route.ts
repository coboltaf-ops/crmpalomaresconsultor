import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const PRESERVE = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

export async function POST(req: NextRequest) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  })

  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = (result.rows as any[]).map(r => r.name)
    const toDelete = allTables.filter(t => !PRESERVE.includes(t))
    const preserved = allTables.filter(t => PRESERVE.includes(t))

    const deleted = []
    for (const table of toDelete) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rows = (count.rows[0] as any).cnt || 0
      await db.execute(`DELETE FROM ${table}`)
      deleted.push({ table, rows })
    }

    return NextResponse.json({
      ok: true,
      deleted,
      preserved,
      total_rows_deleted: deleted.reduce((sum, d) => sum + d.rows, 0)
    })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 })
  }
}

export async function GET() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  })

  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = (result.rows as any[]).map(r => r.name)

    const stats = []
    for (const table of allTables) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      stats.push({ table, rows: (count.rows[0] as any).cnt, preserve: PRESERVE.includes(table) })
    }

    return NextResponse.json({ tables: stats })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message }, { status: 500 })
  }
}
