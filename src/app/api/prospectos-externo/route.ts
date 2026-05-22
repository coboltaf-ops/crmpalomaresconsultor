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

        // Email será configurado después con servicio adecuado
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
