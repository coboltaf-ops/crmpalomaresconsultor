// Genera el PDF "Recomendaciones para optar por un nuevo CRM apoyado por IA"
// dirigido al Gerente General Marco Arias de Nova Seguridad.
// Mismo formato que el documento de SPIN, adaptado a paleta corporativa
// azul oscuro de Nova Seguridad.

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const OUT_PDF = path.resolve(__dirname, '../public/docs/Recomendaciones-CRM-IA-Marco-Arias-NovaSeguridad.pdf')
const LOGO_PATH = path.resolve(__dirname, '../public/logo-novasep.png')

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

// Logo embebido como data URI para que el PDF sea autocontenido
const LOGO_DATA_URI = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`

// Paleta corporativa mixta: azul oscuro (estructura) + rojo granate Novasep (acentos)
const PALETTE = {
  primary: '#1e3a8a',      // azul oscuro corporativo (estructura, títulos, tablas)
  secondary: '#B91C1C',    // rojo granate Novasep (acentos estratégicos)
  dark: '#0f1b3d',         // azul muy oscuro
  accent: '#dc2626',       // rojo vivo para detalles puntuales
  light: '#dbeafe',        // azul claro
  ink: '#1f2937',          // gris muy oscuro para texto
  mute: '#6b7280',         // gris medio texto secundario
  panelBg: '#eff6ff',      // fondo de panel info (azul muy claro)
  panelBorder: '#1e3a8a',
  alertBg: '#fef2f2',      // fondo alerta (rosado claro Novasep)
  alertBorder: '#B91C1C',  // borde alerta en rojo Novasep
}

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Recomendaciones CRM con IA — Nova Seguridad</title>
<style>
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: 'Georgia', 'Times New Roman', serif; color: ${PALETTE.ink}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-size: 11pt; line-height: 1.55; }

  /* ====== Layout base de cada página ====== */
  .page { width: 8.5in; min-height: 11in; padding: 0.85in 0.8in 1.05in 0.8in; position: relative; page-break-after: always; background: #ffffff; }
  .page:last-child { page-break-after: auto; }

  .topbar { position: absolute; top: 0; left: 0; right: 0; height: 0.45in; background: ${PALETTE.primary}; }
  .botbar { position: absolute; bottom: 0; left: 0; right: 0; height: 0.45in; background: ${PALETTE.primary}; }
  .botbar-thin { position: absolute; bottom: 0.4in; left: 0.8in; right: 0.8in; height: 1px; background: ${PALETTE.primary}; opacity: 0.4; }
  .footer { position: absolute; bottom: 0.55in; left: 0.8in; right: 0.8in; display: flex; justify-content: space-between; font-size: 9pt; color: ${PALETTE.primary}; font-weight: 700; font-family: 'Helvetica', 'Arial', sans-serif; }

  /* ====== Cover ====== */
  .cover { text-align: center; padding-top: 0.25in; }
  .cover .logo-box { display: block; width: max-content; padding: 16px 28px; margin: 0.15in auto 0.15in auto; border: 2px solid ${PALETTE.primary}; border-radius: 14px; background: #fff; }
  .cover .logo-box img { display: block; width: 280px; height: auto; }
  .cover .logo-url { font-size: 8.5pt; color: ${PALETTE.mute}; margin-top: 8px; font-family: 'Helvetica', 'Arial', sans-serif; letter-spacing: 0.4px; }
  .cover .badge { display: inline-block; background: ${PALETTE.secondary}; color: #fff; padding: 7px 16px; border-radius: 8px; font-size: 9pt; font-weight: 700; letter-spacing: 1.2px; font-family: 'Helvetica', 'Arial', sans-serif; margin: 0.1in 0 0.18in 0; }
  .cover h1 { font-size: 20pt; font-weight: 800; color: ${PALETTE.primary}; margin: 0 0.4in 0.1in 0.4in; line-height: 1.22; }
  .cover h1 .accent { color: ${PALETTE.secondary}; }
  .cover .empresa-name { font-size: 13pt; color: ${PALETTE.secondary}; font-style: italic; font-weight: 700; margin-top: 0.15in; }
  .cover .empresa-sub { font-size: 10pt; color: ${PALETTE.mute}; margin-top: 3px; }
  .cover .divider { width: 220px; height: 1px; background: ${PALETTE.primary}; margin: 0.2in auto 0.12in auto; opacity: 0.5; }
  .cover .label { font-size: 9pt; letter-spacing: 1.5px; color: ${PALETTE.primary}; font-weight: 700; font-family: 'Helvetica', 'Arial', sans-serif; }
  .cover .author { font-size: 14pt; font-weight: 800; color: ${PALETTE.ink}; margin-top: 6px; }
  .cover .author-role { font-size: 9.5pt; color: ${PALETTE.mute}; font-style: italic; margin-top: 3px; }
  .cover .dirigido-name { font-size: 12pt; font-weight: 800; color: ${PALETTE.primary}; margin-top: 5px; }
  .cover .dirigido-role { font-size: 9pt; color: ${PALETTE.mute}; font-style: italic; margin-top: 1px; }
  .cover .place-date { font-size: 10pt; color: ${PALETTE.ink}; font-weight: 700; margin-top: 0.18in; }

  /* ====== Page header reusable ====== */
  .ph-logo { display: flex; align-items: center; gap: 10px; }
  .ph-logo img { width: 130px; height: auto; display: block; }
  .ph-logo .ph-sub { font-size: 7.5pt; color: ${PALETTE.mute}; }
  .pageheader { position: absolute; top: 0.55in; left: 0.8in; right: 0.8in; display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 8px; border-bottom: 2px solid ${PALETTE.primary}; }
  .pageheader .right { font-size: 9pt; font-weight: 700; color: ${PALETTE.primary}; font-family: 'Helvetica', 'Arial', sans-serif; letter-spacing: 0.5px; text-transform: uppercase; text-align: right; }

  .content { margin-top: 0.55in; }

  /* ====== Headings ====== */
  h2.section { font-size: 18pt; color: ${PALETTE.primary}; font-weight: 800; padding-left: 14px; border-left: 6px solid ${PALETTE.primary}; margin: 0 0 18px 0; line-height: 1.2; }
  h3 { font-size: 13pt; color: ${PALETTE.primary}; font-weight: 700; margin: 18px 0 10px 0; }
  h4 { font-size: 11.5pt; color: ${PALETTE.primary}; font-weight: 700; margin: 14px 0 8px 0; }

  p { margin: 0 0 11px 0; text-align: justify; }
  strong { color: ${PALETTE.primary}; }
  em.muted { color: ${PALETTE.mute}; font-style: italic; }

  /* ====== Panels ====== */
  .panel-info { background: ${PALETTE.panelBg}; border-left: 4px solid ${PALETTE.primary}; padding: 14px 18px; margin: 14px 0; border-radius: 0 6px 6px 0; }
  .panel-info p { margin: 0; font-style: italic; color: ${PALETTE.ink}; }
  .panel-alert { background: ${PALETTE.alertBg}; border-left: 4px solid ${PALETTE.alertBorder}; padding: 14px 18px; margin: 14px 0; border-radius: 0 6px 6px 0; }
  .panel-alert p { margin: 0; color: ${PALETTE.ink}; }
  .panel-quote { background: #f8fafc; border-left: 4px solid ${PALETTE.secondary}; padding: 14px 18px; margin: 14px 0; font-style: italic; color: ${PALETTE.ink}; border-radius: 0 6px 6px 0; }
  .panel-quote .quote-author { display: block; margin-top: 8px; text-align: right; font-size: 9.5pt; color: ${PALETTE.mute}; font-style: normal; font-weight: 700; }

  /* ====== Cards row ====== */
  .cards { display: flex; gap: 12px; margin: 12px 0 16px 0; }
  .card { flex: 1; border: 1.5px solid ${PALETTE.primary}; border-radius: 10px; padding: 14px; min-height: 110px; }
  .card .ico { font-size: 22pt; display: block; margin-bottom: 6px; }
  .card .ctitle { font-weight: 800; color: ${PALETTE.primary}; font-size: 11.5pt; margin-bottom: 4px; }
  .card p { margin: 0; font-size: 10pt; line-height: 1.45; }

  /* ====== Table ====== */
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt; }
  table th { background: ${PALETTE.primary}; color: #fff; text-align: left; padding: 9px 11px; font-weight: 700; font-family: 'Helvetica', 'Arial', sans-serif; }
  table td { padding: 9px 11px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  table tr:nth-child(even) td { background: #f8fafc; }
  table td strong { color: ${PALETTE.primary}; }

  /* ====== Lists ====== */
  ul.checks { list-style: none; padding: 0; margin: 10px 0; }
  ul.checks li { padding: 6px 0 6px 26px; position: relative; }
  ul.checks li::before { content: '✓'; position: absolute; left: 6px; color: ${PALETTE.primary}; font-weight: 800; }
  ul.areas { list-style: none; padding: 0; margin: 10px 0; column-count: 2; column-gap: 30px; }
  ul.areas li { padding: 5px 0 5px 22px; position: relative; break-inside: avoid; }
  ul.areas li::before { content: '✓'; position: absolute; left: 0; color: ${PALETTE.primary}; font-weight: 800; }

  /* ====== TOC ====== */
  .toc { border: 1.5px solid ${PALETTE.primary}; border-radius: 12px; padding: 18px 22px; margin-top: 16px; }
  .toc-item { display: flex; align-items: center; gap: 14px; padding: 8px 0; border-bottom: 1px dotted #cbd5e1; font-size: 10.5pt; }
  .toc-item:last-child { border-bottom: none; }
  .toc-num { width: 30px; height: 30px; background: ${PALETTE.primary}; color: #fff; font-weight: 800; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; flex-shrink: 0; }
  .toc-text { flex: 1; color: ${PALETTE.ink}; font-weight: 600; }

  /* ====== Diagram ====== */
  .diagram { border: 1.5px solid ${PALETTE.primary}; border-radius: 10px; margin: 14px 0; overflow: hidden; }
  .diagram-title { background: linear-gradient(90deg, ${PALETTE.primary} 0%, ${PALETTE.secondary} 100%); color: #fff; font-weight: 700; font-size: 9.5pt; letter-spacing: 1px; padding: 10px 16px; font-family: 'Helvetica', 'Arial', sans-serif; }
  .diagram-body { padding: 22px 18px; background: #fff; }
  .diagram-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .diagram-node { flex: 0 0 auto; padding: 12px 14px; border-radius: 8px; text-align: center; font-size: 9.5pt; line-height: 1.3; min-width: 110px; color: #ffffff; }
  .diagram-node small { color: rgba(255,255,255,0.85); }
  .diagram-node strong { color: #ffffff; }
  .diagram-node.start { background: ${PALETTE.dark}; color: #fff; }
  .diagram-node.center { background: ${PALETTE.secondary}; color: #ffffff; font-weight: 800; }
  .diagram-node.end { background: ${PALETTE.primary}; color: #fff; }
  .diagram-arrow { flex: 1; height: 2px; background: ${PALETTE.primary}; position: relative; min-width: 30px; }
  .diagram-arrow::after { content: ''; position: absolute; right: -2px; top: -5px; width: 0; height: 0; border-left: 8px solid ${PALETTE.primary}; border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
  .diagram-col { display: flex; flex-direction: column; gap: 8px; flex: 0 0 auto; }
  .diagram-label { text-align: center; font-size: 8.5pt; color: ${PALETTE.mute}; font-style: italic; margin: 6px 0; }

  /* ====== Timeline ====== */
  .timeline { display: flex; align-items: flex-start; justify-content: space-between; margin: 18px 0; padding: 12px 0; position: relative; }
  .timeline::before { content: ''; position: absolute; top: 28px; left: 6%; right: 6%; height: 2px; background: ${PALETTE.primary}; z-index: 0; }
  .tl-step { flex: 1; text-align: center; position: relative; z-index: 1; }
  .tl-circle { width: 36px; height: 36px; border-radius: 50%; background: ${PALETTE.secondary}; color: #ffffff; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13pt; margin: 0 auto 8px auto; border: 3px solid ${PALETTE.primary}; }
  .tl-label { font-size: 9pt; font-weight: 700; color: ${PALETTE.primary}; font-family: 'Helvetica', 'Arial', sans-serif; letter-spacing: 0.3px; }
  .tl-desc { font-size: 8.5pt; color: ${PALETTE.mute}; margin-top: 4px; line-height: 1.35; padding: 0 4px; }

  /* ====== Closing card ====== */
  .signature-box { border: 1.5px solid ${PALETTE.primary}; border-radius: 12px; padding: 26px 30px; margin-top: 28px; }
  .sig-line { width: 220px; height: 1.5px; background: ${PALETTE.ink}; margin-bottom: 6px; }
  .sig-name { font-size: 15pt; font-weight: 800; color: ${PALETTE.ink}; }
  .sig-role { font-size: 10pt; color: ${PALETTE.mute}; font-style: italic; margin-top: 3px; }
  .sig-org { font-size: 10pt; color: ${PALETTE.primary}; font-weight: 700; letter-spacing: 1px; margin-top: 8px; font-family: 'Helvetica', 'Arial', sans-serif; }
  .sig-date { font-size: 10pt; color: ${PALETTE.primary}; font-weight: 700; margin-top: 4px; }
  .confidential { border: 1.5px dashed ${PALETTE.primary}; border-radius: 8px; padding: 12px 18px; margin-top: 18px; text-align: center; font-size: 9.5pt; background: ${PALETTE.panelBg}; }
  .confidential strong { color: ${PALETTE.primary}; }

  /* ====== Anti-orphan ====== */
  h2.section, h3, h4 { break-after: avoid; }
  .panel-info, .panel-alert, .panel-quote, .card, .diagram, table, .timeline { break-inside: avoid; }
</style>
</head>
<body>

<!-- ===================== COVER ===================== -->
<div class="page cover">
  <div class="topbar"></div>
  <div class="botbar"></div>

  <div class="logo-box">
    <img src="${LOGO_DATA_URI}" alt="Novasep · Innovación en Seguridad" />
    <div class="logo-url">novaseguridad.com.co</div>
  </div>

  <span class="badge">DOCUMENTO EJECUTIVO CONFIDENCIAL</span>

  <h1>Recomendaciones para Optar por un<br/>
  <span class="accent">Nuevo CRM Apoyado por Inteligencia Artificial</span><br/>
  en Reemplazo del CRM vTiger</h1>

  <div class="empresa-name">Nova Seguridad</div>
  <div class="empresa-sub">novaseguridad.com.co</div>

  <div class="divider"></div>

  <div class="label">DIRIGIDO A</div>
  <div class="dirigido-name">Sr. Marco Arias</div>
  <div class="dirigido-role">Director General · Nova Seguridad</div>
  <div class="dirigido-name" style="margin-top:10px;">Sr. Juan Pablo Ramírez</div>
  <div class="dirigido-role">Director Administrativo y Financiero · Nova Seguridad</div>

  <div class="divider"></div>

  <div class="label">PRESENTADO POR</div>
  <div class="author">Ing. José E. Palomares</div>
  <div class="author-role">Consultor Sistemas de Información y Marketing<br/>Especialista en Desarrollos con apoyo de IA</div>

  <div class="divider"></div>

  <div class="place-date">Medellín · 15 de mayo de 2026</div>
</div>

<!-- ===================== TOC ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo">
      <img src="${LOGO_DATA_URI}" alt="Novasep" />
    </div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">Contenido del Documento</h2>
    <p>El presente documento expone, en lenguaje claro y sencillo, las recomendaciones para que <strong>Nova Seguridad</strong> opte por la implementación de un <strong>nuevo CRM apoyado por Inteligencia Artificial</strong>, diseñado a la medida del proceso comercial actual, en reemplazo del CRM vTiger que la organización viene utilizando.</p>

    <div class="toc">
      <div class="toc-item"><span class="toc-num">1</span><span class="toc-text">Introducción — Lo más importante: su tranquilidad y seguridad</span></div>
      <div class="toc-item"><span class="toc-num">2</span><span class="toc-text">Mi misión — Optimizar costos del proceso comercial con apoyo de SaaS Factory</span></div>
      <div class="toc-item"><span class="toc-num">3</span><span class="toc-text">Por qué reemplazar vTiger — Las razones operativas y económicas</span></div>
      <div class="toc-item"><span class="toc-num">4</span><span class="toc-text">¿Qué es SaaS Factory? La fábrica de desarrollo en México</span></div>
      <div class="toc-item"><span class="toc-num">5</span><span class="toc-text">Las herramientas de Inteligencia Artificial al servicio de Nova Seguridad</span></div>
      <div class="toc-item"><span class="toc-num">6</span><span class="toc-text">Lo que ya está diseñado: módulos del CRM y formularios públicos</span></div>
      <div class="toc-item"><span class="toc-num">7</span><span class="toc-text">Sus datos en infraestructura de alto nivel — replicación y respaldos</span></div>
      <div class="toc-item"><span class="toc-num">8</span><span class="toc-text">Cumplimiento de Habeas Data — Ley 1581 de 2012</span></div>
      <div class="toc-item"><span class="toc-num">9</span><span class="toc-text">Respaldos semanales adicionales — equipo local y/o Google Drive</span></div>
      <div class="toc-item"><span class="toc-num">10</span><span class="toc-text">El plan de empoderamiento — una persona de Nova Seguridad al lado del consultor</span></div>
      <div class="toc-item"><span class="toc-num">11</span><span class="toc-text">Modelo API — integración con otros sistemas</span></div>
      <div class="toc-item"><span class="toc-num">12</span><span class="toc-text">Análisis de Costos y Convenio Propuesto — Actuales vs. CRM con IA</span></div>
      <div class="toc-item"><span class="toc-num">13</span><span class="toc-text">Compromiso final y palabras de cierre</span></div>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 1</span></div>
</div>

<!-- ===================== 1. INTRODUCCIÓN ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">1. Introducción — Lo más importante: su tranquilidad y seguridad</h2>
    <p style="text-align:right; color:${PALETTE.primary}; font-weight:700; font-size:10pt;">Medellín, 15 de mayo de 2026</p>

    <p><strong>Apreciados Señores,</strong></p>
    <p>Sr. Marco Arias — Director General de Nova Seguridad<br/>Sr. Juan Pablo Ramírez — Director Administrativo y Financiero de Nova Seguridad</p>
    <p>Reciban un cordial y respetuoso saludo. El presente documento contiene las <strong>recomendaciones formales</strong> para que Nova Seguridad opte por la implementación de un <strong>nuevo CRM apoyado por Inteligencia Artificial</strong>, en reemplazo del CRM vTiger que la organización utiliza actualmente.</p>

    <div class="panel-info">
      <p>Antes de entrar en detalle, permítanme decirles con total franqueza: <strong>la decisión de cambiar de plataforma es una de las más sensibles que la dirección de una empresa puede tomar.</strong> Por eso he construido este documento con un único propósito: que ustedes tengan absoluta certeza de que el cambio será beneficioso, seguro y reversible en cualquier momento.</p>
    </div>

    <p>Lo más importante en cualquier desarrollo que <strong>SaaS Factory</strong> entrega a sus clientes —y muy especialmente a Nova Seguridad— es que el cliente esté <strong>tranquilo y seguro de que la infraestructura funcionará siempre</strong>. Sin interrupciones, sin pérdidas de información, sin sorpresas desagradables. Esa es la esencia de nuestro trabajo, y sobre ese pilar se construye todo lo que aquí le voy a explicar.</p>

    <h3>Lo que este documento le va a demostrar</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">🛡️</span>
        <div class="ctitle">Seguridad permanente</div>
        <p>Sus datos comerciales estarán resguardados en infraestructura de alto nivel, con replicación automática en servidores profesionales y cumplimiento de la Ley de Habeas Data.</p>
      </div>
      <div class="card">
        <span class="ico">💾</span>
        <div class="ctitle">Respaldos en su poder</div>
        <p>Nova Seguridad tendrá copias semanales en un equipo local de la oficina y/o en un Google Drive corporativo asignado para esa acción.</p>
      </div>
    </div>

    <div class="cards">
      <div class="card">
        <span class="ico">👥</span>
        <div class="ctitle">Empoderamiento del equipo</div>
        <p>Estoy dispuesto a entrenar a una persona de Nova Seguridad para que aprenda la estructura, la forma de programar y todo el modelo de desarrollo.</p>
      </div>
      <div class="card">
        <span class="ico">🤖</span>
        <div class="ctitle">IA de última generación</div>
        <p>Su CRM se construye con las herramientas más avanzadas del mundo: Claude 4.7, GPT-5, Gemini 2.5, Vercel AI Gateway y más.</p>
      </div>
    </div>

    <p>El propósito final es muy claro: <strong>que Nova Seguridad reemplace vTiger por una plataforma moderna, ágil, segura y de costo operativo notablemente menor</strong>, y que llegue el día en que la organización pueda continuar y hasta desarrollar nuevos aplicativos por sí misma, gracias a la formación que reciba de mi parte.</p>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 2</span></div>
</div>

<!-- ===================== 2. MI MISIÓN ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">2. Mi misión — Optimizar costos del proceso comercial con apoyo de SaaS Factory</h2>

    <div class="panel-info">
      <p>Mi misión profesional con Nova Seguridad es <strong>bajar los costos operativos actuales en la ejecución del proceso comercial</strong>, adecuándolo a las necesidades reales de hoy y aprovechando todas las herramientas que SaaS Factory pone a disposición para desarrollos rápidos, seguros y de alta calidad.</p>
    </div>

    <h3>¿Qué significa "bajar costos operativos" en términos concretos?</h3>
    <p>Significa que Nova Seguridad obtendrá un CRM que <strong>responde exactamente a su forma de vender, hacer seguimiento, atender clientes y manejar PQRS</strong>, sin pagar por funcionalidades genéricas que no usa, sin depender de actualizaciones de terceros que rompen el sistema, y sin las limitaciones inherentes a plataformas como vTiger que no están diseñadas para el modelo operativo colombiano de empresas de vigilancia y seguridad privada.</p>

    <h3>Tres ejes de optimización</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">💰</span>
        <div class="ctitle">Costo de licenciamiento</div>
        <p>Eliminación del costo recurrente de licencias y módulos premium de plataformas comerciales como vTiger.</p>
      </div>
      <div class="card">
        <span class="ico">⚡</span>
        <div class="ctitle">Costo de tiempo</div>
        <p>Procesos comerciales más rápidos: cotizaciones, seguimientos, PQRS y reportes ejecutivos automatizados con IA.</p>
      </div>
      <div class="card">
        <span class="ico">🎯</span>
        <div class="ctitle">Costo de errores</div>
        <p>Reducción drástica de errores operativos al eliminar la doble digitación y los formularios manuales tradicionales.</p>
      </div>
    </div>

    <div class="panel-alert">
      <p><strong>Nota importante:</strong> Al final de este documento ustedes tendrán a la vista los <strong>costos actuales</strong> que la organización viene asumiendo en su modelo comercial vigente, contrastados con los <strong>nuevos costos del CRM ofrecido</strong>, de modo que la decisión se tome sobre cifras y beneficios concretos.</p>
    </div>

    <h3>Herramientas de SaaS Factory que hacen esto posible</h3>
    <p>El cambio de paradigma es radical. Hoy, gracias a la <strong>combinación de un consultor humano experto con las herramientas de IA más avanzadas del mundo</strong>, podemos construir un CRM corporativo en una fracción del tiempo y del costo que hace apenas dos años hubiera requerido. Esa es exactamente la diferencia que Nova Seguridad va a recibir.</p>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 3</span></div>
</div>

<!-- ===================== 3. POR QUÉ REEMPLAZAR vTIGER ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">3. Por qué reemplazar vTiger — Las razones operativas y económicas</h2>

    <div class="panel-info">
      <p>vTiger es una plataforma de código abierto valiosa que cumplió su rol en una época, pero <strong>fue diseñada como una solución genérica para múltiples industrias</strong>, no para el modelo operativo específico de una empresa colombiana de seguridad privada como Nova Seguridad.</p>
    </div>

    <h3>Las limitaciones que hoy enfrenta Nova Seguridad con vTiger</h3>

    <table>
      <thead><tr><th style="width:35%;">Limitación</th><th>Impacto operativo</th></tr></thead>
      <tbody>
        <tr><td><strong>Adaptación al negocio</strong></td><td>Los campos, flujos y reportes no reflejan el día a día de una empresa de vigilancia y seguridad privada en Colombia.</td></tr>
        <tr><td><strong>Costos de licencias</strong></td><td>Pago recurrente por módulos premium que Nova Seguridad no necesariamente utiliza al 100 %.</td></tr>
        <tr><td><strong>Velocidad de cambios</strong></td><td>Cualquier ajuste al sistema requiere desarrolladores externos, costos adicionales y semanas de espera.</td></tr>
        <tr><td><strong>Integración con IA</strong></td><td>vTiger no fue concebido para aprovechar las capacidades de la Inteligencia Artificial generativa actual.</td></tr>
        <tr><td><strong>Formularios públicos</strong></td><td>Limitaciones para crear formularios externos de captura de Prospectos y PQRS con la imagen corporativa de Nova Seguridad.</td></tr>
        <tr><td><strong>Cumplimiento Habeas Data</strong></td><td>La adaptación a los requerimientos específicos de la Ley 1581 colombiana exige personalizaciones costosas.</td></tr>
      </tbody>
    </table>

    <h3>Lo que Nova Seguridad recibirá a cambio</h3>

    <ul class="checks">
      <li>Un CRM diseñado <strong>exactamente</strong> al proceso comercial de Nova Seguridad.</li>
      <li>Cambios y ajustes en <strong>cuestión de días</strong>, no semanas ni meses.</li>
      <li>Integración nativa con <strong>Claude 4.7, GPT-5 y Gemini 2.5</strong> para reportes ejecutivos, análisis y comunicaciones automatizadas.</li>
      <li><strong>Formularios públicos</strong> de Prospectos y PQRS ya diseñados, con imagen corporativa propia.</li>
      <li>Cumplimiento estructural de la <strong>Ley de Habeas Data</strong> desde el diseño.</li>
      <li>Reducción significativa del <strong>costo operativo mensual</strong> a comparar contra vTiger (detalle en segundo documento).</li>
    </ul>

    <div class="panel-quote">
      "El reemplazo de vTiger no se trata de descartar lo que ha funcionado; se trata de <strong>dar el siguiente paso</strong> hacia una plataforma diseñada a la medida, asistida por IA y con costos operativos significativamente menores."
      <span class="quote-author">— Ing. José Palomares, Consultor SaaS Factory</span>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 4</span></div>
</div>

<!-- ===================== 4. QUÉ ES SAAS FACTORY ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">4. ¿Qué es SaaS Factory? La fábrica de desarrollo en México</h2>

    <div class="panel-info">
      <p>En la organización <strong>SaaS Factory</strong> hemos preparado, en el más estricto sentido de la palabra, una <strong>verdadera fábrica de desarrollo de software para personal de alto nivel</strong>, capaz de entender los procesos empresariales y desarrollar aplicativos aprovechando la maravilla de la Inteligencia Artificial.</p>
    </div>

    <h3>Una fábrica, no un taller</h3>
    <p>La diferencia es importante. Un <em>taller</em> hace cosas a mano, una por una, con resultados que dependen del estado de ánimo del artesano. Una <em>fábrica</em>, en cambio, tiene <strong>procesos estandarizados, herramientas profesionales, controles de calidad y capacidad de producción a escala</strong>. Eso es SaaS Factory: una fábrica preparada para entregar software empresarial con velocidad, calidad y consistencia.</p>

    <h3>Los pilares de la fábrica</h3>
    <div class="cards">
      <div class="card">
        <span class="ico">👨‍💼</span>
        <div class="ctitle">Personal de alto nivel</div>
        <p>Consultores con experiencia comprobada en operaciones empresariales, no únicamente programadores.</p>
      </div>
      <div class="card">
        <span class="ico">⚡</span>
        <div class="ctitle">IA en cada etapa</div>
        <p>Las herramientas de IA más potentes del mundo trabajando en cada paso del desarrollo.</p>
      </div>
    </div>
    <div class="cards">
      <div class="card">
        <span class="ico">🔧</span>
        <div class="ctitle">Procesos estandarizados</div>
        <p>Cada sistema sigue una metodología probada, lo que permite resultados predecibles y de alta calidad.</p>
      </div>
      <div class="card">
        <span class="ico">🔁</span>
        <div class="ctitle">Mejora continua</div>
        <p>Lo aprendido en un cliente fortalece los desarrollos para todos los demás clientes de la fábrica.</p>
      </div>
    </div>

    <h3>El contrato con SaaS Factory México</h3>
    <p>Como Consultor de SaaS Factory, mantengo un <strong>contrato directo con la operación de SaaS Factory México</strong>, lo que significa que Nova Seguridad tiene a su disposición las mismas herramientas, los mismos protocolos de seguridad y los mismos estándares de calidad que utilizan los clientes corporativos atendidos desde esa operación regional.</p>

    <div class="panel-info">
      <p><strong>Para Nova Seguridad, esto se traduce en:</strong> respaldo de una organización internacional, acceso a las herramientas más avanzadas del mercado, y la tranquilidad de saber que el modelo de trabajo no depende de una sola persona, sino de toda una estructura empresarial sólida y respaldada.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 5</span></div>
</div>

<!-- ===================== 5. HERRAMIENTAS DE IA ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">5. Las herramientas de IA al servicio de Nova Seguridad</h2>

    <div class="panel-info">
      <p>Las herramientas de Inteligencia Artificial que utilizo no son experimentos: son <strong>productos comerciales de las compañías tecnológicas más importantes del mundo</strong>, contratadas, pagadas y operativas dentro del ecosistema SaaS Factory para construir y mantener el CRM de Nova Seguridad.</p>
    </div>

    <table>
      <thead><tr><th>Herramienta</th><th>Empresa Creadora</th><th>Aplicación en el CRM Nova Seguridad</th></tr></thead>
      <tbody>
        <tr><td><strong>Claude 4.7</strong></td><td>Anthropic (USA)</td><td>Razonamiento avanzado, diseño de arquitectura, redacción de código y validación de lógica de negocio. Es la IA principal del proceso.</td></tr>
        <tr><td><strong>GPT-5 / GPT-4</strong></td><td>OpenAI (USA)</td><td>Generación de textos, redacción de cotizaciones, mensajes al usuario, comunicaciones y soporte conversacional dentro del CRM.</td></tr>
        <tr><td><strong>Gemini 2.5</strong></td><td>Google (USA)</td><td>Análisis de imágenes, procesamiento multimodal, generación de assets gráficos y reportes ejecutivos visuales.</td></tr>
        <tr><td><strong>Vercel AI Gateway</strong></td><td>Vercel (USA)</td><td>Enrutador inteligente que selecciona automáticamente la mejor IA disponible para cada tarea específica.</td></tr>
        <tr><td><strong>Playwright</strong></td><td>Microsoft (USA)</td><td>Automatización de pruebas: cada cambio se valida con un robot que simula el uso real del CRM.</td></tr>
        <tr><td><strong>OpenRouter</strong></td><td>OpenRouter (USA)</td><td>Plataforma unificada que da acceso a más de 200 modelos de IA, garantizando continuidad ante cualquier eventualidad.</td></tr>
        <tr><td><strong>Vercel · Hosting</strong></td><td>Vercel (USA)</td><td>Servidor profesional donde corre el CRM, con balanceo automático y certificado SSL incluido.</td></tr>
        <tr><td><strong>Cursor / Claude Code</strong></td><td>Anthropic (USA)</td><td>Entornos de desarrollo asistido por IA donde se redacta cada línea de código del aplicativo.</td></tr>
      </tbody>
    </table>

    <h3>¿Qué significa esto para Nova Seguridad en términos prácticos?</h3>

    <div class="panel-alert">
      <p>Que cada nueva funcionalidad solicitada, cada corrección de error, cada reporte ejecutivo y cada mejora del CRM es <strong>diseñada, construida y validada por un equipo formado por un consultor humano experto + las IA más avanzadas del mundo trabajando coordinadas</strong>. El resultado es velocidad, calidad y precisión simultáneas, en una proporción que hace solo dos años hubiera sido impensable.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 6</span></div>
</div>

<!-- ===================== 5b. DIAGRAMA IA ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h3>Modelo de operación con IA — Diagrama</h3>

    <div class="diagram">
      <div class="diagram-title">DIAGRAMA 1 · CÓMO TRABAJAN LAS IA DENTRO DE SAAS FACTORY PARA NOVA SEGURIDAD</div>
      <div class="diagram-body">
        <div class="diagram-row">
          <div class="diagram-node start">
            <strong>NOVA SEGURIDAD</strong><br/><small style="opacity:0.8">Solicita un cambio</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-node center">
            CONSULTOR<br/><small>Ing. José Palomares</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-col">
            <div class="diagram-node end"><strong>CLAUDE 4.7</strong><br/><small>Razonamiento + Código</small></div>
            <div class="diagram-node end"><strong>GPT-5</strong><br/><small>Textos + Comunicación</small></div>
            <div class="diagram-node end"><strong>GEMINI 2.5</strong><br/><small>Imágenes + Visuales</small></div>
          </div>
        </div>
        <div class="diagram-label">Las 3 IAs trabajan coordinadas para Nova Seguridad</div>
      </div>
    </div>

    <h3>Áreas con las que el CRM puede interactuar</h3>

    <p>El CRM de Nova Seguridad tiene la capacidad —previo análisis de requerimientos— de <strong>interactuar con otros sistemas de la organización</strong> que cubren las siguientes áreas operativas:</p>

    <ul class="areas">
      <li>Gestión Comercial</li>
      <li>Cobros a Clientes</li>
      <li>Pagos a Proveedores</li>
      <li>Mercadeo y Comunicaciones</li>
      <li>Ventas y Cierre Comercial</li>
      <li>Servicio Post-Venta</li>
      <li>Atención de PQRS</li>
      <li>Captura de Prospectos</li>
      <li>Análisis Financiero</li>
      <li>Gestión Administrativa</li>
      <li>Procesos de Calidad</li>
      <li>Sistema Contable y Nómina</li>
    </ul>

    <div class="panel-info">
      <p><strong>Importante:</strong> El CRM no pretende reemplazar todos los sistemas existentes. Su valor radica en la capacidad de <strong>integrarse, intercambiar información y servir de punto de control comercial</strong> sobre todas estas áreas, una vez se realice el análisis previo de requerimientos de cada integración específica.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 7</span></div>
</div>

<!-- ===================== 6. MÓDULOS Y FORMULARIOS ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">6. Lo que ya está diseñado: módulos del CRM y formularios públicos</h2>

    <div class="panel-info">
      <p>El nuevo CRM de Nova Seguridad <strong>no parte de cero</strong>. Ya cuenta con un conjunto completo de módulos diseñados, probados y en línea con el modelo operativo de la organización, así como con dos formularios públicos especialmente importantes: <strong>Captura de Prospectos</strong> y <strong>Recepción de PQRS</strong>.</p>
    </div>

    <h3>Módulos principales ya diseñados</h3>

    <table>
      <thead><tr><th style="width:35%;">Módulo</th><th>Propósito en Nova Seguridad</th></tr></thead>
      <tbody>
        <tr><td><strong>Dashboard ejecutivo</strong></td><td>Indicadores comerciales en tiempo real con reportes generados por IA.</td></tr>
        <tr><td><strong>Prospectos</strong></td><td>Captura, calificación y seguimiento de potenciales clientes.</td></tr>
        <tr><td><strong>Clientes</strong></td><td>Base maestra de clientes activos con histórico de relación.</td></tr>
        <tr><td><strong>Contactos</strong></td><td>Personas dentro de cada cliente con roles y datos de comunicación.</td></tr>
        <tr><td><strong>Oportunidades</strong></td><td>Pipeline comercial con probabilidad de cierre asignada por el vendedor.</td></tr>
        <tr><td><strong>Cotizaciones</strong></td><td>Generación de cotizaciones con IVA, ICA, AIU y envío automático por correo. <em>Requiere análisis adicional — ver nota al pie.</em></td></tr>
        <tr><td><strong>Líneas de Servicio</strong></td><td>Catálogo de servicios de Nova Seguridad con sus particularidades fiscales.</td></tr>
        <tr><td><strong>PQRS</strong></td><td>Recepción, clasificación y trazabilidad de Peticiones, Quejas, Reclamos y Sugerencias.</td></tr>
        <tr><td><strong>Tareas y Flujos</strong></td><td>Gestión de actividades comerciales con asignación a usuarios responsables.</td></tr>
        <tr><td><strong>Email Marketing</strong></td><td>Campañas masivas segmentadas con diseñador de correos integrado.</td></tr>
        <tr><td><strong>Referencias y Productos</strong></td><td>Catálogos maestros parametrizables sin necesidad de programación.</td></tr>
        <tr><td><strong>Usuarios y Auditoría</strong></td><td>Control de accesos, roles, permisos y registro de cambios sensibles.</td></tr>
      </tbody>
    </table>

    <h3>Nota especial sobre el módulo de Cotizaciones</h3>
    <div class="panel-info">
      <p>Debido a la <strong>complejidad de variables que maneja Nova Seguridad en una oferta de servicios al cliente</strong> —tipos de puesto, modalidades, dotación, ARL, recargos nocturnos, festivos, AIU, ICA, descuentos, condiciones de pago, etc.— haría falta definir conjuntamente qué se puede hacer para incorporar un <strong>módulo complementario que mantenga informada a la Gerencia sobre los avances o trabas que existen en cada proceso de cotización</strong>, de modo que dicho proceso quede <strong>documentado paso a paso</strong> y la dirección tenga visibilidad permanente del estado real de cada oferta antes, durante y después de su emisión.</p>
    </div>

    <h3>Los dos formularios públicos: la puerta de entrada digital de Nova Seguridad</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">👤</span>
        <div class="ctitle">Captura de Prospectos</div>
        <p>Formulario público que captura potenciales clientes directamente desde la página corporativa. La información entra automáticamente al CRM, queda asignada al vendedor responsable y se inicia el seguimiento comercial sin intervención manual.</p>
      </div>
      <div class="card">
        <span class="ico">📋</span>
        <div class="ctitle">Recepción de PQRS</div>
        <p>Formulario público que permite a cualquier ciudadano radicar una Petición, Queja, Reclamo o Sugerencia. La PQRS queda con número de radicado, fecha y trazabilidad completa, cumpliendo con la normativa colombiana de atención al usuario.</p>
      </div>
    </div>

    <div class="panel-alert">
      <p><strong>Aclaración importante sobre los formularios públicos:</strong> El sistema de Captura de Prospectos y el de Recepción de PQRS <strong>deben ser evaluados conjuntamente con Nova Seguridad</strong>, ya que <strong>no estarán inicialmente embebidos dentro de la página web corporativa</strong>, sino que se invocarán mediante un <strong>llamado desde la página</strong> hacia el aplicativo CRM. Estos formularios ya tienen <strong>conexión directa y controlada con el CRM</strong>, lo que garantiza que cada registro queda trazado y asignado al vendedor o área responsable.</p>
      <p style="margin-top:10px;">Ambos formularios incluyen además la <strong>aceptación expresa de la Política de Tratamiento de Datos Personales</strong> conforme a la Ley 1581 de 2012 (Habeas Data), tema que se desarrolla en detalle en la sección 8 del presente documento.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 8</span></div>
</div>

<!-- ===================== 7. DATOS / INFRAESTRUCTURA ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">7. Sus datos en infraestructura de alto nivel</h2>

    <div class="panel-info">
      <p>Los datos de Nova Seguridad están resguardados en una <strong>infraestructura tecnológica de alto nivel, replicada automáticamente en servidores de respaldo profesionales</strong>. No viven en computadores domésticos, ni en servidores improvisados, ni dependen de un solo equipo que pudiera fallar.</p>
    </div>

    <h3>¿Qué significa "replicación en servidores de respaldo"?</h3>
    <p>Significa que en el momento en que un usuario de Nova Seguridad guarda un dato —un cliente nuevo, una cotización, una PQRS, un seguimiento comercial— ese dato no se guarda en un solo lugar. <strong>Se guarda simultáneamente en varios servidores ubicados en distintos centros de datos</strong>. Si uno de esos centros tuviera un problema, los demás continuarían operando sin que el usuario se entere de nada.</p>

    <h3>Cinco niveles de protección activos</h3>

    <table>
      <thead><tr><th style="width:35%;">Nivel de protección</th><th>Beneficio para Nova Seguridad</th></tr></thead>
      <tbody>
        <tr><td><strong>Cifrado en el viaje</strong></td><td>Toda la información viaja codificada (HTTPS / TLS) entre el navegador del usuario y el servidor. Imposible de interceptar.</td></tr>
        <tr><td><strong>Cifrado en el almacenamiento</strong></td><td>Los datos están guardados de manera codificada (estándar AES-256). Ni el proveedor de servidores puede leerlos sin autorización.</td></tr>
        <tr><td><strong>Replicación automática</strong></td><td>Cada dato existe en varios servidores físicos al mismo tiempo. Si uno falla, los otros continúan operando.</td></tr>
        <tr><td><strong>Backups del proveedor cada hora</strong></td><td>El proveedor de infraestructura genera respaldos automáticos cada hora durante 30 días, sin intervención nuestra ni de Nova Seguridad.</td></tr>
        <tr><td><strong>Monitoreo 24/7 con alertas</strong></td><td>Cualquier comportamiento anómalo dispara una alerta inmediata. Detección temprana de incidentes antes de que afecten al cliente.</td></tr>
      </tbody>
    </table>

    <div class="panel-alert">
      <p><strong>Disponibilidad garantizada del 99.99 %</strong> — En el peor escenario, el sistema podría estar inaccesible un máximo de <strong>52 minutos al año</strong>. En la práctica, los aplicativos de SaaS Factory han operado de manera ininterrumpida desde el día de su puesta en producción.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 9</span></div>
</div>

<!-- ===================== 7b. DIAGRAMA REPLICACIÓN ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h3>Diagrama de cómo se protege la información de Nova Seguridad</h3>

    <div class="diagram">
      <div class="diagram-title">DIAGRAMA 2 · REPLICACIÓN Y PROTECCIÓN DE DATOS NOVA SEGURIDAD</div>
      <div class="diagram-body">
        <div class="diagram-row">
          <div class="diagram-node start">
            <strong>👤 Usuario</strong><br/>Nova Seguridad<br/><small>Guarda un dato</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-node center">
            SERVIDOR<br/><small>Principal</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-col">
            <div class="diagram-node end"><strong>Centro de Datos 1</strong><br/><small>Costa Este USA · Copia activa ✓</small></div>
            <div class="diagram-node end"><strong>Centro de Datos 2</strong><br/><small>Costa Oeste USA · Copia activa ✓</small></div>
            <div class="diagram-node end"><strong>Centro de Datos 3</strong><br/><small>Europa · Copia activa ✓</small></div>
          </div>
        </div>
        <div class="diagram-label">Replicación automática · Disponibilidad 99.99 %</div>
      </div>
    </div>

    <h3>¿Qué se respalda exactamente?</h3>

    <ul class="checks">
      <li><strong>Toda la información comercial:</strong> clientes, contactos, prospectos, oportunidades, cotizaciones, líneas de servicio.</li>
      <li><strong>Información del CRM:</strong> tareas, flujos, seguimientos, comunicaciones, historial de relación con cada cliente.</li>
      <li><strong>Atención al ciudadano:</strong> PQRS, radicados, trazabilidad de respuestas y soportes.</li>
      <li><strong>Datos maestros:</strong> tablas de referencia, configuraciones del sistema, usuarios y permisos.</li>
      <li><strong>Documentos generados:</strong> PDFs corporativos, cotizaciones, reportes ejecutivos, correos enviados.</li>
      <li><strong>Auditoría:</strong> registro de cambios sensibles para trazabilidad y cumplimiento legal.</li>
    </ul>

    <div class="panel-info">
      <p>En síntesis: la información de Nova Seguridad <strong>nunca depende de un solo lugar, un solo equipo o un solo proveedor</strong>. Está construida sobre una estructura redundante diseñada para resistir cualquier eventualidad, desde una falla de hardware hasta un incidente regional, sin que la operación comercial se vea interrumpida.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 10</span></div>
</div>

<!-- ===================== 8. HABEAS DATA ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">8. Cumplimiento de Habeas Data — Ley 1581 de 2012</h2>

    <div class="panel-info">
      <p>El CRM de Nova Seguridad está diseñado <strong>desde su arquitectura</strong> para cumplir con la <strong>Ley 1581 de 2012</strong> y su Decreto Reglamentario 1377 de 2013, normas que regulan la protección de datos personales en Colombia (conocidas como <em>Habeas Data</em>).</p>
    </div>

    <h3>¿Por qué es especialmente importante para Nova Seguridad?</h3>
    <p>Las empresas de vigilancia y seguridad privada manejan información altamente sensible de clientes, contactos, prospectos, empleados y ciudadanos que radican PQRS. La <strong>Superintendencia de Industria y Comercio (SIC)</strong> ha intensificado la fiscalización del cumplimiento de Habeas Data, y las sanciones por incumplimiento pueden alcanzar los <strong>2.000 SMMLV</strong>. Un CRM moderno debe garantizar el cumplimiento <em>por diseño</em>, no como un parche posterior.</p>

    <h3>Mecanismos de cumplimiento ya incorporados</h3>

    <table>
      <thead><tr><th style="width:38%;">Requerimiento legal</th><th>Cómo lo resuelve el CRM Nova Seguridad</th></tr></thead>
      <tbody>
        <tr><td><strong>Autorización previa, expresa e informada</strong></td><td>Los formularios públicos de Prospectos y PQRS incluyen casilla de aceptación obligatoria con enlace a la Política de Tratamiento de Datos de Nova Seguridad.</td></tr>
        <tr><td><strong>Finalidad del tratamiento</strong></td><td>Cada formulario informa con claridad para qué se recolectan los datos (gestión comercial, atención de PQRS, comunicaciones).</td></tr>
        <tr><td><strong>Derechos del titular (ARCO)</strong></td><td>El sistema permite responder solicitudes de Acceso, Rectificación, Cancelación y Oposición sobre datos personales registrados.</td></tr>
        <tr><td><strong>Seguridad de la información</strong></td><td>Cifrado AES-256 en almacenamiento, HTTPS/TLS en transmisión, control de accesos por rol y registro de auditoría.</td></tr>
        <tr><td><strong>Trazabilidad de la autorización</strong></td><td>Cada autorización capturada queda registrada con fecha, hora y dato original entregado por el titular.</td></tr>
        <tr><td><strong>Política de retención</strong></td><td>Configuración de plazos máximos de retención de datos personales con purga automática según política definida por Nova Seguridad.</td></tr>
      </tbody>
    </table>

    <div class="panel-alert">
      <p><strong>Para Nova Seguridad esto se traduce en:</strong> tranquilidad jurídica frente a la SIC, capacidad de responder ante cualquier requerimiento de un titular de datos en los plazos legales, y un CRM que <strong>protege a la organización</strong> de las contingencias regulatorias propias de su sector.</p>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 11</span></div>
</div>

<!-- ===================== 9. RESPALDOS SEMANALES ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">9. Respaldos semanales adicionales en infraestructura propia de Nova Seguridad</h2>

    <div class="panel-info">
      <p>Aunque la infraestructura de SaaS Factory ya genera respaldos automáticos cada hora, entendemos que <strong>Nova Seguridad puede preferir tener una copia adicional bajo su propio control</strong>. Esa copia se puede generar de manera <strong>semanal y completamente automática</strong>, en un equipo local de la oficina y/o directamente en un Google Drive corporativo asignado para esa acción.</p>
    </div>

    <h3>Tres opciones disponibles para Nova Seguridad</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">🖥️</span>
        <div class="ctitle">Opción A · PC Local Nova Seguridad</div>
        <p>Un equipo en oficinas de Nova Seguridad, configurado por SaaS Factory, descarga automáticamente cada semana toda la información del CRM. Acceso físico bajo control directo de Nova Seguridad.</p>
      </div>
      <div class="card">
        <span class="ico">☁️</span>
        <div class="ctitle">Opción B · Google Drive</div>
        <p>Las copias se guardan automáticamente en el Google Drive corporativo de Nova Seguridad asignado para esta acción. Acceso desde cualquier lugar autorizado, con los permisos que la dirección defina.</p>
      </div>
      <div class="card">
        <span class="ico">🛡️</span>
        <div class="ctitle">Opción C · Doble respaldo</div>
        <p>Combinación de las dos anteriores. Una copia local y otra en la nube corporativa. Tranquilidad permanente ante cualquier escenario imaginable.</p>
      </div>
    </div>

    <h3>Restauración inmediata, sin complicaciones</h3>

    <div class="panel-alert">
      <p>El propósito de estos respaldos es <strong>la tranquilidad permanente de Nova Seguridad</strong>. Si alguna vez fuera necesario restaurar información —por una equivocación humana, por una decisión administrativa o por cualquier otro motivo— las restauraciones serán <strong>inmediatas y sin ningún problema</strong>. Nova Seguridad tendrá siempre la capacidad de recuperar su información en cuestión de minutos.</p>
    </div>

    <div class="diagram">
      <div class="diagram-title">DIAGRAMA 3 · RESPALDO SEMANAL AUTOMÁTICO PARA NOVA SEGURIDAD</div>
      <div class="diagram-body">
        <div class="diagram-row">
          <div class="diagram-node start">
            <strong>SaaS Factory</strong><br/><small>Servidor con datos<br/>de Nova Seguridad en vivo</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-node center">
            PROCESO<br/><small>AUTOMÁTICO<br/>Descarga + Cifrado</small>
          </div>
          <div class="diagram-arrow"></div>
          <div class="diagram-col">
            <div class="diagram-node end"><strong>🖥️ PC Local</strong><br/><small>Oficinas Nova Seguridad</small></div>
            <div class="diagram-node end"><strong>☁️ Google Drive</strong><br/><small>Almacenamiento corporativo</small></div>
          </div>
        </div>
        <div class="diagram-label">Domingos 11:00 PM · Sin intervención manual</div>
      </div>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 12</span></div>
</div>

<!-- ===================== 10. EMPODERAMIENTO ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">10. El plan de empoderamiento del equipo Nova Seguridad</h2>

    <div class="panel-info">
      <p>Una de las decisiones más importantes que Nova Seguridad puede tomar para asegurar la continuidad y el crecimiento futuro del CRM es <strong>designar a una persona de su organización para que aprenda, junto al consultor, todo el modelo de trabajo SaaS Factory</strong>.</p>
    </div>

    <div class="panel-quote">
      "Asumo personalmente la responsabilidad de enseñar a alguien de Nova Seguridad que conozca la estructura del sistema, la forma de programar con apoyo de IA, así como la seguridad que se tiene en los servidores de SaaS Factory México. El conocimiento debe quedar en la organización."
      <span class="quote-author">— Ing. José Palomares, Consultor SaaS Factory</span>
    </div>

    <h3>¿Por qué este punto es tan importante?</h3>
    <p>Porque transfiere conocimiento desde una sola persona —el consultor externo— hacia el equipo interno de Nova Seguridad. <strong>El día de mañana, cuando Nova Seguridad quiera ensamblar nuevos procesos, conectar los sistemas con otros aplicativos, o desarrollar funcionalidades adicionales, tendrá un recurso propio capaz de gestionarlo</strong>, sea de manera autónoma o coordinándose con SaaS Factory según la complejidad.</p>

    <h3>¿Qué aprenderá la persona designada por Nova Seguridad?</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">🏗️</span>
        <div class="ctitle">Infraestructura</div>
        <p>Cómo está montada la nube donde vive el CRM Nova Seguridad, dónde están los datos, cómo se actualiza el sistema.</p>
      </div>
      <div class="card">
        <span class="ico">📐</span>
        <div class="ctitle">Diseño de sistemas</div>
        <p>Cómo se piensan los módulos, cómo se conecta la información, por qué se toma cada decisión arquitectónica.</p>
      </div>
    </div>
    <div class="cards">
      <div class="card">
        <span class="ico">🤖</span>
        <div class="ctitle">Uso de las IA</div>
        <p>Cómo solicitar procesos a la fábrica, cómo aprovechar Claude 4.7, GPT-5 y Gemini 2.5 para acelerar resultados.</p>
      </div>
      <div class="card">
        <span class="ico">🔌</span>
        <div class="ctitle">Integración con otros sistemas</div>
        <p>Cómo conectar el CRM Nova Seguridad con software externo a través del modelo API que generan las herramientas de IA.</p>
      </div>
    </div>

    <h3>Condiciones del proceso de empoderamiento</h3>

    <div class="panel-alert">
      <p><strong>Aclaraciones importantes para Nova Seguridad sobre este punto:</strong></p>
      <ul style="margin:8px 0 0 18px; padding:0;">
        <li style="margin-bottom:6px;">El proceso de empoderamiento del recurso designado por Nova Seguridad tiene un <strong>valor mensual</strong> que será detallado en el cuadro de costos al final del documento.</li>
        <li style="margin-bottom:6px;">El recurso Nova Seguridad estará <strong>siempre acompañado por el Consultor Ing. José E. Palomares</strong>, garantizando calidad, continuidad y respaldo permanente del modelo SaaS Factory.</li>
        <li style="margin-bottom:6px;">Los <strong>Sistemas SaaS</strong> que entrega la fábrica funcionan bajo un modelo en el cual el cliente paga el <strong>uso del sistema</strong> y los <strong>diseños adaptativos requeridos</strong> específicamente para su empresa.</li>
        <li style="margin-bottom:6px;">La <strong>propiedad intelectual</strong> del CRM y de sus desarrollos siempre reside en el <strong>diseñador conceptual y desarrollador de los sistemas</strong> —Ing. José E. Palomares en alianza con SaaS Factory México—. Lo que Nova Seguridad recibe es el derecho de uso permanente, las adaptaciones a su operación y el acompañamiento continuo.</li>
      </ul>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 13</span></div>
</div>

<!-- ===================== 11. API + AUTONOMÍA ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">11. Modelo API — integración con otros sistemas</h2>

    <div class="panel-info">
      <p>Las versiones modernas de IA generan automáticamente lo que se llama un <strong>"Modelo API"</strong>, que es la puerta de comunicación segura para que el CRM Nova Seguridad pueda <strong>conectarse e intercambiar información con cualquier otro sistema</strong> que la organización ya use o decida adoptar en el futuro.</p>
    </div>

    <h3>¿Qué es una API en lenguaje sencillo?</h3>
    <p>Imagine que el CRM de Nova Seguridad es una empresa, y otros sistemas externos —el banco, la DIAN, una plataforma de logística, un sistema contable, un software de nómina, una herramienta de WhatsApp Business— son otras empresas. La <strong>API es la recepcionista de esa empresa</strong>: atiende las llamadas externas, valida quién es, traduce lo que pide y entrega la información solicitada de manera ordenada y segura.</p>

    <h3>Ejemplos de integraciones que Nova Seguridad podrá hacer</h3>

    <div class="cards">
      <div class="card">
        <span class="ico">🏦</span>
        <div class="ctitle">Bancos</div>
        <p>Conectar la conciliación bancaria automática con la información del CRM, sin intervención manual.</p>
      </div>
      <div class="card">
        <span class="ico">📊</span>
        <div class="ctitle">Sistema Contable</div>
        <p>Enviar automáticamente facturas, cotizaciones aprobadas y pagos al sistema contable que Nova Seguridad utilice.</p>
      </div>
    </div>
    <div class="cards">
      <div class="card">
        <span class="ico">📱</span>
        <div class="ctitle">WhatsApp Business</div>
        <p>Notificaciones automáticas a clientes y vendedores desde el CRM. Comunicación inmediata sin canales fragmentados.</p>
      </div>
      <div class="card">
        <span class="ico">📧</span>
        <div class="ctitle">Email Marketing externo</div>
        <p>Sincronizar la información del CRM con herramientas de campañas masivas para mercadeo digital.</p>
      </div>
    </div>

  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 14</span></div>
</div>

<!-- ===================== 12. ANÁLISIS DE COSTOS Y CONVENIO ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">12. Análisis de Costos y Convenio Propuesto</h2>

    <div class="panel-info">
      <p>A continuación se presenta el <strong>cuadro comparativo entre el costo actual del CRM vTiger que Nova Seguridad viene utilizando y el costo del nuevo CRM apoyado por Inteligencia Artificial</strong> que se propone implementar, junto con las condiciones contractuales que regirán la relación entre las partes.</p>
    </div>

    <h3>Comparativo de costos mensuales</h3>

    <table>
      <thead>
        <tr>
          <th style="width:32%;">Concepto</th>
          <th style="width:34%;">Sistema Actual<br/>CRM vTiger</th>
          <th style="width:34%;">Sistema Propuesto<br/>CRM con IA</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Mensualidad fija</strong></td>
          <td>COP 1.280.000</td>
          <td><strong style="color:${PALETTE.secondary};">COP 875.000</strong></td>
        </tr>
        <tr>
          <td><strong>Soporte técnico y asesoría incluida</strong></td>
          <td>Soporte técnico + <strong>2 horas/mes</strong> de asesoría</td>
          <td>Soporte técnico + <strong>4 horas/mes</strong> de asesoría</td>
        </tr>
        <tr>
          <td><strong>Hora adicional</strong><br/>(diseño, desarrollos, asesorías especiales)</td>
          <td>COP 250.000 / hora</td>
          <td><strong style="color:${PALETTE.secondary};">COP 180.000 / hora</strong></td>
        </tr>
        <tr>
          <td><strong>Ahorro mensual estimado</strong></td>
          <td>—</td>
          <td><strong style="color:${PALETTE.secondary};">COP 405.000 / mes</strong></td>
        </tr>
      </tbody>
    </table>

    <div class="panel-alert">
      <p><strong>Ahorro proyectado para Nova Seguridad:</strong> el nuevo CRM con IA representa una <strong>reducción de COP 405.000 mensuales</strong> en la cuota base, equivalente a <strong>COP 4.860.000 al año</strong>, más el <strong>doble de horas de asesoría incluidas</strong> y un <strong>28 % menos en costo de hora adicional</strong> para desarrollos especiales.</p>
    </div>

    <h3>Condiciones de inicio del nuevo CRM</h3>

    <table>
      <thead><tr><th style="width:35%;">Período</th><th>Valor</th></tr></thead>
      <tbody>
        <tr><td><strong>Primer mes</strong> · Inicio del servicio</td><td><strong>COP 1.250.000</strong> · pago único bajo nuevo contrato celebrado con <strong>Ing. José E. Palomares — Consultor SaaS Factory</strong>.</td></tr>
        <tr><td><strong>Meses siguientes</strong> (mes 2 en adelante)</td><td><strong>COP 875.000 / mes</strong> · cuota fija mensual.</td></tr>
        <tr><td><strong>Capacitación a usuarios elegidos</strong> · 12 horas</td><td><strong style="color:${PALETTE.secondary};">COP 975.000</strong> · valor especial por las 12 horas de capacitación al grupo de usuarios designados por Nova Seguridad.</td></tr>
      </tbody>
    </table>

    <h3>Servicio opcional — Empoderamiento de personal Nova Seguridad</h3>

    <div class="panel-info">
      <p>Si Nova Seguridad desea designar <strong>una persona de su organización</strong> para que se vaya adecuando a los desarrollos con IA y al conocimiento de programación con <strong>Claude 4.7</strong>, se ofrece un acompañamiento adicional con las siguientes condiciones:</p>
    </div>

    <table>
      <thead><tr><th style="width:35%;">Concepto</th><th>Valor / Condición</th></tr></thead>
      <tbody>
        <tr><td><strong>Valor mensual</strong></td><td><strong style="color:${PALETTE.secondary};">USD 85 / mes</strong></td></tr>
        <tr><td><strong>Permanencia mínima</strong></td><td>1 año</td></tr>
        <tr><td><strong>Acompañamiento</strong></td><td>Permanente, a cargo del Ing. José E. Palomares</td></tr>
      </tbody>
    </table>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 15</span></div>
</div>

<!-- ===================== 12b. CONVENIO ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">Términos del Convenio</h2>

    <div class="panel-info">
      <p>El presente apartado expone los términos contractuales que regirán el convenio entre <strong>Nova Seguridad</strong> y el <strong>Ing. José E. Palomares — Consultor SaaS Factory</strong> para la prestación del servicio del nuevo CRM apoyado por Inteligencia Artificial.</p>
    </div>

    <table>
      <thead><tr><th style="width:32%;">Cláusula</th><th>Contenido</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>Duración del contrato</strong></td>
          <td><strong>Un (1) año</strong> contado a partir de la fecha de inicio del servicio.</td>
        </tr>
        <tr>
          <td><strong>Renovación</strong></td>
          <td><strong>Automática cada año</strong>, salvo manifestación expresa de alguna de las partes.</td>
        </tr>
        <tr>
          <td><strong>Ajuste anual de valores</strong></td>
          <td>Cada año podrá efectuarse un <strong>ajuste sobre el valor convenido</strong>, basado en indicadores que afecten los costos del servicio (IPC, salario mínimo, costos de plataformas tecnológicas, herramientas de IA, etc.). El nuevo valor se <strong>informará por escrito antes de iniciar el próximo ejercicio</strong>, con el sustento correspondiente.</td>
        </tr>
        <tr>
          <td><strong>Terminación voluntaria por parte del Cliente</strong></td>
          <td>En caso de que Nova Seguridad no desee continuar con el servicio, deberá <strong>emitir una carta formal informando el deseo de no continuar con una antelación mínima de treinta (30) días calendario</strong> a la fecha de terminación deseada.</td>
        </tr>
        <tr>
          <td><strong>Modalidad de cobro del servicio SaaS</strong></td>
          <td>El cliente paga por el <strong>uso del sistema</strong> y por los <strong>diseños adaptativos</strong> requeridos específicamente para su operación. No adquiere licenciamiento perpetuo, ni código fuente, ni derechos sobre los componentes desarrollados.</td>
        </tr>
        <tr>
          <td><strong>Propiedad intelectual</strong></td>
          <td>La propiedad intelectual del CRM, sus módulos, su arquitectura y sus desarrollos <strong>siempre reside en el diseñador conceptual y desarrollador del sistema</strong> —Ing. José E. Palomares en alianza con SaaS Factory México—. Nova Seguridad recibe el <strong>derecho de uso permanente</strong> mientras dure la vigencia del convenio.</td>
        </tr>
        <tr>
          <td><strong>Continuidad operativa</strong></td>
          <td>Durante toda la vigencia del convenio, el Ing. José E. Palomares y la organización SaaS Factory México garantizan la <strong>continuidad operativa del sistema, los respaldos, las herramientas de IA y el acompañamiento al cliente</strong>.</td>
        </tr>
        <tr>
          <td><strong>Servicio opcional de empoderamiento</strong></td>
          <td>El servicio opcional descrito en la sección anterior (USD 85 / mes) tiene <strong>permanencia mínima de un (1) año</strong> y puede contratarse de manera independiente al servicio base.</td>
        </tr>
      </tbody>
    </table>

    <div class="panel-quote">
      Este convenio se entrega <strong>como propuesta formal</strong>. Cualquier término aquí expuesto es susceptible de ser revisado, ajustado o ampliado de común acuerdo entre Nova Seguridad y el Ing. José E. Palomares antes de la firma final del contrato.
      <span class="quote-author">— Ing. José Palomares, Consultor SaaS Factory</span>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 16</span></div>
</div>

<!-- ===================== 13. CIERRE ===================== -->
<div class="page">
  <div class="pageheader">
    <div class="ph-logo"><img src="${LOGO_DATA_URI}" alt="Novasep" /></div>
    <div class="right">RECOMENDACIONES · NUEVO CRM CON IA</div>
  </div>

  <div class="content">
    <h2 class="section">13. Compromiso final y palabras de cierre</h2>

    <p><strong>Gracias a ustedes por escuchar estas recomendaciones</strong>, que salen de una persona que <strong>los ha acompañado y los acompañará hasta que ustedes lo necesiten</strong>. Este documento no es un cierre: es el <strong>primer capítulo de un acuerdo vivo</strong> que iremos enriqueciendo con cada nueva conversación, cada nuevo módulo y cada nueva inquietud que Nova Seguridad nos plantee.</p>

    <h3>Resumen de los compromisos asumidos</h3>

    <table>
      <thead><tr><th style="width:35%;">Compromiso</th><th>Cómo se materializa</th></tr></thead>
      <tbody>
        <tr><td><strong>Tranquilidad permanente</strong></td><td>Infraestructura empresarial certificada con replicación automática y disponibilidad del 99.99 %.</td></tr>
        <tr><td><strong>Respaldos en poder de Nova Seguridad</strong></td><td>Copias semanales automáticas en PC local Nova Seguridad y/o Google Drive corporativo, con restauración inmediata.</td></tr>
        <tr><td><strong>Cumplimiento Habeas Data</strong></td><td>Arquitectura conforme a la Ley 1581 de 2012 y formularios públicos con autorización expresa.</td></tr>
        <tr><td><strong>Empoderamiento del equipo</strong></td><td>Acompañamiento permanente al recurso técnico designado por Nova Seguridad, bajo modalidad mensual con el Consultor Ing. José E. Palomares.</td></tr>
        <tr><td><strong>Propiedad intelectual</strong></td><td>El cliente paga uso y diseños adaptativos a su operación; la propiedad intelectual reside en el diseñador conceptual y desarrollador del sistema.</td></tr>
        <tr><td><strong>Tecnología de punta</strong></td><td>Uso permanente de Claude 4.7, GPT-5, Gemini 2.5 y demás herramientas de IA contratadas por SaaS Factory.</td></tr>
        <tr><td><strong>Continuidad asegurada</strong></td><td>Operatividad permanente sin problemas, soportada por la organización SaaS Factory México y todo su equipo.</td></tr>
        <tr><td><strong>Integración con otros sistemas</strong></td><td>Modelo API que permite conectar el CRM Nova Seguridad con cualquier otro sistema que la organización adopte (previo análisis de requerimientos).</td></tr>
        <tr><td><strong>Costos actuales vs. nuevos</strong></td><td>Cuadro comparativo de costos vigentes en el proceso comercial contra los nuevos costos del CRM ofrecido, presentado al final del presente documento.</td></tr>
      </tbody>
    </table>

    <h3>Planeamiento a Seguir</h3>

    <div class="panel-info">
      <p>A continuación se describe el <strong>plan de trabajo</strong> que se ejecutará una vez Nova Seguridad otorgue la <strong>buena pro</strong> para implementar el nuevo CRM y capacitar al personal:</p>
    </div>

    <table>
      <thead><tr><th style="width:8%;">N°</th><th>Actividad</th></tr></thead>
      <tbody>
        <tr>
          <td><strong>1</strong></td>
          <td><strong>Conocimiento detallado de los campos definidos</strong> para cada uno de los módulos del CRM, validando con los usuarios responsables que la información a capturar corresponde a la operación real de Nova Seguridad.</td>
        </tr>
        <tr>
          <td><strong>2</strong></td>
          <td><strong>Definición y ajustes en los formularios de captura</strong> de cada módulo, asegurando que cada pantalla refleje el flujo de trabajo diario del área correspondiente.</td>
        </tr>
        <tr>
          <td><strong>3</strong></td>
          <td><strong>Definición por parte de los usuarios de los Reportes y Consultas</strong> de cada módulo, de modo que la información salga del sistema en el formato y nivel de detalle que cada rol necesita.</td>
        </tr>
        <tr>
          <td><strong>4</strong></td>
          <td><strong>Definición de Gráficos en un Dashboard</strong> para el área Comercial —y cualquier otra área que lo requiera— que informe permanentemente sobre <em>situaciones, avances, cierres, anulaciones y renovaciones</em> en los módulos presentados.</td>
        </tr>
        <tr>
          <td><strong>5</strong></td>
          <td><strong>Definir en conjunto los horarios</strong> de trabajo para cada una de estas actividades, de manera que no afecten la operación cotidiana de las áreas involucradas.</td>
        </tr>
      </tbody>
    </table>

    <h4>Coordinación del plan</h4>
    <p>Todas las actividades estarán <strong>coordinadas por el Ing. José E. Palomares</strong>, en calidad de Consultor responsable, <strong>acompañado por</strong>:</p>

    <ul class="checks">
      <li><strong>Sr. Juan Pablo Ramírez</strong> — Director Administrativo y Financiero de Nova Seguridad.</li>
      <li><strong>Sra. Natalia</strong> — Directora de Recursos Humanos de Nova Seguridad.</li>
    </ul>

    <h4>Condiciones del proceso</h4>
    <div class="panel-alert">
      <p><strong>Inicio:</strong> Para dar inicio a estas actividades, deberá ya existir <strong>la buena pro de Nova Seguridad</strong> para implementar el CRM y capacitar al personal.</p>
      <p style="margin-top:10px;"><strong>Cierre del proceso:</strong> Una vez cada módulo tenga los alcances requeridos por los usuarios, <strong>previo análisis y conformidad del Consultor Ing. José E. Palomares</strong>, se procederá a <strong>emitir el manual de documentación de informática de todo el sistema CRM</strong>, dejando constancia formal del estado final entregado a la organización.</p>
    </div>

    <div class="panel-quote">
      Mi compromiso personal, y el de toda la organización SaaS Factory, es que la tecnología sea siempre <strong>una aliada invisible</strong> de Nova Seguridad — una que trabaja en silencio, sin requerir su atención, dejándole espacio mental a la dirección para concentrarse en lo verdaderamente importante: <strong>el crecimiento del negocio</strong>.
      <span class="quote-author">— Ing. José Palomares</span>
    </div>

    <p>Quedo atento a cualquier inquietud adicional que surja en la reunión de directivas, y por supuesto a su entera disposición para profundizar, ampliar o demostrar prácticamente cualquiera de los puntos aquí expuestos.</p>

    <div class="signature-box">
      <p style="margin:0 0 22px 0;">Cordialmente,</p>
      <div class="sig-line"></div>
      <div class="sig-name">Ing. José E. Palomares</div>
      <div class="sig-role">Consultor Sistemas de Información y Marketing<br/>Especialista en Desarrollos con apoyo de IA</div>
      <div class="sig-org">SAAS FACTORY · MÉXICO · COLOMBIA</div>
      <div class="sig-date">Medellín · 15 de mayo de 2026</div>
    </div>

    <div class="confidential">
      Este documento es <strong>confidencial</strong> y de uso exclusivo de la dirección de <strong>Nova Seguridad</strong>
    </div>
  </div>

  <div class="botbar-thin"></div>
  <div class="footer"><span>Recomendaciones · Nuevo CRM con IA · Nova Seguridad</span><span>Página 17</span></div>
</div>

</body>
</html>`

async function generatePDF() {
  console.log('🚀 Lanzando Chrome...')
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })

  fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true })

  await page.pdf({
    path: OUT_PDF,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  })

  await browser.close()
  const stat = fs.statSync(OUT_PDF)
  console.log(`✅ PDF generado: ${OUT_PDF}`)
  console.log(`   Tamaño: ${(stat.size / 1024).toFixed(1)} KB`)
}

generatePDF().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
