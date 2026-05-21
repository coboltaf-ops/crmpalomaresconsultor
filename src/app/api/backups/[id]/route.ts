import { NextRequest, NextResponse } from 'next/server'
import { readList, writeList } from '@/shared/lib/kv-store'

interface BackupRecord {
  id: string
  fecha: string
  hora: string
  total: number
  registros: unknown[]
}

const KEY = (modulo: string) => `backups-${modulo}`

// GET /api/backups/[id]?modulo=clientes  → devuelve el backup completo (con registros)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const modulo = req.nextUrl.searchParams.get('modulo')
  if (!modulo) return NextResponse.json({ error: 'Falta modulo' }, { status: 400 })
  const all = await readList<BackupRecord>(KEY(modulo))
  const found = all.find(b => b.id === id)
  if (!found) return NextResponse.json({ error: 'Backup no encontrado' }, { status: 404 })
  return NextResponse.json(found)
}

// DELETE /api/backups/[id]?modulo=clientes
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const modulo = req.nextUrl.searchParams.get('modulo')
  if (!modulo) return NextResponse.json({ error: 'Falta modulo' }, { status: 400 })
  const all = await readList<BackupRecord>(KEY(modulo))
  const filtrados = all.filter(b => b.id !== id)
  if (filtrados.length === all.length) return NextResponse.json({ error: 'Backup no encontrado' }, { status: 404 })
  await writeList(KEY(modulo), filtrados)
  return NextResponse.json({ ok: true })
}
