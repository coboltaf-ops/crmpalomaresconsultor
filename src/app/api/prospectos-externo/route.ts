import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { saveProspecto, getProspectos, initializeDB } from '@/shared/lib/turso-db'

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

    // Guardar en Turso
    try {
      console.log('💾 Guardando prospecto en Turso...')
      await initializeDB()
      const result = await saveProspecto(nuevoProspecto)
      if (result) {
        console.log('✅ Prospecto #' + nuevoProspecto.codigo + ' guardado en Turso')
      }
    } catch (err) {
      console.error('❌ Error guardando en Turso:', err)
    }

    // Enviar correo con Resend
    try {
      const resendApiKey = process.env.RESEND_API_KEY
      if (!resendApiKey) {
        console.error('❌ RESEND_API_KEY no configurada')
      } else {
        const resend = new Resend(resendApiKey)
        const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; background: #f3f4f6; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; color: white; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; line-height: 1.8; margin-bottom: 30px; }
    .greeting p { margin: 10px 0; }
    .info-box { background: linear-gradient(135deg, #f0f9ff 0%, #f3e8ff 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .info-box strong { color: #667eea; display: block; margin-bottom: 12px; }
    .info-row { margin: 8px 0; font-size: 14px; }
    .info-label { color: #6b7280; font-weight: 600; display: inline-block; width: 100px; }
    .info-value { color: #1f2937; }
    .cta-section { margin: 30px 0; text-align: center; }
    .footer { padding: 25px 30px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
    .footer p { margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Solicitud Recibida</h1>
      <p>Palomares Consultor</p>
    </div>
    <div class="content">
      <div class="greeting">
        <p>Estimado(a) <strong>${nombre} ${apellido}</strong>,</p>
        <p>Agradecemos sinceramente tu interés en nuestros servicios. Hemos recibido tu solicitud de forma exitosa y nos pondremos en contacto contigo en breve para conocer en detalle tus requerimientos.</p>
      </div>
      <div class="info-box">
        <strong>📋 Detalles de tu Solicitud</strong>
        <div class="info-row"><span class="info-label">Fecha:</span> <span class="info-value">${fechaReg}</span></div>
        <div class="info-row"><span class="info-label">Empresa:</span> <span class="info-value">${empresa || '—'}</span></div>
        <div class="info-row"><span class="info-label">Servicio:</span> <span class="info-value">${linea_interes || '—'}</span></div>
        <div class="info-row"><span class="info-label">Teléfono:</span> <span class="info-value">${nro_movil || '—'}</span></div>
      </div>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">Nuestro equipo de consultores analizará tu solicitud y te contactará a la brevedad para ofrecerte la mejor solución a tus necesidades.</p>
      <div class="cta-section">
        <p style="margin-bottom: 15px;">Si tienes preguntas inmediatas, no dudes en contactarnos directamente.</p>
      </div>
    </div>
    <div class="footer">
      <p><strong>Ing. Jose E. Palomares</strong></p>
      <p>Director - Palomares Consultor</p>
      <p style="margin-top: 15px; border-top: 1px solid #e5e7eb; padding-top: 15px;">© 2026 Palomares Consultor. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`

        console.log('📨 Sending email to:', correo.trim().toLowerCase())
        const result = await resend.emails.send({
          from: 'noreply@resend.dev',
          to: correo.trim().toLowerCase(),
          subject: 'Solicitud de Servicio Recibida',
          html,
        })
        console.log('✅ Email sent successfully:', result.data?.id || 'unknown')
      }
    } catch (emailErr) {
      console.error('❌ Error enviando email con Resend:', emailErr)
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

export async function GET() {
  try {
    await initializeDB()
    const prospectos = await getProspectos()
    console.log('📦 GET: devolviendo', prospectos.length, 'prospectos de Turso')
    return NextResponse.json({ prospectos }, { headers: corsHeaders })
  } catch (err) {
    console.error('❌ Error GET:', err)
    return NextResponse.json({ prospectos: [] }, { headers: corsHeaders })
  }
}

export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}
