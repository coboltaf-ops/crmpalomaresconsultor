import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getSmtpConfig } from '@/shared/lib/smtp'

const docHtml = () => `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>CRM Nova Seguridad — Documentación de Acceso y Flujos</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 32px; color: #1e293b; line-height: 1.55; }
  h1 { color: #0f1b3d; border-bottom: 3px solid #1e3a8a; padding-bottom: 10px; font-size: 26px; }
  h2 { color: #1e3a8a; margin-top: 32px; font-size: 19px; border-left: 4px solid #1e3a8a; padding-left: 10px; }
  h3 { color: #334155; font-size: 15px; margin-top: 18px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 13px; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  th { background: #f1f5f9; color: #0f172a; font-weight: 700; }
  tr:nth-child(even) td { background: #f8fafc; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; color: #b91c1c; }
  .url { color: #1e3a8a; font-weight: 600; text-decoration: none; }
  .badge { display: inline-block; background: #1e3a8a; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
  .nota { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin: 10px 0; }
  .ok { background: #d1fae5; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin: 10px 0; }
  ul { margin: 6px 0 14px 22px; } li { margin: 4px 0; }
  .header-info { background: #0f1b3d; color: #fff; padding: 18px 22px; border-radius: 10px; margin-bottom: 24px; }
  .header-info p { margin: 4px 0; font-size: 13px; opacity: 0.9; }
  .header-info h1 { color: #fff; border: none; padding: 0; margin: 0 0 6px 0; font-size: 22px; }
</style>
</head>
<body>

<div class="header-info">
  <h1>🛡️ CRM Nova Seguridad</h1>
  <p>Sistema de Gestión Comercial · Documentación de Acceso y Flujos</p>
  <p>Generado: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</p>
</div>

<h2>1. Acceso al Sistema</h2>

<h3>URLs de Producción</h3>
<table>
  <tr><th>Recurso</th><th>URL</th></tr>
  <tr><td>App principal (login)</td><td><a class="url" href="https://crmnovaseguridad.vercel.app">https://crmnovaseguridad.vercel.app</a></td></tr>
  <tr><td>Formulario público de Prospectos</td><td><a class="url" href="https://crmnovaseguridad.vercel.app/prospectos-publico">https://crmnovaseguridad.vercel.app/prospectos-publico</a></td></tr>
  <tr><td>Formulario público de PQRS</td><td><a class="url" href="https://crmnovaseguridad.vercel.app/pqrs-publico">https://crmnovaseguridad.vercel.app/pqrs-publico</a></td></tr>
</table>

<div class="ok">
  <strong>Nota:</strong> Estos enlaces son estables y siempre apuntan a la última versión productiva.
  No usar las URLs largas tipo <code>crmnovaseguridad-XXX-coboltaf...vercel.app</code> porque cambian
  con cada despliegue y tienen protección de Vercel activa.
</div>

<h3>Credenciales por defecto</h3>
<p>El sistema crea automáticamente un usuario administrador la primera vez que se inicia:</p>
<table>
  <tr><th>Usuario</th><th>Clave</th><th>Rol</th></tr>
  <tr><td><code>admin</code></td><td><code>admin</code></td><td>Admin (acceso total)</td></tr>
</table>
<div class="nota">
  <strong>Importante:</strong> Cambiar la clave del usuario admin inmediatamente al iniciar el sistema en producción.
  Los datos se persisten en localStorage del navegador.
</div>

<h2>2. Estructura del Sistema</h2>

<h3>Módulos Principales</h3>
<table>
  <tr><th>Módulo</th><th>Función</th></tr>
  <tr><td>Dashboard</td><td>Resumen ejecutivo con KPIs, gráficos de pipeline, montos por situación, prospectos por situación</td></tr>
  <tr><td>Empresas (Clientes)</td><td>Catálogo de empresas con ubicación Colombia (Región → Departamento → Municipio), código de acceso PQRS</td></tr>
  <tr><td>Contactos</td><td>Personas vinculadas a las empresas</td></tr>
  <tr><td>Oportunidades</td><td>Pipeline de ventas con etapas y valor estimado</td></tr>
  <tr><td>Productos y Servicios</td><td>Catálogo unificado con tipo (Servicio/Producto), línea de servicio y modalidad</td></tr>
  <tr><td>Cotizaciones</td><td>Cotizaciones con consecutivo independiente por línea de servicio, AIU, productos+servicios mezclados</td></tr>
  <tr><td>Contratos de Servicio</td><td>Contratos con centro de costo, pólizas RSE/Cumplimiento, situación y días de atraso</td></tr>
  <tr><td>Prospectos</td><td>Leads internos + importación desde formulario público</td></tr>
  <tr><td>PQRS</td><td>Peticiones, Quejas, Reclamos, Sugerencias con bitácora de seguimiento</td></tr>
  <tr><td>Tareas</td><td>Asignación de tareas a personal con notificación por correo</td></tr>
</table>

<h3>Módulos de Configuración</h3>
<table>
  <tr><th>Módulo</th><th>Función</th></tr>
  <tr><td>Usuarios</td><td>Gestión de usuarios y permisos por rol</td></tr>
  <tr><td>Personal Empresa</td><td>Directorio interno de empleados (alimenta selectores de Tareas)</td></tr>
  <tr><td>Líneas de Servicio</td><td>VIG, ESC, CCT, GPS, MED, CAN — cada una con prefijo de cotización, IVA y AIU por defecto</td></tr>
  <tr><td>Mi Empresa</td><td>Datos y logo de Nova Seguridad (usado en sidebar, login y PDFs)</td></tr>
  <tr><td>Referencias</td><td>Tablas maestras: tipos, situaciones, incidencias, centros de costo, etc.</td></tr>
  <tr><td>Email Marketing</td><td>Campañas masivas a clientes/prospectos</td></tr>
  <tr><td>Diseñador de Correos</td><td>Plantillas de correo personalizables</td></tr>
  <tr><td>Automatizaciones</td><td>Flujos automáticos por eventos</td></tr>
</table>

<h2>3. Flujos Clave</h2>

<h3>3.1 Captación de Prospectos</h3>
<ol>
  <li>El interesado completa el formulario público en <code>/prospectos-publico</code>.</li>
  <li>Acepta la política de tratamiento de datos (Habeas Data, Ley 1581/2012).</li>
  <li>El registro queda pendiente en la API <code>/api/prospectos-externo</code>.</li>
  <li>Recibe correo automático de confirmación.</li>
  <li>El comercial entra al módulo Prospectos y ve un banner con los nuevos pendientes.</li>
  <li>Importa individual o en lote — quedan en estado "Sin Contactar".</li>
  <li>Se les hace seguimiento desde la bitácora hasta convertirse en oportunidad.</li>
</ol>

<h3>3.2 Cotizaciones (con líneas de servicio)</h3>
<ol>
  <li>Crear nueva cotización → seleccionar <strong>Línea de Servicio</strong> (VIG, ESC, CCT, GPS, MED, CAN).</li>
  <li>El sistema asigna automáticamente el código consecutivo independiente por línea (ej: <code>COT-VIG-00012</code>, <code>COT-CCT-00007</code>).</li>
  <li>Heredar IVA y AIU por defecto desde la línea (editables).</li>
  <li>Seleccionar empresa y contacto.</li>
  <li>Por cada renglón se pregunta si es <strong>Servicio</strong> o <strong>Producto</strong>; se mezclan libremente.</li>
  <li>Cada renglón puede tener una <strong>descripción extendida</strong> (textarea expandible para alcance, condiciones, etc.).</li>
  <li>Totales calculados: Subtotal → AIU → IVA → Total General.</li>
  <li>Generar PDF, enviar por correo o WhatsApp.</li>
  <li>Bitácora de seguimiento para cambios de situación.</li>
</ol>

<h3>3.3 Contratos de Servicio</h3>
<ol>
  <li>Cuando una cotización se convierte en venta, registrar contrato en módulo Contratos.</li>
  <li>Datos generales: empresa, contacto, tipo de servicio, centro de costo (6 dígitos), ubicación.</li>
  <li>Datos del contrato: fechas inicio/fin, valor anual, valor mensual (auto-calculado = anual/12), pólizas RSE y Cumplimiento, representante legal.</li>
  <li>Estado: situación (Vigente / Por Vencer / Vencido / Suspendido / Terminado / Renovado) y días de atraso.</li>
  <li>Para renovar: copiar datos en un nuevo contrato con código nuevo y marcar el original como "Renovado".</li>
</ol>

<h3>3.4 PQRS Externas</h3>
<ol>
  <li>El cliente entra a <code>/pqrs-publico</code>, ingresa su <strong>código de acceso</strong> (generado al crear su empresa en el CRM).</li>
  <li>Selecciona tipo (Petición/Queja/Reclamo/Sugerencia), prioridad y describe la incidencia.</li>
  <li>Recibe número de radicado <code>RAD-YYYYMMDD-XXXX</code>.</li>
  <li>El operador entra al módulo PQRS, ve los radicados externos y los importa.</li>
  <li>Asigna tipo de incidencia (referencia editable) y comienza la bitácora de seguimiento.</li>
  <li>Cierra el caso cuando esté resuelto.</li>
</ol>

<h3>3.5 Tareas</h3>
<ol>
  <li>Crear tarea desde el módulo Tareas.</li>
  <li>Persona que asigna y persona que ejecuta se eligen del directorio <strong>Personal Empresa</strong>.</li>
  <li>Al guardar, el ejecutor recibe correo automático con los detalles.</li>
  <li>Vista lista o Kanban; arrastrar tarjetas para cambiar situación.</li>
</ol>

<h2>4. Líneas de Servicio (Nova Seguridad)</h2>
<table>
  <tr><th>Código</th><th>Línea</th><th>Prefijo Cotización</th><th>IVA</th><th>AIU</th></tr>
  <tr><td><code>VIG</code></td><td>Vigilancia Física</td><td>COT-VIG-</td><td>19%</td><td>10%</td></tr>
  <tr><td><code>ESC</code></td><td>Escoltas</td><td>COT-ESC-</td><td>19%</td><td>12%</td></tr>
  <tr><td><code>CCT</code></td><td>CCTV / Cámaras</td><td>COT-CCT-</td><td>19%</td><td>8%</td></tr>
  <tr><td><code>GPS</code></td><td>Rastreo Satelital</td><td>COT-GPS-</td><td>19%</td><td>8%</td></tr>
  <tr><td><code>MED</code></td><td>Medios Tecnológicos</td><td>COT-MED-</td><td>19%</td><td>8%</td></tr>
  <tr><td><code>CAN</code></td><td>Caninos</td><td>COT-CAN-</td><td>19%</td><td>10%</td></tr>
</table>

<h2>5. Cumplimiento y Seguridad</h2>
<ul>
  <li><strong>Habeas Data (Ley 1581 de 2012)</strong>: los formularios públicos exigen aceptación explícita de la política de tratamiento de datos. La aceptación se persiste en cada registro.</li>
  <li><strong>Ubicación territorial</strong>: el catálogo de empresas usa la división política oficial de Colombia (Región → Departamento → Municipio) con +1.000 municipios.</li>
  <li><strong>Persistencia</strong>: los datos viven en localStorage del navegador y en KV de Vercel para los formularios públicos.</li>
  <li><strong>Branding</strong>: logo y nombre de la empresa se cargan desde el módulo "Mi Empresa" y se aplican automáticamente en sidebar, login y PDFs.</li>
</ul>

<h2>6. Soporte</h2>
<p>Para cualquier ajuste, corrección o nueva funcionalidad, contactar al equipo de desarrollo.</p>

<hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;">
<p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
  CRM Nova Seguridad · Generado automáticamente el ${new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}
</p>

</body>
</html>`

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const to = (body?.to as string) || 'coboltaf@gmail.com'

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'SMTP no configurado en el servidor (SMTP_USER / SMTP_PASS).' }, { status: 500 })
    }

    const smtp = await getSmtpConfig()
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    })

    const html = docHtml()

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'CRM Nova Seguridad — Documentación de Acceso y Flujos',
      html,
      attachments: [
        {
          filename: 'crmnovaseguridad-acceso-flujos.html',
          content: html,
          contentType: 'text/html',
        },
      ],
    })

    return NextResponse.json({ ok: true, mensaje: `Documentación enviada a ${to}` })
  } catch (err) {
    console.error('[send-documentacion] Error:', err)
    return NextResponse.json({ error: 'Error al enviar el correo.', detalle: String(err) }, { status: 500 })
  }
}

export async function GET() {
  // Permite previsualizar el HTML directamente desde el navegador
  return new Response(docHtml(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
