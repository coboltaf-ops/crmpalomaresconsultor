import type { NextConfig } from "next";

// Versión del build: se evalúa una sola vez al hacer `next build`, queda fija
// en el bundle. Usada por useCacheBust para detectar deploys nuevos y forzar
// recarga limpia en navegadores con caché agresivo.
const BUILD_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || String(Date.now());

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  outputFileTracingIncludes: {
    '/api/plan-estrategico-pdf': ['./node_modules/@sparticuz/chromium/**/*'],
  },
  env: {
    NEXT_PUBLIC_BUILD_VERSION: BUILD_VERSION,
  },
  // Redirige URL antigua a la nueva para que cualquier Safari/navegador con
  // JS cacheado que aún apunte a /cotizaciones termine en /cotizaciones-v2.
  async redirects() {
    return [
      { source: '/cotizaciones', destination: '/cotizaciones-v2', permanent: true },
      { source: '/cotizaciones/:path*', destination: '/cotizaciones-v2/:path*', permanent: true },
    ]
  },
  // Cabeceras de caché — evita que Safari sirva HTML/JS antiguo y los usuarios
  // tengan que hacer hard-reload manualmente cada vez que desplegamos.
  async headers() {
    return [
      {
        // Estáticos con hash en el nombre (JS, CSS, fonts, imágenes de Next):
        // se pueden cachear "para siempre" porque al cambiar el bundle cambia el hash.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // HTML del CRM y formularios públicos: el navegador y la CDN de Vercel
        // deben revalidar cada vez para asegurarse de tener el último bundle.
        // Sin esto, Safari sirve HTML cacheado y carga JS viejo, dejando ver
        // datos en minúscula o features faltantes.
        // - Cache-Control afecta navegador
        // - CDN-Cache-Control afecta la CDN edge de Vercel (más estricto)
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },
};

export default nextConfig;
