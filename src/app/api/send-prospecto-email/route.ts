import { NextResponse, NextRequest } from 'next/server'
import nodemailer from 'nodemailer'
import { getSmtpConfig } from '@/shared/lib/smtp'

interface ProspectoEmailPayload {
  to: string
  nombre: string
  apellido: string
  empresa: string
  correo: string
  nro_movil: string
  origen_prospecto: string
  detalle_requerimiento: string
  ciudad: string
  codigo: string
  fecha_registro: string
}

function buildEmailHTML(data: ProspectoEmailPayload) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 24px; color: white; }
    .header h1 { margin: 0; font-size: 20px; font-weight: bold; }
    .header p { margin: 4px 0 0; opacity: 0.9; font-size: 13px; }
    .content { padding: 30px 24px; }
    .greeting { font-size: 15px; margin-bottom: 20px; line-height: 1.6; }
    .info-box { background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .info-row { display: flex; margin-bottom: 12px; font-size: 14px; }
    .info-label { font-weight: 600; width: 140px; color: #6b7280; }
    .info-value { flex: 1; color: #111827; }
    .footer { padding: 20px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
    .button { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Prospecto Registrado</h1>
      <p>Sistema de Gestión CRM Palomares Consultor</p>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Hola <strong>${data.nombre} ${data.apellido}</strong>,</p>
        <p>Gracias por ponerse en contacto con nosotros. Hemos recibido tu información como prospecto y nos pondremos en contacto pronto para atender tu requerimiento.</p>
      </div>
      <div class="info-box">
        <div class="info-row">
          <div class="info-label">Código de Prospecto:</div>
          <div class="info-value"><strong>${data.codigo}</strong></div>
        </div>
        <div class="info-row">
          <div class="info-label">Nombre:</div>
          <div class="info-value">${data.nombre} ${data.apellido}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Empresa:</div>
          <div class="info-value">${data.empresa || '—'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Correo:</div>
          <div class="info-value">${data.correo}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Teléfono:</div>
          <div class="info-value">${data.nro_movil || '—'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Origen:</div>
          <div class="info-value">${data.origen_prospecto || '—'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Ciudad:</div>
          <div class="info-value">${data.ciudad || '—'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Requerimiento:</div>
          <div class="info-value">${data.detalle_requerimiento || '—'}</div>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">
        Referencia de registro: ${data.fecha_registro}
      </p>
    </div>
    <div class="footer">
      Esto es un correo automático. Por favor no responder a este mensaje.
      <br>© 2026 Palomares Consultor - Todos los derechos reservados
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const data: ProspectoEmailPayload = await request.json()

    if (!data.to || !data.codigo) {
      return NextResponse.json({ error: 'Faltan campos requeridos (to, codigo)' }, { status: 400 })
    }

    const smtpConfig = await getSmtpConfig()

    if (!smtpConfig.user || !smtpConfig.pass) {
      return NextResponse.json(
        { error: 'Configuración SMTP incompleta' },
        { status: 500 }
      )
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    const html = buildEmailHTML(data)

    await transporter.sendMail({
      from: `"${smtpConfig.from_name || 'Palomares Consultor'}" <${smtpConfig.from_email}>`,
      to: data.to,
      subject: `Prospecto Registrado - ${data.codigo}`,
      html,
    })

    return NextResponse.json({
      success: true,
      message: `Email enviado a ${data.to}`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error enviando email de prospecto:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
