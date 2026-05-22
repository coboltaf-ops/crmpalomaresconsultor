import { NextRequest, NextResponse } from 'next/server'
import { readList, writeList } from '@/shared/lib/kv-store'

const KV_KEY = 'nova-empresa-publica'

interface EmpresaPublica {
  nombre: string
  logo_url: string
}

// GET — Información pública de la empresa (logo + nombre) para los formularios y login.
export async function GET() {
  const data = await readList<EmpresaPublica>(KV_KEY)
  const empresa = data[0] || { nombre: 'Palomares Consultor', logo_url: '' }
  // Cache fuerte: estos datos cambian muy poco
  return NextResponse.json(empresa, {
    headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' },
  })
}

// POST — Sincronizar desde el CRM admin. Recibe { nombre, logo_url }.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const empresa: EmpresaPublica = {
      nombre: String(body.nombre || '').trim() || 'Palomares Consultor',
      logo_url: String(body.logo_url || ''),
    }
    await writeList(KV_KEY, [empresa])
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al sincronizar' }, { status: 500 })
  }
}
