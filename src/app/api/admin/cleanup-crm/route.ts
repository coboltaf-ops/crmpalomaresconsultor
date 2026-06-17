import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const PRESERVE_TABLES = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

export async function POST(req: NextRequest) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    console.log('🔨 Iniciando limpieza selectiva del CRM Palomares...')

    // Listar todas las tablas
    const tablesResult = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    const allTables = (tablesResult.rows as any[]).map(r => r.name)

    // Tablas a borrar
    const tablesToDelete = allTables.filter(t => !PRESERVE_TABLES.includes(t))
    const preserved = allTables.filter(t => PRESERVE_TABLES.includes(t))

    console.log(`Tablas encontradas: ${allTables.length}`)
    console.log(`Tablas a borrar: ${tablesToDelete.length}`)
    console.log(`Tablas preservadas: ${preserved.length}`)

    const deleted = []

    // Borrar cada tabla
    for (const table of tablesToDelete) {
      try {
        const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
        const rowCount = (countResult.rows[0] as any).cnt || 0

        await db.execute(`DELETE FROM ${table}`)
        deleted.push({ table, rows: rowCount })

        console.log(`✓ Borrado: ${table} (${rowCount} filas)`)
      } catch (err) {
        console.error(`✗ Error en ${table}:`, err)
      }
    }

    return NextResponse.json({
      ok: true,
      mensaje: '🔨 LIMPIEZA SELECTIVA COMPLETADA',
      tablas_borradas: deleted,
      tablas_preservadas: preserved,
      total_filas_eliminadas: deleted.reduce((sum, d) => sum + d.rows, 0),
      instrucciones: 'Abre el CRM en navegador incógnito o presiona Ctrl+Shift+R'
    })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = (result.rows as any[]).map(r => r.name)

    const stats = []
    let totalRows = 0

    for (const table of allTables) {
      const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rowCount = (countResult.rows[0] as any).cnt || 0
      const isPreserved = PRESERVE_TABLES.includes(table)

      stats.push({
        table,
        rows: rowCount,
        preserved: isPreserved
      })
      totalRows += rowCount
    }

    return NextResponse.json({
      ok: true,
      tablas: stats,
      total_filas: totalRows,
      tablas_preservadas: PRESERVE_TABLES
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
