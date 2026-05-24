import { createClient } from '@libsql/client'

const tursoUrl = process.env.TURSO_CONNECTION_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

let db: any = null

console.log('🔧 Inicializando Turso...')
console.log('TURSO_CONNECTION_URL:', tursoUrl ? '✅ CONFIGURED' : '❌ MISSING')
console.log('TURSO_AUTH_TOKEN:', tursoToken ? '✅ CONFIGURED' : '❌ MISSING')

if (tursoUrl && tursoToken) {
  try {
    db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })
    console.log('✅ Turso client creado')
  } catch (err) {
    console.error('❌ Error creando Turso client:', err)
  }
}

export async function initializeDB() {
  if (!db) {
    console.error('❌ Turso no configurado')
    return false
  }

  try {
    // Crear tabla si no existe
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prospectos_externos (
        id TEXT PRIMARY KEY,
        codigo TEXT UNIQUE,
        nombre TEXT,
        apellido TEXT,
        empresa TEXT,
        correo TEXT,
        nro_movil TEXT,
        ciudad TEXT,
        origen_prospecto TEXT,
        detalle_requerimiento TEXT,
        actividad TEXT,
        pais TEXT,
        situacion TEXT,
        fecha_registro TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✅ Tabla prospectos_externos inicializada')
    return true
  } catch (err) {
    console.error('Error inicializando DB:', err)
    return false
  }
}

export async function saveProspecto(prospecto: any) {
  if (!db) {
    console.error('❌ Turso DB no inicializado')
    return null
  }

  try {
    console.log('💾 Ejecutando INSERT para:', prospecto.codigo)
    const result = await db.execute({
      sql: `
        INSERT INTO prospectos_externos (
          id, codigo, nombre, apellido, empresa, correo, nro_movil,
          ciudad, origen_prospecto, detalle_requerimiento, actividad,
          pais, situacion, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        prospecto.id,
        prospecto.codigo,
        prospecto.nombre,
        prospecto.apellido,
        prospecto.empresa,
        prospecto.correo,
        prospecto.nro_movil,
        prospecto.ciudad,
        prospecto.origen_prospecto,
        prospecto.detalle_requerimiento,
        prospecto.actividad,
        prospecto.pais,
        prospecto.situacion,
        prospecto.fecha_registro,
      ],
    })
    console.log('✅ INSERT ejecutado exitosamente para:', prospecto.codigo, 'Result:', result)
    return prospecto
  } catch (err) {
    console.error('❌ Error guardando en Turso:', err instanceof Error ? err.message : err)
    return null
  }
}

export async function getProspectos() {
  if (!db) {
    console.error('❌ Turso no disponible')
    return []
  }

  try {
    const result = await db.execute('SELECT * FROM prospectos_externos ORDER BY created_at DESC')
    console.log('📦 Prospectos obtenidos de Turso:', result.rows.length)
    return result.rows || []
  } catch (err) {
    console.error('❌ Error obteniendo prospectos:', err)
    return []
  }
}
