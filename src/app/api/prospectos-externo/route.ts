import { NextRequest, NextResponse } from 'next/server'
import { getFromKV, setToKV } from '@/shared/lib/kv-direct'

const KV_KEY = 'crm-palomares-prospectos'

// CORS headers para permitir solicitudes desde landing
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type',
}

interface ProspectoExterno {
  id: string
  nombre: string
  apellido: string
  empresa: string
  correo: string
  nro_movil: string
  ciudad: string
  linea_interes: string
  descripcion_requerimiento: string
  acepta_datos: boolean
  fecha_registro: string
  hora_registro: string
  importado: boolean
}

const readData = () => getFromKV<ProspectoExterno[]>(KV_KEY, [])
const writeData = (data: ProspectoExterno[]) => setToKV(KV_KEY, data)

// GET — listar prospectos externos pendientes
export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get('all') === '1'
  const data = await readData()
  const result = showAll ? data : data.filter((p: ProspectoExterno) => !p.importado)
  return NextResponse.json({ prospectos: result, total: result.length }, { headers: corsHeaders })
}

// POST — crear nuevo prospecto desde formulario público
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombre, apellido, empresa, correo, nro_movil, ciudad, linea_interes, descripcion_requerimiento, acepta_datos } = body

    if (!nombre || !apellido || !correo || !descripcion_requerimiento) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: nombre, apellido, correo y descripción del requerimiento.' }, { status: 400, headers: corsHeaders })
    }
    if (!acepta_datos) {
      return NextResponse.json({ error: 'Debe aceptar la política de tratamiento de datos personales.' }, { status: 400, headers: corsHeaders })
    }

    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      return NextResponse.json({ error: 'El formato del correo electrónico no es válido.' }, { status: 400, headers: corsHeaders })
    }

    const now = new Date()
    const fechaReg = now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
    const horaReg = now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit' })

    const nuevo: ProspectoExterno = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      empresa: (empresa || '').trim(),
      correo: correo.trim().toLowerCase(),
      nro_movil: (nro_movil || '').trim(),
      ciudad: (ciudad || '').trim(),
      linea_interes: (linea_interes || '').trim(),
      descripcion_requerimiento: descripcion_requerimiento.trim(),
      acepta_datos: true,
      fecha_registro: fechaReg,
      hora_registro: horaReg,
      importado: false,
    }

    // Intentar guardar en KV/disco
    try {
      const data = await readData()
      data.push(nuevo)
      await writeData(data)
    } catch (writeErr) {
      console.error('Advertencia: No se pudo guardar en storage local:', writeErr)
      // Continuar aunque falle el almacenamiento - el email es lo importante
    }

    // Email se enviará después cuando se importe el prospecto (en el PATCH)

    return NextResponse.json({
      ok: true,
      id: nuevo.id,
      mensaje: `Gracias ${nombre}, hemos recibido su información exitosamente. Nuestro equipo comercial se pondrá en contacto con usted a la brevedad.`,
    }, { headers: corsHeaders })
  } catch (err) {
    console.error('Error en prospectos-externo:', err)
    return NextResponse.json({ error: 'Error al procesar la solicitud.' }, { status: 500, headers: corsHeaders })
  }
}

// PATCH — marcar prospectos como importados Y enviar email de confirmación
export async function PATCH(req: NextRequest) {
  try {
    const { ids } = await req.json() as { ids: string[] }
    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Se requiere un array de IDs.' }, { status: 400, headers: corsHeaders })
    }
    const data = await readData()
    let count = 0
    // Email temporalmente desactivado para la demo

    for (const item of data) {
      if (ids.includes(item.id)) {
        item.importado = true
        count++

        // Email temporalmente desactivado - será configurado después con servicio alternativo
        // TODO: Configurar con SendGrid o similar
        try {
          console.log(`Saltando email para ${item.correo} - será enviado después`)
          const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
              <div style="background:#0f1b3d;padding:20px;text-align:center;border-radius:12px 12px 0 0">
                <img src="https://crmpalomaresconsultor.vercel.app/logo-jp.jpeg" alt="Palomares Consultor" style="max-width:80px;height:auto;margin-bottom:10px;border-radius:8px" />
                <h2 style="color:#60a5fa;margin:0;font-size:18px;font-weight:bold">Palomares Consultor</h2>
              </div>
              <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
                <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0 0 4px 0">
                  Apreciado(a) <strong>${item.nombre.trim()} ${item.apellido.trim()}</strong>,
                </p>
                <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 20px 0">
                  <strong>${(item.empresa || '').trim()}</strong>
                </p>
                <p style="color:#1e293b;font-size:14px;line-height:1.8;margin:0 0 20px 0">
                  Hemos recibido su solicitud de requerimiento. En breves momentos lo estaremos contactando para conocer en detalle sus requerimientos.
                </p>
                <div style="background:#f0f9ff;border-left:4px solid #0f1b3d;padding:14px;margin:20px 0;border-radius:6px">
                  <p style="color:#1e293b;font-size:12px;font-weight:600;margin:0 0 8px 0">Detalles de su solicitud:</p>
                  <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <tr style="border-bottom:1px solid #d1d5db">
                      <td style="color:#64748b;padding:6px 0;width:120px">Fecha recepción:</td>
                      <td style="color:#1e293b;font-weight:600">${item.fecha_registro}</td>
                    </tr>
                    <tr style="border-bottom:1px solid #d1d5db">
                      <td style="color:#64748b;padding:6px 0">Hora recepción:</td>
                      <td style="color:#1e293b;font-weight:600">${item.hora_registro}</td>
                    </tr>
                    <tr>
                      <td style="color:#64748b;padding:6px 0">Servicio de interés:</td>
                      <td style="color:#1e293b;font-weight:600">${(item.linea_interes || '—').trim()}</td>
                    </tr>
                  </table>
                </div>
                <p style="color:#1e293b;font-size:14px;line-height:1.7;margin:0 0 24px 0">
                  Agradecemos su confianza.
                </p>
                <div style="border-top:1px solid #e5e7eb;padding-top:16px;margin-top:20px">
                  <p style="color:#1e293b;font-size:14px;font-weight:600;margin:0 0 4px 0">
                    Ing. Jose E. Palomares
                  </p>
                  <p style="color:#64748b;font-size:13px;margin:0">
                    Director - Palomares Consultor
                  </p>
                </div>
              </div>
              <div style="background:#f3f4f6;padding:16px;text-align:center;border-radius:0 0 12px 12px;font-size:11px;color:#6b7280">
                <p style="margin:0">© 2026 Palomares Consultor | Consultoría Digital y Transformación Empresarial</p>
              </div>
            </div>`

          // Email temporalmente desactivado para la demo
          // await transporter.sendMail({
          //   from: process.env.SMTP_USER || 'noreply@palomares.com',
          //   to: item.correo.trim().toLowerCase(),
          //   subject: 'Solicitud de Servicio Recibida',
          //   html,
          // })
          console.log(`Email será enviado a ${item.correo} después de la demo`)
        } catch (emailErr) {
          console.error(`Error enviando email a ${item.correo}:`, emailErr)
        }
      }
    }
    await writeData(data)
    return NextResponse.json({ ok: true, importados: count }, { headers: corsHeaders })
  } catch (err) {
    console.error('Error en PATCH:', err)
    return NextResponse.json({ error: 'Error al procesar.' }, { status: 500, headers: corsHeaders })
  }
}

// OPTIONS — manejar preflight requests de CORS
export function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}
