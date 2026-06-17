import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@libsql/client'

const PRESERVE = ['referencias', 'usuarios', 'desarrolladores', 'segmentos', 'mercados']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    })

    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    const allTables = (result.rows as any[]).map(r => r.name)
    const toDelete = allTables.filter(t => !PRESERVE.includes(t))

    const deleted = []
    for (const table of toDelete) {
      const count = await db.execute(`SELECT COUNT(*) as cnt FROM ${table}`)
      const rows = (count.rows[0] as any).cnt
      await db.execute(`DELETE FROM ${table}`)
      deleted.push({ table, rows })
    }

    res.json({ ok: true, deleted, message: 'Limpieza completada' })
  } catch (err) {
    res.status(500).json({ error: (err as any).message })
  }
}
