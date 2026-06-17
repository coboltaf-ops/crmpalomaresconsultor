import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function verify() {
  try {
    console.log('🔍 VERIFICACIÓN PROFUNDA DE BD TURSO\n')

    const tablesResult = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    const tables = tablesResult.rows.map(r => r.name)

    console.log(`📋 Total de tablas: ${tables.length}\n`)

    let totalRows = 0

    for (const table of tables) {
      const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rowCount = countResult.rows[0].cnt

      console.log(`  📊 ${table}: ${rowCount} filas`)
      totalRows += rowCount

      if (rowCount > 0) {
        const sample = await db.execute(`SELECT * FROM ${table} LIMIT 1`)
        console.log(`     ⚠️  DATOS:`, JSON.stringify(sample.rows[0]))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log(`TOTAL: ${totalRows} filas en BD`)
    console.log(`${'='.repeat(60)}\n`)

    if (totalRows === 0) {
      console.log('✅✅✅ BD COMPLETAMENTE VACÍA - TE LO GARANTIZO')
    } else {
      console.log(`❌ BD TIENE ${totalRows} FILAS`)
    }

  } catch (err) {
    console.error('Error:', err.message)
  }
}

verify()
