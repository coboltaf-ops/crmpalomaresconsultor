import { createClient } from '@libsql/client';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

console.log('Turso URL:', tursoUrl ? '✓ Configurado' : '✗ Falta');
console.log('Turso Token:', tursoToken ? '✓ Configurado' : '✗ Falta');

if (!tursoUrl || !tursoToken) {
  console.error('❌ TURSO_DATABASE_URL o TURSO_AUTH_TOKEN no configuradas');
  process.exit(1);
}

const db = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

(async () => {
  try {
    const result = await db.execute('DELETE FROM prospectos_externos');
    console.log('✅ Todos los prospectos eliminados');
    console.log('Result:', result);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
