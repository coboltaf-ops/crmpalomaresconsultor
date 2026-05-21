import { NextRequest, NextResponse } from 'next/server'
import { readList, writeList } from '@/shared/lib/kv-store'

const KV_KEY = 'nova-smtp-config'

export interface SmtpConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from_name: string
  from_email: string
  updated_at: string
}

const DEFAULT: SmtpConfig = {
  host: '',
  port: 465,
  secure: true,
  user: '',
  pass: '',
  from_name: '',
  from_email: '',
  updated_at: '',
}

/**
 * Lee la configuración SMTP. Pública porque se usa para mostrar la pantalla
 * (sin la contraseña en claro). El campo `pass` se devuelve enmascarado.
 */
export async function GET() {
  const data = await readList<SmtpConfig>(KV_KEY)
  const config = data[0] || DEFAULT
  return NextResponse.json({
    ...config,
    pass: config.pass ? '••••••••' : '',
    _has_password: !!config.pass,
  })
}

/**
 * Guarda la configuración SMTP. Si la contraseña recibida son bullets,
 * conserva la actual (el usuario no la cambió). Si viene vacía, la borra.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Partial<SmtpConfig>

    const actuales = await readList<SmtpConfig>(KV_KEY)
    const previo = actuales[0] || DEFAULT

    let nuevaPass = body.pass ?? ''
    // Si el usuario dejó los bullets sin modificar, no cambiar la contraseña
    if (nuevaPass === '••••••••' || nuevaPass === '****' || (nuevaPass.length > 0 && /^•+$/.test(nuevaPass))) {
      nuevaPass = previo.pass
    }

    const config: SmtpConfig = {
      host: String(body.host || '').trim(),
      port: Number(body.port) || 465,
      secure: body.secure !== false,
      user: String(body.user || '').trim(),
      pass: nuevaPass,
      from_name: String(body.from_name || '').trim(),
      from_email: String(body.from_email || '').trim(),
      updated_at: new Date().toISOString(),
    }

    await writeList(KV_KEY, [config])
    return NextResponse.json({ ok: true, updated_at: config.updated_at })
  } catch (err) {
    console.error('[smtp-config] POST error:', err)
    return NextResponse.json({ error: 'Error al guardar configuración SMTP' }, { status: 500 })
  }
}
