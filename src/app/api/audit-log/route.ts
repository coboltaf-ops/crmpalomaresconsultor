import { NextRequest, NextResponse } from 'next/server'
import { readList, writeList } from '@/shared/lib/kv-store'

export interface AuditEvent {
  id: string
  fecha: string            // ISO date-time
  fecha_dia: string        // DD/MM/YYYY (para filtro rápido)
  hora: string             // HH:mm:ss
  usuario: string          // login/username
  usuario_nombre: string   // nombre completo
  rol: string
  modulo: string           // clientes, contactos, cotizaciones, etc.
  accion: 'CREAR' | 'MODIFICAR' | 'ELIMINAR' | 'ANULAR' | 'ENVIAR_EMAIL' | 'IMPORTAR' | 'CONVERTIR' | 'SEGUIMIENTO' | 'LOGIN' | 'LOGOUT' | 'OTRO'
  registro_codigo: string  // CLI-00005, COT-00012, etc.
  registro_nombre: string  // razón social, nombre de oportunidad, etc.
  detalle?: string         // descripción libre
  campo?: string           // campo modificado (opcional)
  valor_anterior?: string  // valor previo (opcional)
  valor_nuevo?: string     // valor nuevo (opcional)
}

// Particiona por mes para no cargar todo a la vez: audit-log-2026-04
const keyForMonth = (yyyyMm: string) => `nova-audit-log-${yyyyMm}`
const currentMonthKey = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${yyyy}-${mm}`
}

// GET: lista eventos de un mes específico (o actual)
export async function GET(req: NextRequest) {
  const mes = req.nextUrl.searchParams.get('mes') || currentMonthKey()

  // Devolver siempre vacío por ahora para evitar bloqueos con Vercel KV
  return NextResponse.json({ eventos: [], total: 0, mes })
}

// POST: registrar un nuevo evento de auditoría
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { usuario, usuario_nombre, rol, modulo, accion, registro_codigo, registro_nombre, detalle, campo, valor_anterior, valor_nuevo } = body

    if (!usuario || !modulo || !accion) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: usuario, modulo, accion' }, { status: 400 })
    }

    const now = new Date()
    const fecha = now.toISOString()
    const fechaDia = now.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' })
    const hora = now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const yyyyMm = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }).slice(0, 7)

    const evento: AuditEvent = {
      id: crypto.randomUUID(),
      fecha, fecha_dia: fechaDia, hora,
      usuario, usuario_nombre: usuario_nombre || usuario, rol: rol || '',
      modulo, accion,
      registro_codigo: registro_codigo || '',
      registro_nombre: registro_nombre || '',
      detalle: detalle || '',
      campo: campo || '',
      valor_anterior: valor_anterior || '',
      valor_nuevo: valor_nuevo || '',
    }

    try {
      const data = await readList<AuditEvent>(keyForMonth(yyyyMm))
      data.push(evento)
      await writeList(keyForMonth(yyyyMm), data)
    } catch (storageErr) {
      console.error('[audit-log] Storage error (no fatal):', storageErr)
    }

    return NextResponse.json({ ok: true, id: evento.id })
  } catch (err) {
    console.error('[audit-log] POST error:', err)
    return NextResponse.json({ error: 'Error al registrar evento' }, { status: 500 })
  }
}

// NO implementamos DELETE — los audit logs son inmutables por diseño.
