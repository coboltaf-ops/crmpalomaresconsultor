import { NextRequest, NextResponse } from 'next/server'
import { readList, writeList } from '@/shared/lib/kv-store'

const MAX_BACKUPS_POR_MODULO = 20

interface BackupMeta {
  id: string
  fecha: string
  hora: string
  total: number
}

interface Backup<T = unknown> extends BackupMeta {
  registros: T[]
}

const KEY = (modulo: string) => `backups-${modulo}`

// GET /api/backups?modulo=clientes
// Lista los backups (solo metadata) ordenados del más reciente al más antiguo.
export async function GET(req: NextRequest) {
  const modulo = req.nextUrl.searchParams.get('modulo')
  if (!modulo) return NextResponse.json({ error: 'Falta parámetro modulo' }, { status: 400 })
  const all = await readList<Backup>(KEY(modulo))
  const meta: BackupMeta[] = all
    .map(b => ({ id: b.id, fecha: b.fecha, hora: b.hora, total: b.total }))
    .sort((a, b) => b.id.localeCompare(a.id))
  return NextResponse.json({ backups: meta })
}

// POST /api/backups
// Body: { modulo: string, registros: T[] }
// Guarda un backup nuevo y devuelve su id.
export async function POST(req: NextRequest) {
  try {
    const { modulo, registros } = await req.json() as { modulo: string; registros: unknown[] }
    if (!modulo) return NextResponse.json({ error: 'Falta modulo' }, { status: 400 })
    if (!Array.isArray(registros)) return NextResponse.json({ error: 'registros debe ser un array' }, { status: 400 })

    const now = new Date()
    const fechaCO = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    const horaCO = now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: false })
    const id = `${fechaCO}_${horaCO.replace(/:/g, '-')}_${Math.random().toString(36).slice(2, 6)}`

    const backup: Backup = {
      id, fecha: fechaCO, hora: horaCO,
      total: registros.length,
      registros,
    }

    const existentes = await readList<Backup>(KEY(modulo))
    const nuevos = [backup, ...existentes].slice(0, MAX_BACKUPS_POR_MODULO)
    await writeList(KEY(modulo), nuevos)

    return NextResponse.json({ ok: true, id, fecha: fechaCO, hora: horaCO, total: registros.length })
  } catch (err) {
    console.error('[backups] POST error:', err)
    return NextResponse.json({ error: 'Error al guardar backup' }, { status: 500 })
  }
}
