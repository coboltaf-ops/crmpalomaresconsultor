import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Limpiando...</title>
      <style>
        body { font-family: Arial; text-align: center; padding: 40px; background: #f0f0f0; }
        h1 { color: #333; }
      </style>
    </head>
    <body>
      <h1>🗑️ Limpiando CRM...</h1>
      <p>Borrando TODOS los datos...</p>
      <script>
        // Borrar TODO
        localStorage.clear();
        sessionStorage.clear();

        // Redirigir en 1 segundo
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      </script>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
