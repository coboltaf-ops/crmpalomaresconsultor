import { readList } from '@/shared/lib/kv-store'

const KV_KEY = 'nova-smtp-config'

interface SmtpConfigStored {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from_name: string
  from_email: string
}

export interface SmtpEffective {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from_name: string
  from_email: string
  source: 'kv' | 'env'
}

/**
 * Devuelve la configuración SMTP efectiva: usa la del CRM (Vercel KV) si está
 * disponible y completa; si no, cae a las variables de entorno SMTP_*.
 */
export async function getSmtpConfig(): Promise<SmtpEffective> {
  const data = await readList<SmtpConfigStored>(KV_KEY)
  const kv = data[0]
  if (kv && kv.host && kv.user && kv.pass) {
    return {
      host: kv.host,
      port: Number(kv.port) || 465,
      secure: kv.secure !== false,
      user: kv.user,
      pass: kv.pass,
      from_name: kv.from_name || '',
      from_email: kv.from_email || kv.user,
      source: 'kv',
    }
  }
  // Fallback a env vars
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: (process.env.SMTP_SECURE ?? 'true') !== 'false',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from_name: process.env.SMTP_FROM_NAME || '',
    from_email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '',
    source: 'env',
  }
}
