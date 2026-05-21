'use client'
import { useState } from 'react'
import { useClientesStore } from '@/features/clientes/store/clientes-store'
import { useContactosStore } from '@/features/contactos/store/contactos-store'
import { useProspectosStore } from '@/features/prospectos/store/prospectos-store'
import { useOportunidadesStore } from '@/features/oportunidades/store/oportunidades-store'
import { useCotizacionesStore } from '@/features/cotizaciones/store/cotizaciones-store'
import { usePQRSStore } from '@/features/pqrs/store/pqrs-store'
import { useTareasStore } from '@/features/tareas/store/tareas-store'
import { useProductosStore } from '@/features/productos/store/productos-store'
import { useContratosStore } from '@/features/contratos/store/contratos-store'

interface ModuloConfig {
  key: string
  label: string
  getRegistros: () => unknown[]
  clear: () => void
}

const MODULOS: ModuloConfig[] = [
  { key: 'clientes', label: 'Empresas (Clientes)',
    getRegistros: () => useClientesStore.getState().clientes,
    clear: () => useClientesStore.setState({ clientes: [] }) },
  { key: 'contactos', label: 'Contactos',
    getRegistros: () => useContactosStore.getState().contactos,
    clear: () => useContactosStore.setState({ contactos: [] }) },
  { key: 'prospectos', label: 'Prospectos',
    getRegistros: () => useProspectosStore.getState().prospectos,
    clear: () => useProspectosStore.setState({ prospectos: [] }) },
  { key: 'oportunidades', label: 'Oportunidades',
    getRegistros: () => useOportunidadesStore.getState().oportunidades,
    clear: () => useOportunidadesStore.setState({ oportunidades: [] }) },
  { key: 'cotizaciones', label: 'Cotizaciones',
    getRegistros: () => useCotizacionesStore.getState().cotizaciones,
    clear: () => useCotizacionesStore.setState({ cotizaciones: [] }) },
  { key: 'pqrs', label: 'PQRS',
    getRegistros: () => usePQRSStore.getState().pqrs,
    clear: () => usePQRSStore.setState({ pqrs: [] }) },
  { key: 'tareas', label: 'Tareas',
    getRegistros: () => useTareasStore.getState().tareas,
    clear: () => useTareasStore.setState({ tareas: [] }) },
  { key: 'productos', label: 'Productos y Servicios',
    getRegistros: () => useProductosStore.getState().productos,
    clear: () => useProductosStore.setState({ productos: [] }) },
  { key: 'contratos', label: 'Contratos',
    getRegistros: () => useContratosStore.getState().contratos,
    clear: () => useContratosStore.setState({ contratos: [] }) },
]

interface Resultado {
  modulo: string
  total: number
  backupId?: string
  error?: string
}

export default function LimpiarTodoButton() {
  const [running, setRunning] = useState(false)
  const [resultados, setResultados] = useState<Resultado[] | null>(null)

  const ejecutar = async () => {
    if (running) return

    // Resumen previo
    const resumen = MODULOS.map(m => `• ${m.label}: ${m.getRegistros().length}`).join('\n')
    const total = MODULOS.reduce((s, m) => s + m.getRegistros().length, 0)

    if (total === 0) {
      alert('No hay datos en ningún módulo. Nada que limpiar.')
      return
    }

    const ok1 = confirm(
      `⚠️ LIMPIEZA TOTAL DE DATOS\n\n` +
      `Vamos a hacer estas dos cosas:\n` +
      `1) Guardar un RESPALDO de cada módulo en el CRM (Vercel KV)\n` +
      `2) Borrar todos los registros de los siguientes módulos de este dispositivo\n\n` +
      `Datos actuales:\n${resumen}\n\nTOTAL: ${total} registros\n\n` +
      `Después podrás recuperarlos con "📂 Recargar datos" en cada módulo.\n\n` +
      `¿Continuar?`
    )
    if (!ok1) return

    // Doble confirmación porque borra mucho
    const ok2 = confirm(`Confirmación FINAL: vas a borrar ${total} registros de este dispositivo (con respaldo en el CRM). ¿Procedes?`)
    if (!ok2) return

    setRunning(true)
    const out: Resultado[] = []

    for (const m of MODULOS) {
      const registros = m.getRegistros()
      const total = registros.length
      if (total === 0) {
        out.push({ modulo: m.label, total: 0 })
        continue
      }
      try {
        // 1) Respaldar en Vercel KV
        const res = await fetch('/api/backups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modulo: m.key, registros }),
        })
        if (!res.ok) throw new Error('Backup falló')
        const data = await res.json()
        // 2) Borrar del store
        m.clear()
        out.push({ modulo: m.label, total, backupId: data.id })
      } catch (err) {
        console.error(`[limpiar-todo] Error en ${m.key}:`, err)
        out.push({ modulo: m.label, total, error: String(err) })
      }
    }

    // Bloquear el auto-seed para que no vuelvan a aparecer los datos demo
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm-no-autoseed', '1')
    }

    setResultados(out)
    setRunning(false)
  }

  return (
    <div style={{ marginTop: 20, padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)' }}>
      <h3 style={{ color: '#fca5a5', fontSize: 16, fontWeight: 800, marginBottom: 6 }}>🧹 Limpiar Todos los Datos</h3>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
        Guarda un respaldo en el CRM y borra todos los registros de:
        <strong> Empresas, Contactos, Prospectos, Oportunidades, Cotizaciones, PQRS, Tareas.</strong>
        <br /><br />
        Útil para empezar de cero. Los respaldos se pueden restaurar desde cada módulo con &quot;📂 Recargar datos&quot;.
      </p>
      <button
        type="button"
        onClick={ejecutar}
        disabled={running}
        style={{
          padding: '12px 24px', borderRadius: 10,
          background: running ? 'rgba(239,68,68,0.3)' : '#dc2626',
          color: '#fff', border: '1px solid #ef4444',
          fontSize: 14, fontWeight: 800, cursor: running ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
        }}
      >
        {running ? 'Procesando…' : '🧹 Limpiar Todos los Datos'}
      </button>

      {resultados && (
        <div style={{ marginTop: 16, padding: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10 }}>
          <p style={{ color: '#86efac', fontSize: 13, fontWeight: 800, marginBottom: 8 }}>✅ Limpieza completada</p>
          <ul style={{ color: '#fff', fontSize: 13, listStyle: 'none', padding: 0, margin: 0 }}>
            {resultados.map(r => (
              <li key={r.modulo} style={{ padding: '4px 0' }}>
                <strong>{r.modulo}:</strong> {r.error ? <span style={{ color: '#fca5a5' }}>⚠ {r.error}</span> : `${r.total} respaldado(s) y borrado(s)`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
