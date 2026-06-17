import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_DATABASE_URL || ''
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || ''

interface TableInfo {
  name: string
  rowCount?: number
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔨 DATABASE RESET iniciado...')

    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json(
        { error: 'Turso no configurado', details: 'TURSO_DATABASE_URL o TURSO_AUTH_TOKEN faltantes' },
        { status: 500 }
      )
    }

    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    })

    console.log('📋 Listando tablas...')
    const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = (tablesResult.rows as any[]).map(row => row.name as string)

    console.log(`Encontradas ${tables.length} tablas:`, tables)

    const deleted: TableInfo[] = []
    const errors: { table: string; error: string }[] = []

    // Borrar cada tabla
    for (const table of tables) {
      try {
        console.log(`🗑️  Borrando tabla: ${table}...`)

        // Primero contar filas
        const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
        const rowCount = (countResult.rows[0] as any)?.cnt || 0

        // Luego borrar
        await db.execute(`DELETE FROM ${table}`)

        deleted.push({
          name: table,
          rowCount: rowCount as number
        })
        console.log(`✓ Tabla ${table} limpiada (${rowCount} filas eliminadas)`)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.error(`✗ Error limpiando ${table}:`, errorMsg)
        errors.push({ table, error: errorMsg })
      }
    }

    // Respuesta final
    const response = {
      ok: true,
      timestamp: new Date().toISOString(),
      mensaje: `🔨 DATABASE RESET COMPLETADO - ${deleted.length} tabla(s) limpiada(s)`,
      tablas_limpiadas: deleted,
      errores: errors.length > 0 ? errors : undefined,
      instrucciones: [
        '1. ✓ Base de datos limpiada completamente',
        '2. Abre https://crmpalomaresconsultor.vercel.app en navegador incógnito',
        '3. O presiona Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac) para hard refresh',
        '4. Los datos están listos para nueva entrada',
      ],
      estatus: errors.length === 0 ? 'exitoso' : 'parcial'
    }

    console.log('✅ DATABASE RESET completado:', response)
    return NextResponse.json(response)

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('❌ Error en database-reset:', errorMsg)
    return NextResponse.json(
      {
        error: 'Error durante database reset',
        details: errorMsg
      },
      { status: 500 }
    )
  }
}

// GET para reportar estado
export async function GET() {
  try {
    if (!TURSO_URL || !TURSO_TOKEN) {
      return NextResponse.json(
        { error: 'Turso no configurado' },
        { status: 500 }
      )
    }

    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    })

    const tablesResult = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = (tablesResult.rows as any[]).map(row => row.name as string)

    const tableStats: TableInfo[] = []
    for (const table of tables) {
      try {
        const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
        const rowCount = (countResult.rows[0] as any)?.cnt || 0
        tableStats.push({ name: table, rowCount: rowCount as number })
      } catch (err) {
        tableStats.push({ name: table })
      }
    }

    return NextResponse.json({
      ok: true,
      tablas_totales: tableStats.length,
      tablas: tableStats,
      filas_totales: tableStats.reduce((sum, t) => sum + (t.rowCount || 0), 0)
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
