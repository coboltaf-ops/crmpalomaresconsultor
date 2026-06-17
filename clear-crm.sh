#!/bin/bash

echo "🔨 LIMPIEZA SELECTIVA DEL CRM PALOMARES"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

echo "📥 Descargando credenciales de Vercel..."
vercel env pull .env.production.local --environment production > /dev/null 2>&1

if [ ! -f .env.production.local ]; then
  echo "❌ Error: No se pudo descargar .env.production.local"
  exit 1
fi

# Extraer credenciales
TURSO_URL=$(grep "^TURSO_DATABASE_URL=" .env.production.local | cut -d'=' -f2-)
TURSO_TOKEN=$(grep "^TURSO_AUTH_TOKEN=" .env.production.local | cut -d'=' -f2-)

if [ -z "$TURSO_URL" ] || [ -z "$TURSO_TOKEN" ]; then
  echo "❌ Error: Credenciales de Turso no encontradas"
  exit 1
fi

# Crear script en el proyecto SIN depender de dotenv
cat > cleanup-temp.mjs << 'SCRIPT'
import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_URL,
  authToken: process.env.TURSO_TOKEN,
})

const PRESERVE = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

async function cleanup() {
  try {
    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = result.rows.map(r => r.name)
    const toDelete = allTables.filter(t => !PRESERVE.includes(t))
    const preserved = allTables.filter(t => PRESERVE.includes(t))

    console.log('📋 Tablas encontradas:', allTables.length)
    console.log('')

    console.log('❌ A BORRAR:', toDelete.length)
    let totalRows = 0
    for (const t of toDelete) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${t}`)
      const rows = count.rows[0].cnt
      await db.execute(`DELETE FROM ${t}`)
      console.log(`   ✓ ${t}: ${rows} filas eliminadas`)
      totalRows += rows
    }

    console.log('')
    console.log('✅ PRESERVADOS:', preserved.length)
    let preservedRows = 0
    for (const t of preserved) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${t}`)
      const rows = count.rows[0].cnt
      console.log(`   ✓ ${t}: ${rows} filas`)
      preservedRows += rows
    }

    console.log('')
    console.log('='.repeat(50))
    console.log(`🎉 LIMPIEZA COMPLETADA`)
    console.log(`   Filas eliminadas: ${totalRows}`)
    console.log(`   Filas preservadas: ${preservedRows}`)
    console.log('='.repeat(50))
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

cleanup()
SCRIPT

echo "🧹 Limpiando BD..."
TURSO_URL="$TURSO_URL" TURSO_TOKEN="$TURSO_TOKEN" node cleanup-temp.mjs

rm -f cleanup-temp.mjs
echo ""
echo "✅ ¡LISTO!"
