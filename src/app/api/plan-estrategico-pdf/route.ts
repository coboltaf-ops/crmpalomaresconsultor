import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const runtime = 'nodejs'
export const maxDuration = 60

async function getBrowser() {
  if (process.env.VERCEL_ENV || process.env.AWS_REGION) {
    // Serverless en Vercel
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }
  // Desarrollo local: intentar con Chromium local si está disponible
  const localChromes = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ]
  const fs = await import('fs')
  const localPath = localChromes.find(p => { try { return fs.existsSync(p) } catch { return false } })
  return puppeteer.launch({
    executablePath: localPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

export async function GET(req: Request) {
  let browser
  try {
    const url = new URL(req.url)
    const targetUrl = `${url.protocol}//${url.host}/plan-estrategico`

    browser = await getBrowser()
    const page = await browser.newPage()
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 45000 })
    // Quitar la barra de herramientas del HTML al imprimir
    await page.addStyleTag({ content: '.no-print, .toolbar { display: none !important; }' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', right: '16mm', bottom: '18mm', left: '16mm' },
    })

    await browser.close()

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Plan-Estrategico-CRM-NovaSeguridad.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    if (browser) { try { await browser.close() } catch { /* ignore */ } }
    console.error('[plan-estrategico-pdf] Error:', err)
    return Response.json({ error: 'Error al generar el PDF.', detalle: String(err) }, { status: 500 })
  }
}
