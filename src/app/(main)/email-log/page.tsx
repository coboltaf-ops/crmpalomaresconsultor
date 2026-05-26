'use client'
import { useState, useEffect } from 'react'
import { useEmailLogStore, EmailLog } from '@/features/email-log/store/email-log-store'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import ReportPanel from '@/shared/components/report-panel'

const today = todayColombia()

export default function EmailLogPage() {
  const { emailLogs, addEmailLog, deleteEmailLog } = useEmailLogStore()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'registros' | 'reportes'>('registros')

  const filtered = emailLogs.filter(e => {
    const s = search.toLowerCase()
    return !s || e.remitente.toLowerCase().includes(s) || e.destinatario.toLowerCase().includes(s) ||
      e.asunto.toLowerCase().includes(s) || e.cliente_nombre?.toLowerCase().includes(s)
  })

  const statusStyle = (estado: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      'enviado': { background: '#2563eb', color: '#ffffff', border: '1px solid #3b82f6' },
      'recibido': { background: 'rgba(34,197,94,0.2)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)' },
      'abierto': { background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' },
      'fallido': { background: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' },
    }
    return map[estado] || {}
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 13, outline: 'none', boxSizing: 'border-box', height: 38 }
  const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({ ...btnStyle, background: active ? '#0A5A5A' : 'rgba(255,255,255,0.15)', color: active ? '#ffffff' : 'rgba(255,255,255,0.7)', border: active ? '1px solid #16a34a' : '1px solid rgba(255,255,255,0.2)' })

  const reportColumns = [
    { header: 'Fecha', key: 'fecha', width: 12 },
    { header: 'Remitente', key: 'remitente', width: 18 },
    { header: 'Destinatario', key: 'destinatario', width: 18 },
    { header: 'Asunto', key: 'asunto', width: 25 },
    { header: 'Cliente', key: 'cliente_nombre', width: 15 },
    { header: 'Estado', key: 'estado', width: 12 },
  ]

  const reportRows = filtered.map(e => ({
    fecha: fDate(e.fecha),
    remitente: e.remitente,
    destinatario: e.destinatario,
    asunto: e.asunto,
    cliente_nombre: e.cliente_nombre || '—',
    estado: e.estado,
  }))

  const reportFilters = [
    { label: 'Estado', key: 'estado', options: [...new Set(emailLogs.map(e => e.estado).filter(Boolean))] },
    { label: 'Cliente', key: 'cliente_nombre', options: [...new Set(emailLogs.map(e => e.cliente_nombre).filter(Boolean))] as string[] },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Email Log</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Historial de correos enviados y recibidos</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('registros')} style={tabBtnStyle(tab === 'registros')}>📋 Registros</button>
        <button onClick={() => setTab('reportes')} style={tabBtnStyle(tab === 'reportes')}>📊 Reportes</button>
      </div>

      {tab === 'registros' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por remitente, destinatario, asunto o cliente..." style={{ ...inputStyle, maxWidth: 500 }} />
          </div>

          <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Fecha', 'Remitente', 'Destinatario', 'Asunto', 'Cliente', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', background: '#0A5A5A', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa', fontSize: 13 }}>{fDate(e.fecha)}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontSize: 13 }}>{e.remitente}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{e.destinatario}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{e.asunto}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{e.cliente_nombre || '—'}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...statusStyle(e.estado) }}>{e.estado}</span>
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <button onClick={() => { if (confirm(`¿Eliminar este registro?`)) deleteEmailLog(e.id) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#dc2626', color: '#ffffff', border: '1px solid #ef4444' }}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay registros de correos</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'reportes' && (
        <ReportPanel title="Reporte de Email Log" columns={reportColumns} rows={reportRows} filters={reportFilters} />
      )}
    </div>
  )
}
