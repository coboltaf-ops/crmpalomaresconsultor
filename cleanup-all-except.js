#!/usr/bin/env node
/**
 * SCRIPT DE LIMPIEZA SELECTIVA
 * Borra TODAS las tablas EXCEPTO:
 * - referencias (tablas de referencias: segmentos, mercados)
 * - usuarios (usuarios/desarrolladores)
 */

import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Tablas que NO se borran
const PRESERVE_TABLES = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

async function cleanup() {
  try {
    console.log('🔨 LIMPIEZA SELECTIVA DE CRM PALOMARES\n')
    console.log('📌 PRESERVANDO: referencias, usuarios/desarrolladores\n')

    // Listar todas las tablas
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = result.rows.map(r => r.name)

    console.log(`📋 Tablas encontradas: ${allTables.length}`)
    console.log(allTables.map(t => `   - ${t}`).join('\n'))
    console.log()

    // Identificar tablas a borrar
    const tablesToDelete = allTables.filter(t => !PRESERVE_TABLES.includes(t))

    console.log(`🗑️  Tablas a BORRAR: ${tablesToDelete.length}`)
    console.log(tablesToDelete.map(t => `   ❌ ${t}`).join('\n'))
    console.log()

    console.log(`✅ Tablas PRESERVADAS: ${PRESERVE_TABLES.length}`)
    const preservedFound = allTables.filter(t => PRESERVE_TABLES.includes(t))
    console.log(preservedFound.map(t => `   ✓ ${t}`).join('\n'))
    console.log()

    // Borrar tablas
    const deleted = []
    for (const table of tablesToDelete) {
      const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rowCount = countResult.rows[0].cnt

      // Borrar contenido
      await db.execute(`DELETE FROM ${table}`)
      deleted.push({ table, rows: rowCount })

      console.log(`   ✅ ${table}: ${rowCount} fila(s) eliminada(s)`)
    }

    console.log()
    console.log('=' .repeat(60))
    console.log(`✅ LIMPIEZA COMPLETADA`)
    console.log(`   Tablas eliminadas: ${deleted.length}`)
    console.log(`   Total filas borradas: ${deleted.reduce((sum, d) => sum + d.rows, 0)}`)
    console.log(`   Tablas preservadas: ${preservedFound.length}`)
    console.log('='.repeat(60))

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

cleanup()
