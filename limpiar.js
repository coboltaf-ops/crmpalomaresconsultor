#!/usr/bin/env node
/**
 * LIMPIA TODO EL CRM - Sin Turso
 *
 * El CRM almacena datos en localStorage del navegador.
 * Este script simula esa limpieza (imprime qué se va a borrar).
 *
 * Para EJECUTAR de verdad, abre el CRM y presiona el botón 🗑️
 */

console.log('\n╔═══════════════════════════════════════╗')
console.log('║  🗑️  LIMPIEZA DEL CRM - INSTRUCCIONES ║')
console.log('╚═══════════════════════════════════════╝\n')

const keys = [
  'crm-agente-sugerencias-storage',
  'crm-centros-costo-storage',
  'crm-clientes-storage',
  'crm-contactos-storage',
  'crm-contratos-storage',
  'crm-cotizaciones-storage',
  'crm-current-user-storage',
  'crm-disenador-correos-storage',
  'crm-email-log-storage',
  'crm-email-marketing-storage',
  'crm-empresa-storage',
  'crm-flujos-storage',
  'crm-lineas-servicio-storage',
  'crm-modulos-storage',
  'crm-oportunidades-storage',
  'crm-personal-storage',
  'crm-pqrs-storage',
  'crm-productos-storage',
  'crm-prospectos-storage',
  'crm-referencias-storage',
  'crm-roles-storage',
  'crm-tareas-storage',
  'crm-usuarios-storage',
]

console.log('📋 DATOS QUE SE BORRARÁN:\n')
keys.forEach((k, i) => {
  console.log(`   ${i + 1}. ${k}`)
})

console.log(`\n✓ Total: ${keys.length} datos del CRM\n`)

console.log('═══════════════════════════════════════\n')
console.log('🔴 OPCIÓN 1: DESDE EL NAVEGADOR (RECOMENDADO)\n')
console.log('   1. Abre: https://crmpalomaresconsultor.vercel.app')
console.log('   2. Presiona el botón 🗑️ en la esquina superior derecha')
console.log('   3. Confirma el mensaje')
console.log('   4. El CRM se recargará completamente vacío\n')

console.log('═══════════════════════════════════════\n')
console.log('🔴 OPCIÓN 2: DESDE LA CONSOLA DEL NAVEGADOR\n')
console.log('   1. Abre: https://crmpalomaresconsultor.vercel.app')
console.log('   2. Presiona F12 (DevTools)')
console.log('   3. Ve a la pestaña "Console"')
console.log('   4. Copia y pega ESTO:\n')

const jsCode = `localStorage.clear(); sessionStorage.clear(); window.location.href='/login';`
console.log(`   ${jsCode}\n`)
console.log('   5. Presiona ENTER')
console.log('   6. Se borrará todo y te llevará a login\n')

console.log('═══════════════════════════════════════\n')
console.log('✅ Resultado esperado:')
console.log('   - CRM completamente vacío')
console.log('   - Sin clientes')
console.log('   - Sin prospectos')
console.log('   - Sin datos\n')

console.log('═══════════════════════════════════════\n')
