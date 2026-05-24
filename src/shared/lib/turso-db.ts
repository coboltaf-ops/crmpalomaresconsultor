import { createClient } from '@libsql/client'

const tursoUrl = process.env.TURSO_CONNECTION_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

let db: any = null

if (tursoUrl && tursoToken) {
  db = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  })
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
    console.error('❌ Turso no disponible')
    return null
  }

  try {
    await db.execute({
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
    console.log('✅ Prospecto guardado en Turso:', prospecto.codigo)
    return prospecto
  } catch (err) {
    console.error('❌ Error guardando en Turso:', err)
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
