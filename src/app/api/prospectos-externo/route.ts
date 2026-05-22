import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSmtpConfig } from '@/shared/lib/smtp'
import { getFromKV, setToKV } from '@/shared/lib/kv-direct'

const KV_KEY = 'crm-palomares-prospectos'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

interface Prospecto {
  id: string
  nombre: string
  apellido: string
  empresa: string
  correo: string
  nro_movil: string
  ciudad: string
  linea_interes: string
  descripcion_requerimiento: string
  fecha_registro: string
  hora_registro: string
}

const readData = () => getFromKV<Prospecto[]>(KV_KEY, [])
const writeData = (data: Prospecto[]) => setToKV(KV_KEY, data)

// POST — crear nuevo prospecto y enviar email inmediatamente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, empresa, correo, nro_movil, ciudad, linea_interes, descripcion_requerimiento, acepta_datos } = body

    if (!nombre || !apellido || !correo || !descripcion_requerimiento) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400, headers: corsHeaders })
    }
    if (!acepta_datos) {
      return NextResponse.json({ error: 'Debe aceptar la política de datos.' }, { status: 400, headers: corsHeaders })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400, headers: corsHeaders })
    }

    const now = new Date()
    const fechaReg = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    const horaReg = now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' })

    const nuevo: Prospecto = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      empresa: (empresa || '').trim(),
      correo: correo.trim().toLowerCase(),
      nro_movil: (nro_movil || '').trim(),
      ciudad: (ciudad || '').trim(),
      linea_interes: linea_interes || 'Consultoría',
      descripcion_requerimiento: descripcion_requerimiento.trim(),
      fecha_registro: fechaReg,
      hora_registro: horaReg,
    }

    // 1. Guardar en BD
    try {
      const data = await readData()
      data.push(nuevo)
      await writeData(data)
    } catch (writeErr) {
      console.error('Advertencia: No se pudo guardar en storage:', writeErr)
    }

    // 2. Enviar email INMEDIATAMENTE (no esperar importación)
    try {
      const smtp = await getSmtpConfig()
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: { user: smtp.user, pass: smtp.pass },
      })

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1e3a8a;padding:20px;border-radius:10px 10px 0 0">
            <h2 style="color:#fff;margin:0;font-size:18px">Solicitud Recibida ✓</h2>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Gracias por contactarnos</p>
          </div>
          <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px">
            <p style="margin-bottom:16px;font-size:14px">Hola <strong>${nombre}</strong>,</p>
            <p style="margin-bottom:16px;font-size:14px">Hemos recibido tu solicitud exitosamente. Nuestro equipo de consultoría se pondrá en contacto contigo para discutir cómo podemos ayudarte a optimizar procesos y transformar tu empresa digitalmente.</p>
            <table style="width:100%;margin-bottom:16px;border-collapse:collapse">
              <tr><td style="color:#6b7280;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6"><strong>Nombre:</strong></td><td style="font-weight:600;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6">${nombre} ${apellido}</td></tr>
              <tr><td style="color:#6b7280;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6"><strong>Empresa:</strong></td><td style="font-weight:600;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6">${empresa || '—'}</td></tr>
              <tr><td style="color:#6b7280;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6"><strong>Teléfono:</strong></td><td style="font-weight:600;padding:8px 0;font-size:13px;border-bottom:1px solid #f3f4f6">${nro_movil || '—'}</td></tr>
            </table>
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:16px;border-left:4px solid #1e3a8a">
              <p style="color:#6b7280;font-size:11px;margin-bottom:4px;font-weight:600;text-transform:uppercase">Tu Requerimiento</p>
              <p style="font-size:13px;line-height:1.6;margin:0;color:#1f2937">${descripcion_requerimiento}</p>
            </div>
            <p style="font-size:12px;color:#9ca3af;margin:0">Tiempo de respuesta estimado: 24 horas. Si tienes preguntas, no dudes en responder este correo.</p>
          </div>
          <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:16px">Jose Enrique Palomares Tafur — Consultor en Sistemas y Transformación Digital</p>
        </div>`

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: correo,
        subject: `Solicitud Recibida — ${nombre} ${apellido}`,
        html,
      })

      console.log(`✓ Email enviado a ${correo}`)
    } catch (emailErr) {
      console.warn('⚠ Fallo al enviar email pero prospecto guardado:', emailErr)
      // No retornar error - el prospecto se guardó exitosamente
    }

    return NextResponse.json({
      ok: true,
      id: nuevo.id,
      mensaje: `Gracias ${nombre}, hemos recibido tu información exitosamente. Te hemos enviado un email de confirmación. Nuestro equipo se pondrá en contacto contigo a la brevedad.`,
    }, { headers: corsHeaders })
  } catch (err) {
    console.error('Error en prospectos-externo:', err)
    return NextResponse.json({ error: 'Error al procesar la solicitud.' }, { status: 500, headers: corsHeaders })
  }
}

// OPTIONS — manejar preflight requests de CORS
export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}
