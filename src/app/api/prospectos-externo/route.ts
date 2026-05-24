import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { saveProspecto, getProspectos, initializeDB } from '@/shared/lib/turso-db'

// Versión 2: Incluye logging detallado de interpolación
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('📥 Datos recibidos del formulario:', JSON.stringify(body, null, 2))

    const { nombre, apellido, empresa, correo, nro_movil, ciudad, pais, tipo_solicitud, descripcion_requerimiento } = body

    if (!nombre || !apellido || !correo || !descripcion_requerimiento) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400, headers: corsHeaders })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400, headers: corsHeaders })
    }

    const now = new Date()
    const fechaReg = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    console.log('📅 Fecha de registro:', fechaReg)

    const nuevoProspecto = {
      id: crypto.randomUUID(),
      codigo: `PRS-EXT-${Date.now()}`,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      empresa: (empresa || '').trim(),
      correo: correo.trim().toLowerCase(),
      nro_movil: (nro_movil || '').trim(),
      ciudad: (ciudad || '').trim(),
      origen_prospecto: 'Landing Page',
      tipo_solicitud: (tipo_solicitud || '').trim(),
      detalle_requerimiento: descripcion_requerimiento.trim(),
      actividad: '',
      pais: (pais || 'Colombia').trim(),
      situacion: 'Nuevo',
      fecha_registro: fechaReg,
      seguimientos: [],
    }
    console.log('✅ Prospecto creado:', JSON.stringify(nuevoProspecto, null, 2))

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
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 16px; line-height: 1.8; margin-bottom: 30px; }
    .greeting p { margin: 10px 0; }
    .info-box { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 25px 0; }
    .info-row { margin: 12px 0; font-size: 14px; }
    .info-label { color: #6b7280; font-weight: 600; display: inline-block; }
    .info-value { color: #1f2937; }
    .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .signature-name { font-weight: 600; color: #1f2937; margin-top: 10px; }
    .signature-title { font-size: 13px; color: #6b7280; line-height: 1.6; }
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
        <p>Apreciado(a) <strong>${apellido} ${nombre}</strong>,</p>
        <p style="margin-top: 20px;">Hemos recibido una solicitud de servicio. Gracias por contar con nosotros, a la brevedad posible lo atenderemos.</p>
      </div>
      <div class="info-box">
        <div class="info-row"><span class="info-label">Fecha:</span> <span class="info-value">${fechaReg || '—'}</span></div>
        <div class="info-row"><span class="info-label">Tipo de Solicitud:</span> <span class="info-value">${tipo_solicitud || '—'}</span></div>
        <div class="info-row"><span class="info-label">Su Empresa:</span> <span class="info-value">${empresa || '—'}</span></div>
        <div class="info-row"><span class="info-label">Su Teléfono:</span> <span class="info-value">${nro_movil || '—'}</span></div>
        <div class="info-row"><span class="info-label">Su Ciudad:</span> <span class="info-value">${ciudad || '—'}</span></div>
        <div class="info-row"><span class="info-label">Su País:</span> <span class="info-value">${pais || 'Colombia'}</span></div>
      </div>
      <div class="signature">
        <p style="margin: 0; color: #1f2937;">Saludos cordiales,</p>
        <p class="signature-name">Ing. Jose E. Palomares</p>
        <p class="signature-title">Consultor Sistemas de Información y Marketing<br>Especializado en desarrollo de Soluciones apoyadas con IA<br>desde SaaS Factory Mexico</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Palomares Consultor. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>`

        console.log('📨 Email a enviar:', {
          destinatario: correo.trim().toLowerCase(),
          nombre_interpolado: `${apellido} ${nombre}`,
          empresa_interpolada: empresa || 'VACÍO',
          tipo_solicitud_interpolado: tipo_solicitud || 'VACÍO',
          ciudad_interpolada: ciudad || 'VACÍO',
          pais_interpolado: pais || 'Colombia',
        })
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
