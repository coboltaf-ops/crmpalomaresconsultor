'use client'
import { useState } from 'react'
import { useLineasServicioStore, LineaServicio } from '@/features/lineas-servicio/store/lineas-servicio-store'
import { usePermisos } from '@/shared/hooks/use-permisos'

const empty = (): LineaServicio => ({
  id: '', codigo: '', nombre: '', descripcion: '', prefijo_cotizacion: '',
  iva_default: 19, aiu_default: 10, color: '#1e3a8a', situacion: 'Activo',
})

export default function LineasServicioPage() {
  const permisos = usePermisos('lineas-servicio')
  const { lineas, addLinea, updateLinea, deleteLinea } = useLineasServicioStore()
  const [selected, setSelected] = useState<LineaServicio | null>(null)
  const [isForm, setIsForm] = useState(false)

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: 13, outline: 'none' }
  const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    const codigo = selected.codigo.toUpperCase().trim()
    const toSave = { ...selected, codigo, prefijo_cotizacion: `COT-${codigo}-` }
    if (toSave.id) updateLinea(toSave.id, toSave)
    else addLinea({ ...toSave, id: crypto.randomUUID() })
    setIsForm(false); setSelected(null)
  }

  if (isForm && selected) {
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)', maxWidth: 700 }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? 'Editar' : 'Nueva'} Línea de Servicio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Código (3 letras) *</label>
              <input value={selected.codigo} maxLength={3} onChange={e => setSelected({ ...selected, codigo: e.target.value.toUpperCase() })} required style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Nombre *</label>
              <input value={selected.nombre} onChange={e => setSelected({ ...selected, nombre: e.target.value })} required style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Descripción</label>
              <input value={selected.descripcion} onChange={e => setSelected({ ...selected, descripcion: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>% IVA por defecto</label>
              <input type="number" step="0.01" value={selected.iva_default} onChange={e => setSelected({ ...selected, iva_default: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>% AIU por defecto</label>
              <input type="number" step="0.01" value={selected.aiu_default} onChange={e => setSelected({ ...selected, aiu_default: parseFloat(e.target.value) || 0 })} style={inputStyle} />
            </div>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Color</label>
              <input type="color" value={selected.color} onChange={e => setSelected({ ...selected, color: e.target.value })} style={{ ...inputStyle, padding: 4, height: 38 }} />
            </div>
            <div>
              <label style={{ color: '#fff', fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Situación</label>
              <select value={selected.situacion} onChange={e => setSelected({ ...selected, situacion: e.target.value as 'Activo' | 'Inactivo' })} style={inputStyle}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', background: 'rgba(59,130,246,0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(59,130,246,0.25)' }}>
              <p style={{ color: '#93c5fd', fontSize: 11, margin: 0 }}>Prefijo de cotización</p>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'monospace', margin: '4px 0 0 0' }}>COT-{selected.codigo || 'XXX'}-00001</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="submit" style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>Guardar</button>
            <button type="button" onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#64748b', color: '#fff' }}>Cancelar</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Líneas de Servicio</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Cada línea tiene su propio consecutivo de cotizaciones</p>
        </div>
        {permisos.editar && (
          <button onClick={() => { setSelected(empty()); setIsForm(true) }} style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>+ Nueva Línea</button>
        )}
      </div>

      <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Código', 'Nombre', 'Descripción', 'Prefijo Cotización', 'IVA %', 'AIU %', 'Situación', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr key={l.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ background: l.color, color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{l.codigo}</span>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, fontWeight: 600 }}>{l.nombre}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{l.descripcion}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 12, fontFamily: 'monospace' }}>{l.prefijo_cotizacion}00001</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{l.iva_default}%</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{l.aiu_default}%</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: l.situacion === 'Activo' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: l.situacion === 'Activo' ? '#86efac' : '#d1d5db', border: '1px solid rgba(255,255,255,0.15)' }}>{l.situacion}</span>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {permisos.editar && <button onClick={() => { setSelected(l); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#fff', border: '1px solid #16a34a' }}>Editar</button>}
                    {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar línea ${l.nombre}?`)) deleteLinea(l.id) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#b91c1c', color: '#fff', border: '1px solid #dc2626' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
            {lineas.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay líneas de servicio</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
