import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, correo, empresa, nro_movil, ciudad, pais, tipo_solicitud, descripcion_requerimiento } = body

    // Validar 9 campos obligatorios
    if (!nombre || !apellido || !correo || !empresa || !nro_movil || !ciudad || !pais || !tipo_solicitud) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Conectar a Turso DIRECTAMENTE
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    // Crear tabla
    try {
      await db.execute(`
        DROP TABLE IF EXISTS prospectos_externos
      `)
      await db.execute(`
        CREATE TABLE prospectos_externos (
          id TEXT PRIMARY KEY,
          nombre TEXT,
          apellido TEXT,
          correo TEXT,
          empresa TEXT,
          nro_movil TEXT,
          ciudad TEXT,
          pais TEXT,
          tipo_solicitud TEXT,
          descripcion_requerimiento TEXT,
          fecha_registro TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
    } catch (e) {
      console.log('Tabla ya existe')
    }

    // Insertar prospecto
    const id = crypto.randomUUID()
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

    await db.execute({
      sql: `
        INSERT INTO prospectos_externos
        (id, nombre, apellido, correo, empresa, nro_movil, ciudad, pais, tipo_solicitud, descripcion_requerimiento, fecha_registro)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        nombre.trim(),
        apellido.trim(),
        correo.trim(),
        empresa.trim(),
        nro_movil.trim(),
        ciudad.trim(),
        pais.trim(),
        tipo_solicitud.trim(),
        descripcion_requerimiento?.trim() || '',
        today
      ]
    })

    return NextResponse.json({
      ok: true,
      id: id,
      mensaje: `Gracias ${nombre}, hemos recibido tu información exitosamente.`
    }, { headers: corsHeaders })

  } catch (err) {
    console.error('❌ Error:', err)
    return NextResponse.json(
      { error: 'Error al procesar solicitud', details: err instanceof Error ? err.message : 'Unknown' },
      { status: 500, headers: corsHeaders }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    const result = await db.execute('SELECT * FROM prospectos_externos ORDER BY created_at DESC')
    return NextResponse.json({ prospectos: result.rows || [] }, { headers: corsHeaders })
  } catch (err) {
    return NextResponse.json({ error: 'Error', prospectos: [] }, { status: 500, headers: corsHeaders })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    await db.execute('DELETE FROM prospectos_externos')
    return NextResponse.json({ ok: true, mensaje: 'BD limpiada' }, { headers: corsHeaders })
  } catch (err) {
    return NextResponse.json({ error: 'Error limpiando BD' }, { status: 500, headers: corsHeaders })
  }
}
