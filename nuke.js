#!/usr/bin/env node
/**
 * SCRIPT NUCLEAR - Limpia TODA la BD del CRM Palomares
 *
 * USO: node nuke.js
 *
 * Esto borra TODO MENOS:
 * - referencias
 * - usuarios
 * - desarrolladores
 * - segmentos
 * - mercados
 */

import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

const PRESERVE = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

async function main() {
  console.log('\n╔════════════════════════════════════════╗')
  console.log('║  🔥 NUCLEAR WIPEOUT - CRM PALOMARES 🔥 ║')
  console.log('╚════════════════════════════════════════╝\n')

  // Leer env
  const envPath = path.join(process.cwd(), '.env.admin')
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: No existe .env.admin')
    console.error('   Ejecuta primero: vercel env pull .env.admin --environment production')
    process.exit(1)
  }

  const env = fs.readFileSync(envPath, 'utf-8')
  const urlMatch = env.match(/TURSO_DATABASE_URL="([^"]+)"/)
  const tokenMatch = env.match(/TURSO_AUTH_TOKEN="([^"]+)"/)

  if (!urlMatch || !tokenMatch) {
    console.error('❌ Error: Credenciales Turso no encontradas en .env.admin')
    process.exit(1)
  }

  const url = urlMatch[1]
  const token = tokenMatch[1]

  console.log('✓ Credenciales cargadas')
  console.log(`✓ BD: ${url.substring(0, 50)}...`)
  console.log(`✓ Token: ${token.substring(0, 20)}...\n`)

  // Conectar
  const db = createClient({ url, authToken: token })

  try {
    console.log('📋 Listando tablas...')
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = result.rows.map(r => r.name)

    console.log(`✓ ${allTables.length} tablas encontradas\n`)

    // Separar
    const toDelete = allTables.filter(t => !PRESERVE.includes(t))
    const preserved = allTables.filter(t => PRESERVE.includes(t))

    console.log('❌ A BORRAR:')
    toDelete.forEach(t => console.log(`   - ${t}`))
    console.log()

    console.log('✅ PRESERVADOS:')
    preserved.forEach(t => console.log(`   + ${t}`))
    console.log()

    // Confirmar
    console.log('⚠️  ESTO BORRARÁ TODOS LOS DATOS EXCEPTO LOS PRESERVADOS')
    console.log('⚠️  NO HAY FORMA DE RECUPERARLOS\n')

    const readline = await import('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('¿CONTINUAR? (escribe "SI BORRO TODO" para confirmar): ', async (answer) => {
      rl.close()

      if (answer !== 'SI BORRO TODO') {
        console.log('\n❌ Cancelado.')
        process.exit(0)
      }

      console.log('\n🔥 BORRANDO...\n')

      let totalRows = 0

      for (const table of toDelete) {
        try {
          const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
          const rowCount = countResult.rows[0].cnt || 0

          await db.execute(`DELETE FROM ${table}`)
          console.log(`✓ ${table.padEnd(40)} ${rowCount} filas eliminadas`)
          totalRows += rowCount
        } catch (err) {
          console.log(`✗ ${table.padEnd(40)} ERROR: ${err.message}`)
        }
      }

      console.log(`\n✅ TOTAL: ${totalRows} filas borradas\n`)

      // Verificar
      console.log('📊 VERIFICANDO ESTADO FINAL...\n')

      for (const table of toDelete) {
        const countResult = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
        const rowCount = countResult.rows[0].cnt || 0
        const status = rowCount === 0 ? '✓' : '✗'
        console.log(`${status} ${table.padEnd(40)} ${rowCount} filas`)
      }

      console.log('\n╔════════════════════════════════════════╗')
      console.log('║           ✅ LIMPIEZA COMPLETA ✅       ║')
      console.log('╚════════════════════════════════════════╝\n')
    })

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

main()
