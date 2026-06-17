import { NextRequest, NextResponse } from 'next/server'
import { initializeDB } from '@/shared/lib/turso-db'
import { createClient } from '@libsql/client'

const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoToken = process.env.TURSO_AUTH_TOKEN

export async function DELETE(req: NextRequest) {
  try {
    if (!tursoUrl || !tursoToken) {
      return NextResponse.json({ error: 'Turso no configurado' }, { status: 500 })
    }

    const db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    })

    await initializeDB()
    const result = await db.execute('DELETE FROM prospectos_externos')

    return NextResponse.json({
      ok: true,
      mensaje: 'Todos los prospectos han sido eliminados',
      rowsDeleted: 'Operación completada'
    })
  } catch (err) {
    console.error('❌ Error eliminando prospectos:', err)
    return NextResponse.json({
      error: 'Error al eliminar prospectos',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
