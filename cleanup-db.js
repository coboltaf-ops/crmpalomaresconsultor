#!/usr/bin/env node
import { createClient } from '@libsql/client'

const TURSO_URL = process.env.TURSO_DATABASE_URL
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Error: TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no definidos')
  process.exit(1)
}

const db = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN })

async function cleanup() {
  try {
    console.log('🔨 INICIANDO LIMPIEZA DE BASE DE DATOS...\n')

    // Listar todas las tablas
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const tables = result.rows.map(row => row.name)

    console.log(`📋 Encontradas ${tables.length} tabla(s):`)
    tables.forEach(t => console.log(`   - ${t}`))
    console.log()

    // Borrar contenido de cada tabla
    for (const table of tables) {
      const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rowCount = countResult.rows[0].cnt

      if (rowCount > 0) {
        await db.execute(`DELETE FROM ${table}`)
        console.log(`✅ ${table}: ${rowCount} fila(s) eliminada(s)`)
      } else {
        console.log(`⏭️  ${table}: ya está vacía`)
      }
    }

    console.log('\n🎉 ¡BASE DE DATOS COMPLETAMENTE LIMPIADA!')
    console.log('\n📌 Ahora puedes probar el formulario de contacto sin datos anteriores.')

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

cleanup()
