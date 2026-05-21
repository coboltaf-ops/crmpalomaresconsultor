'use client'
import { useEmpresaStore } from '@/features/empresa/store/empresa-store'

export default function PlanEstrategicoPage() {
  const empresa = useEmpresaStore(s => s.empresas[0])

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 18mm 16mm; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
          .doc { box-shadow: none !important; padding: 0 !important; }
          h1, h2, h3 { page-break-after: avoid; }
          table, .card { page-break-inside: avoid; }
        }
        .doc { font-family: 'Segoe UI', Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 40px; color: #1e293b; line-height: 1.55; background: #fff; }
        .doc h1 { color: #0f1b3d; font-size: 26px; margin-top: 28px; }
        .doc h2 { color: #1e3a8a; font-size: 19px; border-left: 4px solid #1e3a8a; padding-left: 10px; margin-top: 32px; }
        .doc h3 { color: #334155; font-size: 15px; margin-top: 18px; }
        .doc h4 { color: #475569; font-size: 14px; margin-top: 14px; }
        .doc table { width: 100%; border-collapse: collapse; margin: 12px 0 18px; font-size: 12.5px; }
        .doc th, .doc td { border: 1px solid #e2e8f0; padding: 7px 10px; text-align: left; }
        .doc th { background: #f1f5f9; color: #0f172a; font-weight: 700; }
        .doc tr:nth-child(even) td { background: #f8fafc; }
        .doc code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 11px; color: #b91c1c; }
        .doc .url { color: #1e3a8a; font-weight: 600; text-decoration: none; }
        .doc .badge { display: inline-block; background: #1e3a8a; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
        .doc .nota { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin: 10px 0; }
        .doc .ok { background: #d1fae5; border-left: 4px solid #10b981; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin: 10px 0; }
        .doc ul { margin: 6px 0 14px 22px; }
        .doc li { margin: 4px 0; font-size: 13px; }
        .doc .portada { text-align: center; padding: 80px 20px 120px; border-bottom: 4px solid #0f1b3d; margin-bottom: 40px; }
        .doc .portada h1 { color: #0f1b3d; font-size: 34px; border: none; padding: 0; margin: 20px 0 12px; }
        .doc .portada .subtitle { color: #1e3a8a; font-size: 18px; font-weight: 600; margin-bottom: 30px; }
        .doc .portada .meta { color: #64748b; font-size: 13px; line-height: 2; }
        .doc .portada .logo { font-size: 64px; margin-bottom: 20px; }
        .doc .fase { background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; display: inline-block; margin-right: 10px; }
        .doc .checklist { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 8px; margin: 16px 0; }
        .doc .checklist-item { padding: 4px 0; font-size: 13px; }
        .doc .toolbar { position: sticky; top: 0; background: #1e3a8a; color: #fff; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .doc .toolbar button { background: #fff; color: #1e3a8a; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 13px; }
      `}</style>

      <div className="toolbar no-print">
        <span style={{ fontWeight: 700 }}>📄 Plan Estratégico · CRM Nova Seguridad</span>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/api/plantillas-excel" style={{ background: '#fbbf24', color: '#1e1b4b', padding: '8px 18px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>📊 Plantillas Excel</a>
          <a href="/api/plan-estrategico-pdf" style={{ background: '#22c55e', color: '#fff', padding: '8px 18px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>📥 Descargar PDF</a>
          <button onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>

      <div className="doc">

        {/* PORTADA */}
        <div className="portada">
          <div className="logo">🛡️</div>
          <h1>Plan Estratégico para Iniciar nuevo CRM en {empresa?.nombre || 'NOVASEGURIDAD'}</h1>
          <p className="subtitle">Implementación del Sistema de Gestión Comercial con apoyo de Inteligencia Artificial</p>
          <div className="meta">
            <p><strong>Versión:</strong> 1.0</p>
            <p><strong>Dirigido a:</strong> Equipo directivo y operativo de Nova Seguridad</p>
          </div>
        </div>

        {/* INTRODUCCIÓN */}
        <h2>1. Introducción y Objetivo</h2>
        <p>Este documento establece el plan de trabajo estratégico para la implementación exitosa del CRM Comercial de <strong>Nova Seguridad</strong>. El objetivo es centralizar y digitalizar los procesos comerciales, operativos y de atención al cliente dentro de una única plataforma web, con trazabilidad completa, reportes en tiempo real y automatizaciones apoyadas en Inteligencia Artificial.</p>
        <p>Antes de iniciar la configuración técnica, Nova Seguridad deberá recopilar y organizar la información descrita en este plan. La calidad del resultado final depende directamente de la calidad de los datos entregados en la fase de alistamiento.</p>

        {/* URLS */}
        <h2>2. Acceso al Sistema</h2>
        <table>
          <tr><th>Recurso</th><th>URL</th></tr>
          <tr><td>App principal (login)</td><td><a className="url" href="https://crmnovaseguridad.vercel.app">https://crmnovaseguridad.vercel.app</a></td></tr>
          <tr><td>Formulario público de Prospectos</td><td><a className="url" href="https://crmnovaseguridad.vercel.app/prospectos-publico">https://crmnovaseguridad.vercel.app/prospectos-publico</a></td></tr>
          <tr><td>Formulario público de PQRS</td><td><a className="url" href="https://crmnovaseguridad.vercel.app/pqrs-publico">https://crmnovaseguridad.vercel.app/pqrs-publico</a></td></tr>
          <tr><td>Descarga de plantillas Excel</td><td><a className="url" href="/api/plantillas-excel">https://crmnovaseguridad.vercel.app/api/plantillas-excel</a></td></tr>
        </table>

        {/* FASE 0 */}
        <h2><span className="fase">FASE 0</span>Alistamiento de Información</h2>
        <p><strong>Objetivo:</strong> reunir toda la información base que el CRM necesita para operar. Sin estos datos el sistema queda vacío y la puesta en marcha se retrasa.</p>

        <h3>2.1 Ficha de la Empresa (Nova Seguridad)</h3>
        <ul>
          <li>Razón social, NIT, dirección, ciudad, país</li>
          <li>Representante legal</li>
          <li>Teléfono, correo corporativo, sitio web</li>
          <li><strong>Logo en PNG/JPG</strong> con fondo transparente (máx. 300×120 px) — se aplica en sidebar, login y PDFs</li>
          <li>Datos bancarios / facturación electrónica</li>
          <li>Licencias vigentes (Supervigilancia, SAGRILAFT, etc.)</li>
        </ul>

        <h3>2.2 Fichas de Clientes (Empresas)</h3>
        <p>Lista maestra con una fila por cliente y los siguientes campos:</p>
        <ul>
          <li>Razón social y nombre comercial</li>
          <li>NIT / Documento</li>
          <li>Dirección física</li>
          <li>Ubicación: <strong>Región → Departamento → Municipio → Ciudad/Pueblo</strong> (división política oficial de Colombia)</li>
          <li>Representante legal</li>
          <li>Actividad económica</li>
          <li>Fecha de inicio como cliente</li>
          <li>Centro de costo asignado</li>
          <li>Situación: Activo / Inactivo / Prospecto</li>
          <li>Condición de pago y moneda</li>
          <li>Observaciones relevantes del cliente</li>
        </ul>
        <div className="ok"><strong>Entregable:</strong> archivo Excel "Plantillas_NovaSeguridad.xlsx" (hoja <code>Empresas</code>) descargable desde el botón superior.</div>

        <h3>2.3 Contactos por cliente</h3>
        <p>Por cada persona con la que se tiene trato en la empresa cliente:</p>
        <ul>
          <li>Nombre y apellido</li>
          <li>Cargo</li>
          <li>Correo electrónico</li>
          <li>Teléfono móvil y fijo</li>
          <li>Nivel de influencia: Decisor / Influenciador / Usuario Final / Evaluador Técnico / Patrocinador</li>
          <li>Empresa a la que pertenece (debe coincidir con el listado de clientes)</li>
        </ul>

        <h3>2.4 Tipos de Servicios</h3>
        <p>Confirmación de las Líneas de Servicio activas y sus parámetros comerciales:</p>
        <table>
          <tr><th>Código</th><th>Línea</th><th>% IVA</th><th>% AIU</th><th>Prefijo Cotización</th></tr>
          <tr><td><code>VIG</code></td><td>Vigilancia Física</td><td>19%</td><td>10%</td><td>COT-VIG-</td></tr>
          <tr><td><code>ESC</code></td><td>Escoltas</td><td>19%</td><td>12%</td><td>COT-ESC-</td></tr>
          <tr><td><code>CCT</code></td><td>CCTV / Cámaras</td><td>19%</td><td>8%</td><td>COT-CCT-</td></tr>
          <tr><td><code>GPS</code></td><td>Rastreo Satelital</td><td>19%</td><td>8%</td><td>COT-GPS-</td></tr>
          <tr><td><code>MED</code></td><td>Medios Tecnológicos</td><td>19%</td><td>8%</td><td>COT-MED-</td></tr>
          <tr><td><code>CAN</code></td><td>Caninos</td><td>19%</td><td>10%</td><td>COT-CAN-</td></tr>
        </table>
        <div className="nota">El cliente debe confirmar si los porcentajes de IVA y AIU aplican o requieren ajuste según la normativa tributaria vigente de cada línea.</div>

        <h3>2.5 Catálogo de Productos y Servicios con precios</h3>
        <p>Lista oficial vigente con:</p>
        <ul>
          <li>Código del ítem</li>
          <li>Tipo: Servicio o Producto</li>
          <li>Línea de servicio a la que pertenece</li>
          <li>Descripción detallada</li>
          <li>Unidad de medida (Puesto/Mes, Unidad, Hora, Turno…)</li>
          <li>Precio unitario en pesos colombianos</li>
          <li>Modalidad: Único / Mensual / Anual</li>
          <li>Categoría (Vigilancia, Cámaras, Monitoreo, Instalación…)</li>
        </ul>

        <h3>2.6 Personal interno de Nova Seguridad</h3>
        <p>Directorio del equipo que usará el CRM:</p>
        <ul>
          <li>Nombre, apellido, correo corporativo, móvil</li>
          <li>Departamento interno (Comercial / Operaciones / RRHH / Gerencia)</li>
          <li>Cargo</li>
          <li>Rol en el CRM: Admin / Ventas / Soporte / Gerencia</li>
        </ul>

        <h3>2.7 Centros de Costo</h3>
        <p>Códigos de 6 dígitos con descripción. Ejemplos:</p>
        <table>
          <tr><th>Código</th><th>Descripción</th></tr>
          <tr><td><code>100001</code></td><td>Sede Principal</td></tr>
          <tr><td><code>100002</code></td><td>Sede Norte</td></tr>
          <tr><td><code>200001</code></td><td>Operaciones</td></tr>
          <tr><td><code>300001</code></td><td>Administrativo</td></tr>
        </table>

        <h3>2.8 Contratos Vigentes</h3>
        <p>Por cada contrato activo se requiere:</p>
        <ul>
          <li>Empresa cliente y contacto responsable</li>
          <li>Tipo de servicio contratado</li>
          <li>Centro de costo asignado</li>
          <li>Dirección completa del sitio donde se presta el servicio</li>
          <li>Fecha de inicio y fecha de finalización</li>
          <li>Valor anual y valor mensual del contrato</li>
          <li>Número de Póliza RSE (Responsabilidad Civil)</li>
          <li>Número de Póliza de Cumplimiento</li>
          <li>Representante legal firmante</li>
          <li>Estado actual: Vigente / Por Vencer / Vencido / Suspendido / Terminado / Renovado</li>
          <li>Días de atraso si aplica</li>
        </ul>
        <div className="nota"><strong>Crítico:</strong> este listado alimenta el sistema de alertas de vencimiento desde el día 1 de operación.</div>

        {/* FASE 1 */}
        <h2><span className="fase">FASE 1</span>Configuración Inicial</h2>
        <p><strong>Objetivo:</strong> personalizar el CRM con la marca y las reglas de negocio de Nova Seguridad.</p>

        <h3>Actividades</h3>
        <ol>
          <li>Cargar datos de "Mi Empresa" (logo, NIT, dirección, representante legal)</li>
          <li>Confirmar y ajustar las 6 Líneas de Servicio con sus IVA y AIU por defecto</li>
          <li>Cargar tablas de referencia:
            <ul>
              <li>Tipos de identificación (NIT, Cédula, etc.)</li>
              <li>Condiciones de pago (Contado, 15 días, 30 días, 60 días, 90 días)</li>
              <li>Centros de costo</li>
              <li>Tipos de servicio de contrato</li>
              <li>Tipos de incidencias PQRS</li>
              <li>Actividades económicas de clientes</li>
              <li>Situaciones por módulo</li>
            </ul>
          </li>
          <li>Crear usuarios internos y asignar roles con sus permisos correspondientes</li>
          <li>Configurar SMTP para envío de correos (Gmail con contraseña de aplicación o correo corporativo)</li>
          <li>Personalizar plantillas de correo (Bienvenida, Oferta, Cotización, Recordatorio de Pago)</li>
        </ol>

        {/* FASE 2 */}
        <h2><span className="fase">FASE 2</span>Carga de Datos Históricos</h2>
        <p><strong>Objetivo:</strong> subir al CRM la información real con la que opera Nova Seguridad actualmente.</p>

        <h3>Orden de carga (importante por dependencias)</h3>
        <ol>
          <li><strong>Personal Empresa</strong> → necesario para asignar tareas y responsables</li>
          <li><strong>Productos y Servicios</strong> → necesario para cotizar</li>
          <li><strong>Empresas (Clientes)</strong> → cada una genera su código de acceso PQRS automáticamente</li>
          <li><strong>Contactos</strong> → se vinculan a las empresas ya cargadas</li>
          <li><strong>Contratos vigentes</strong> → requiere empresas y catálogo de servicios previos</li>
          <li><strong>Oportunidades en curso</strong> (opcional) si hay negociaciones activas</li>
        </ol>

        <h3>Modalidades de carga</h3>
        <ul>
          <li><strong>Manual desde la interfaz web</strong> — recomendada para volúmenes &lt; 200 registros</li>
          <li><strong>Importación desde las plantillas Excel</strong> provistas — recomendada para volúmenes mayores</li>
          <li><strong>Integración con sistema anterior</strong> (si aplica) — a evaluar caso por caso</li>
        </ul>

        {/* FASE 3 */}
        <h2><span className="fase">FASE 3</span>Metodología Comercial Ajustada</h2>
        <p><strong>Objetivo:</strong> adaptar los flujos del CRM a la operación real de Nova Seguridad.</p>

        <h3>3.1 Metodología de Prospección de Nuevos Interesados</h3>
        <p>Definir con el cliente:</p>
        <ul>
          <li><strong>Canales de captación activos:</strong> Web, Referidos, Llamada en frío, Evento, Redes Sociales, Email</li>
          <li><strong>Formulario público</strong> en <code>/prospectos-publico</code> — decidir si se embebe en el sitio web del cliente o se comparte por redes sociales y correo</li>
          <li><strong>Flujo de contacto:</strong> prospecto llena el form → llega al CRM → comercial lo importa → lo contacta en máximo 24 horas → lo convierte en oportunidad</li>
          <li><strong>Asignación:</strong> comercial único o asignación automática por zona geográfica / línea de servicio de interés</li>
          <li><strong>Política Habeas Data</strong> a incluir en el formulario (Ley 1581 de 2012)</li>
        </ul>

        <h3>3.2 Metodología de Cotización</h3>
        <p>Elementos a definir junto con el equipo comercial:</p>
        <ul>
          <li>Entregar <strong>2 o 3 cotizaciones tipo</strong> reales (una de vigilancia, una de CCTV, una mixta) para validar el formato</li>
          <li>Política de <strong>descuentos</strong> (por volumen, por cliente VIP, por duración del contrato)</li>
          <li>Diferenciación entre cotización <strong>"express"</strong> (sin visita técnica) y <strong>"formal"</strong> (con levantamiento en sitio)</li>
          <li>Tiempo de <strong>vigencia estándar</strong> (15 días, 30 días)</li>
          <li>Condiciones de pago habituales según tipo de cliente</li>
        </ul>
        <h4>Tipos de cotización que ya soporta el CRM</h4>
        <ul>
          <li>Numeración <strong>independiente por línea de servicio</strong> (COT-VIG-00012, COT-CCT-00007, etc.)</li>
          <li>Mezcla de <strong>Servicios + Productos</strong> en la misma cotización (ej: puesto de vigilancia + cámaras + monitoreo)</li>
          <li><strong>Descripción extendida</strong> por ítem para alcance, turnos, condiciones específicas</li>
          <li>Cálculo automático de <strong>AIU + IVA + Total</strong></li>
          <li>Envío por <strong>Email, WhatsApp o PDF</strong> descargable</li>
          <li><strong>Bitácora de seguimiento</strong> con cambios de estado</li>
        </ul>

        <h3>3.3 Seguimiento de Vencimientos de Contratos</h3>
        <p>Parámetros a definir con el cliente:</p>
        <ul>
          <li><strong>Umbral "Por Vencer":</strong> cuántos días antes del fin se emite la alerta (30, 60 o 90 días)</li>
          <li><strong>Responsable de la renovación:</strong> comercial que trajo el cliente o un líder de cuenta específico</li>
          <li><strong>Automatizaciones deseadas:</strong>
            <ul>
              <li>Correo automático al cliente 60 días antes del vencimiento</li>
              <li>Tarea automática al comercial responsable</li>
              <li>Notificación en el Dashboard del ejecutivo</li>
            </ul>
          </li>
          <li><strong>Proceso de renovación:</strong> crear nuevo contrato con código consecutivo, marcar el anterior como "Renovado" para mantener histórico</li>
        </ul>

        <h3>3.4 PQRS (Peticiones, Quejas, Reclamos y Sugerencias)</h3>
        <p>Definiciones clave:</p>
        <ul>
          <li><strong>SLA de respuesta</strong> por prioridad:
            <ul>
              <li>Urgente: 2 horas</li>
              <li>Alta: 12 horas</li>
              <li>Media: 24 horas</li>
              <li>Baja: 72 horas</li>
            </ul>
          </li>
          <li><strong>Escalamiento:</strong> definir quién atiende cada tipo de incidencia</li>
          <li><strong>Tipos de incidencia</strong> típicos del sector:
            <ul>
              <li>Falla en servicio de vigilancia</li>
              <li>Inasistencia de personal</li>
              <li>Daño en equipo</li>
              <li>Robo o hurto</li>
              <li>Emergencia médica</li>
              <li>Incumplimiento de protocolo</li>
            </ul>
          </li>
          <li><strong>Códigos de acceso:</strong> al crear una empresa cliente, el CRM genera un código <code>ACC-XXXXXX</code>. Este código debe comunicarse al cliente junto con la URL <code>/pqrs-publico</code> para que pueda radicar PQRS externas.</li>
          <li><strong>Bitácora de seguimiento</strong> obligatoria por cada cambio de estado (Abierta → En Proceso → Resuelta → Cerrada)</li>
        </ul>

        {/* FASE 4 */}
        <h2><span className="fase">FASE 4</span>Capacitación y Puesta en Marcha</h2>
        <p><strong>Objetivo:</strong> equipo de Nova Seguridad operando el CRM con autonomía.</p>

        <h3>Sesión · Equipo Comercial</h3>
        <ul>
          <li>Registrar prospectos e importar desde formulario público</li>
          <li>Crear oportunidades y avanzarlas por etapa (Prospección → Calificación → Propuesta → Negociación → Cierre)</li>
          <li>Armar cotizaciones (servicios puros, productos puros, mixtas)</li>
          <li>Enviar cotización por correo / WhatsApp / generar PDF</li>
          <li>Seguimiento de prospectos y oportunidades con bitácora</li>
        </ul>

        <h3>Sesión · Equipo Operativo y Soporte</h3>
        <ul>
          <li>Registrar empresas cliente con ubicación colombiana (Región → Departamento → Municipio)</li>
          <li>Gestionar contactos por empresa</li>
          <li>Crear y hacer seguimiento a Contratos de Servicio</li>
          <li>Atender PQRS internas e importadas del formulario público</li>
          <li>Asignar tareas al personal desde el módulo Tareas</li>
        </ul>

        <h3>Sesión · Gerencia y Administración</h3>
        <ul>
          <li>Interpretar el Dashboard: KPIs, pipeline de ventas, prospectos por situación, montos estimados por situación</li>
          <li>Gestionar usuarios y permisos por rol</li>
          <li>Actualizar tablas de referencia (precios, centros de costo, tipos de servicio, incidencias)</li>
          <li>Exportar reportes para análisis externo y juntas directivas</li>
          <li>Configurar automatizaciones y plantillas de correo</li>
        </ul>

        {/* FASE 5 */}
        <h2><span className="fase">FASE 5</span>Operación y Seguimiento</h2>
        <p><strong>Objetivo:</strong> acompañar al cliente tras la puesta en marcha para asegurar adopción y realizar ajustes finos.</p>

        <h3>Actividades de seguimiento</h3>
        <ul>
          <li>Revisión de datos cargados y calidad de la información</li>
          <li>Resolución de dudas operativas del equipo</li>
          <li>Ajustes de campos y flujos según feedback real</li>
          <li>Reportes ejecutivos al cliente con: prospectos nuevos, cotizaciones emitidas, contratos firmados, PQRS abiertas/cerradas, SLA de respuesta</li>
        </ul>

        <h3>KPIs a monitorear desde el Dashboard</h3>
        <ul>
          <li>Total del pipeline de ventas ($)</li>
          <li>Número de cotizaciones emitidas por línea de servicio</li>
          <li>Tasa de conversión: prospectos → oportunidades → contratos</li>
          <li>Contratos próximos a vencer (siguientes 60 días)</li>
          <li>PQRS abiertas y cumplimiento del SLA</li>
          <li>Ingresos mensuales recurrentes estimados (suma de valor_mensual de contratos vigentes)</li>
          <li>Prospectos por situación (gráfico circular)</li>
          <li>Montos estimados por situación de oportunidades (gráfico de barras)</li>
        </ul>

        {/* CHECKLIST */}
        <h2>6. Checklist de Información Requerida</h2>
        <p>Antes de arrancar la Fase 1, Nova Seguridad debe entregar:</p>
        <div className="checklist">
          <div className="checklist-item">☐ Logo en PNG (transparente, máx. 300×120 px)</div>
          <div className="checklist-item">☐ Ficha "Mi Empresa" completa</div>
          <div className="checklist-item">☐ Excel de clientes actuales (plantilla <code>Empresas</code>)</div>
          <div className="checklist-item">☐ Excel de contactos por cliente (plantilla <code>Contactos</code>)</div>
          <div className="checklist-item">☐ Lista de precios oficial de servicios y productos (plantilla <code>Productos</code>)</div>
          <div className="checklist-item">☐ Confirmación de % AIU e IVA por línea de servicio</div>
          <div className="checklist-item">☐ Lista de centros de costo (plantilla <code>Centros_Costo</code>)</div>
          <div className="checklist-item">☐ Excel de contratos vigentes (plantilla <code>Contratos</code>)</div>
          <div className="checklist-item">☐ Directorio interno de empleados (plantilla <code>Personal</code>)</div>
          <div className="checklist-item">☐ 3 ejemplos de cotizaciones actuales en PDF</div>
          <div className="checklist-item">☐ Credenciales SMTP del correo corporativo</div>
          <div className="checklist-item">☐ Lista de tipos de incidencia PQRS propios (plantilla <code>Incidencias</code>)</div>
          <div className="checklist-item">☐ Política de Habeas Data redactada (Ley 1581 de 2012)</div>
        </div>

        {/* CIERRE */}
        <h2>7. Cierre y Alcance</h2>
        <div className="nota">
          <p style={{ margin: '4px 0', fontSize: 13 }}><strong>Nota importante:</strong> los campos específicos y los flujos operativos definitivos de cada módulo serán <strong>definidos en conjunto con los usuarios finales</strong> durante las fases de configuración y capacitación. Lo mismo aplica al <strong>alcance final</strong> de lo que se requiere implementar, el cual será refinado iterativamente a medida que el equipo de Nova Seguridad interactúe con el sistema y descubra oportunidades adicionales para aprovechar la <strong>tecnología apoyada en Inteligencia Artificial</strong> (automatizaciones, asistente conversacional, sugerencias inteligentes, análisis predictivo y generación automática de contenido).</p>
          <p style={{ margin: '12px 0 4px', fontSize: 13 }}>Este documento es un punto de partida y será actualizado a lo largo del proceso de implementación.</p>
        </div>

        {/* ANEXO A — FORMULARIO DE CONTACTOS */}
        <h2 style={{ pageBreakBefore: 'always' }}>Anexo A · Formulario de Contactos</h2>
        <p>Este formulario se usa para levantar la información de cada contacto que labora en las empresas clientes. Puede imprimirse y diligenciarse manualmente durante las visitas, o usarse como guía para capturar directamente en el CRM.</p>

        <div style={{ border: '2px solid #1e3a8a', borderRadius: 12, padding: 24, marginTop: 16, background: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '2px solid #1e3a8a' }}>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>NOVA SEGURIDAD</p>
            <h3 style={{ color: '#0f1b3d', fontSize: 18, margin: '4px 0' }}>Ficha de Contacto</h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Formulario para levantamiento de información de contactos</p>
          </div>

          <table style={{ border: 'none' }}>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, width: '30%' }}>Código (auto)</td><td>_______________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Empresa a la que pertenece *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Nombre *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Apellido *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Cargo</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Correo electrónico *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Teléfono fijo</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Celular / Móvil *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Nivel de influencia</td><td>☐ Decisor &nbsp;&nbsp; ☐ Influenciador &nbsp;&nbsp; ☐ Usuario Final &nbsp;&nbsp; ☐ Evaluador Técnico &nbsp;&nbsp; ☐ Patrocinador</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>¿Es contacto principal?</td><td>☐ Sí &nbsp;&nbsp;&nbsp;&nbsp; ☐ No</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Situación</td><td>☐ Activo &nbsp;&nbsp;&nbsp;&nbsp; ☐ Inactivo</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, verticalAlign: 'top' }}>Observaciones</td><td style={{ height: 70 }}>_________________________________________<br /><br />_________________________________________</td></tr>
          </table>

          <div style={{ display: 'flex', gap: 40, marginTop: 30, paddingTop: 20 }}>
            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: 4, textAlign: 'center', fontSize: 11 }}>
              Firma del contacto
            </div>
            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: 4, textAlign: 'center', fontSize: 11 }}>
              Registrado por (comercial)
            </div>
          </div>
        </div>

        {/* ANEXO B — FORMULARIO DE PQRS */}
        <h2 style={{ pageBreakBefore: 'always' }}>Anexo B · Formulario PQRS (Peticiones, Quejas, Reclamos y Sugerencias)</h2>
        <p>Este formulario permite al cliente radicar una PQRS. La versión digital está disponible públicamente en <a className="url" href="https://crmnovaseguridad.vercel.app/pqrs-publico">https://crmnovaseguridad.vercel.app/pqrs-publico</a> y requiere el código de acceso <code>ACC-XXXXXX</code> que se entrega al cliente al firmar el contrato.</p>

        <div style={{ border: '2px solid #1e3a8a', borderRadius: 12, padding: 24, marginTop: 16, background: '#ffffff' }}>
          <div style={{ textAlign: 'center', marginBottom: 18, paddingBottom: 14, borderBottom: '2px solid #1e3a8a' }}>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>NOVA SEGURIDAD</p>
            <h3 style={{ color: '#0f1b3d', fontSize: 18, margin: '4px 0' }}>Radicación de PQRS</h3>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Peticiones · Quejas · Reclamos · Sugerencias</p>
          </div>

          <table style={{ border: 'none' }}>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, width: '35%' }}>Radicado (auto)</td><td><code>RAD-AAAAMMDD-____</code></td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Fecha</td><td>______ / ______ / ____________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Código de Acceso del Cliente *</td><td><code>ACC-_ _ _ _ _ _</code></td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Empresa</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, verticalAlign: 'top' }}>Tipo de Incidencia *</td><td>
              ☐ 📝 Petición &nbsp;&nbsp; ☐ 😤 Queja &nbsp;&nbsp; ☐ ⚠️ Reclamo &nbsp;&nbsp; ☐ 💡 Sugerencia
            </td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, verticalAlign: 'top' }}>Incidencia específica</td><td>
              ☐ Falla en servicio de vigilancia<br />
              ☐ Inasistencia de personal<br />
              ☐ Daño en equipo<br />
              ☐ Robo o hurto<br />
              ☐ Emergencia médica<br />
              ☐ Incumplimiento de protocolo<br />
              ☐ Otra: _______________________________
            </td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Fecha del Aviso / Incidente *</td><td>______ / ______ / ____________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Hora del Aviso *</td><td>______ : ______</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Persona que Avisa *</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Móvil de quien avisa</td><td>_________________________________________</td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, verticalAlign: 'top' }}>Detalle de la Incidencia *</td><td style={{ height: 120 }}>
              _________________________________________<br /><br />
              _________________________________________<br /><br />
              _________________________________________<br /><br />
              _________________________________________
            </td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700 }}>Prioridad</td><td>
              ☐ 🟢 Baja &nbsp;&nbsp; ☐ 🟡 Media &nbsp;&nbsp; ☐ 🟠 Alta &nbsp;&nbsp; ☐ 🔴 Urgente
            </td></tr>
            <tr><td style={{ background: '#f1f5f9', fontWeight: 700, verticalAlign: 'top' }}>Autorización Habeas Data</td><td style={{ fontSize: 11 }}>
              ☐ Autorizo a Nova Seguridad el tratamiento de mis datos personales de acuerdo con la Ley 1581 de 2012 (Habeas Data) para la gestión de esta PQRS.
            </td></tr>
          </table>

          <div style={{ marginTop: 24, padding: 12, background: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
            <strong>Uso interno Nova Seguridad:</strong>
            <table style={{ border: 'none', marginTop: 8 }}>
              <tr><td style={{ fontWeight: 700, width: '35%' }}>Recibido por</td><td>_________________________</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Fecha y hora de recepción</td><td>_________________________</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Asignado a</td><td>_________________________</td></tr>
              <tr><td style={{ fontWeight: 700 }}>SLA de respuesta comprometido</td><td>_________________________</td></tr>
              <tr><td style={{ fontWeight: 700 }}>Situación</td><td>☐ Abierta &nbsp;&nbsp; ☐ En Proceso &nbsp;&nbsp; ☐ Cerrada &nbsp;&nbsp; ☐ Escalada</td></tr>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 40, marginTop: 30, paddingTop: 20 }}>
            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: 4, textAlign: 'center', fontSize: 11 }}>
              Firma de quien radica
            </div>
            <div style={{ flex: 1, borderTop: '1px solid #000', paddingTop: 4, textAlign: 'center', fontSize: 11 }}>
              Firma de quien recibe
            </div>
          </div>
        </div>

        <hr style={{ marginTop: 40, border: 'none', borderTop: '1px solid #e2e8f0' }} />
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, marginTop: 20 }}>
          {empresa?.nombre || 'Nova Seguridad'} · Plan Estratégico CRM
        </p>
      </div>
    </>
  )
}
