import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_DATABASE_URL || ''
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

export async function POST(req: NextRequest) {
  try {
    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json({ error: 'Turso no configurado' }, { status: 500 })
    }

    const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })

    // Listar tablas
    const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = (tablesResult.rows as any[]).map(row => row.name)

    const deleted = []

    // Borrar contenido de cada tabla
    for (const table of tables) {
      try {
        const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
        const rowCount = (countResult.rows[0] as any)?.cnt || 0
        await db.execute(`DELETE FROM ${table}`)
        deleted.push({ table, rows: rowCount })
      } catch (err) {
        console.error(`Error limpiando ${table}:`, err)
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: `✅ Base de datos limpiada - ${deleted.length} tabla(s)`,
      tablas_limpiadas: deleted,
      instrucciones: 'Abre en navegador incógnito o presiona Ctrl+Shift+R'
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json({ error: 'Turso no configurado' }, { status: 500 })
    }

    const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = (result.rows as any[]).map(row => row.name)

    const stats = []
    for (const table of tables) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      stats.push({ table, rows: (count.rows[0] as any)?.cnt || 0 })
    }

    return NextResponse.json({
      ok: true,
      tablas: stats,
      total_filas: stats.reduce((sum, t) => sum + t.rows, 0)
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
