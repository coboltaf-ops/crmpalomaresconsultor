import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSmtpConfig } from '@/shared/lib/smtp'
import { getFromKV, setToKV } from '@/shared/lib/kv-direct'

const KV_PROSPECTOS = 'palomares-prospectos-crm'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, empresa, correo, nro_movil, ciudad, linea_interes, descripcion_requerimiento } = body

    if (!nombre || !apellido || !correo || !descripcion_requerimiento) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400, headers: corsHeaders })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400, headers: corsHeaders })
    }

    const now = new Date()
    const fechaReg = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })

    const nuevoProspecto = {
      id: crypto.randomUUID(),
      codigo: `PRS-EXT-${Date.now()}`,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      empresa: (empresa || '').trim(),
      correo: correo.trim().toLowerCase(),
      nro_movil: (nro_movil || '').trim(),
      ciudad: (ciudad || '').trim(),
      origen_prospecto: linea_interes || 'Web',
      detalle_requerimiento: descripcion_requerimiento.trim(),
      actividad: '',
      pais: 'Colombia',
      situacion: 'Nuevo',
      fecha_registro: fechaReg,
      seguimientos: [],
    }

    // Guardar en KV (almacenamiento persistente)
    try {
      const prospectos = await getFromKV<any[]>(KV_PROSPECTOS, [])
      prospectos.push(nuevoProspecto)
      await setToKV(KV_PROSPECTOS, prospectos)
    } catch (err) {
      console.error('Error guardando en KV:', err)
    }

    // Enviar correo con Gmail SMTP
    try {
      const smtpConfig = await getSmtpConfig()
      if (smtpConfig.user && smtpConfig.pass) {
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: { user: smtpConfig.user, pass: smtpConfig.pass },
        })

        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;color:#333;margin:0;padding:0;background:#f9fafb}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}.header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;color:white}.header h1{margin:0;font-size:20px}.content{padding:30px}.greeting{margin:20px 0;line-height:1.6}.info-box{background:#f3f4f6;padding:20px;border-radius:6px;margin:20px 0}.footer{padding:20px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#999}</style></head><body><div class="container"><div class="header"><h1>Solicitud Recibida</h1><p>Palomares Consultor</p></div><div class="content"><div class="greeting"><p>Hola <strong>${nombre} ${apellido}</strong>,</p><p>Hemos recibido tu solicitud de servicio. Nos pondremos en contacto pronto para atender tu requerimiento.</p></div><div class="info-box"><strong>Detalles de tu solicitud:</strong><br>Fecha: ${fechaReg}<br>Empresa: ${empresa || '—'}<br>Servicio: ${linea_interes || '—'}</div><p>Agradecemos tu confianza.</p></div><div class="footer">© 2026 Palomares Consultor</div></div></body></html>`

        await transporter.sendMail({
          from: `"Palomares Consultor" <${smtpConfig.from_email}>`,
          to: correo.trim().toLowerCase(),
          subject: 'Solicitud de Servicio Recibida',
          html,
        })
      }
    } catch (emailErr) {
      console.error('Error enviando email:', emailErr)
    }

    return NextResponse.json({
      ok: true,
      id: nuevoProspecto.id,
      mensaje: `Gracias ${nombre}, hemos recibido tu información exitosamente.`,
    }, { headers: corsHeaders })
  } catch (err) {
    console.error('Error:', err)
    return NextResponse.json({ error: 'Error al procesar.' }, { status: 500, headers: corsHeaders })
  }
}

export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}
