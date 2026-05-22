'use client'
import { useState } from 'react'
import { usePersonalStore, Personal } from '@/features/personal/store/personal-store'
import { usePermisos } from '@/shared/hooks/use-permisos'
import { fDate, todayColombia } from '@/shared/lib/format-date'
import { nextConsecutivo } from '@/shared/lib/consecutivo'
import BackupRestoreButtons from '@/shared/components/backup-restore-buttons'
import ReportPanel from '@/shared/components/report-panel'


const empty = (codigo: string): Personal => ({
  id: '', codigo, nombre: '', apellido: '', correo: '', nro_movil: '',
  departamento: '', cargo: '', situacion: 'Activo', fecha_registro: todayColombia(),
})

export default function PersonalPage() {
  const permisos = usePermisos('personal')
  const { personal, addPersonal, updatePersonal, deletePersonal } = usePersonalStore()
  const [selected, setSelected] = useState<Personal | null>(null)
  const [isForm, setIsForm] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = personal.filter(p =>
    !search ||
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.apellido.toLowerCase().includes(search.toLowerCase()) ||
    p.correo.toLowerCase().includes(search.toLowerCase()) ||
    p.cargo.toLowerCase().includes(search.toLowerCase()) ||
    p.departamento.toLowerCase().includes(search.toLowerCase())
  )

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', fontSize: 14, outline: 'none', boxSizing: 'border-box', height: 44 }
  const labelStyle: React.CSSProperties = { color: '#ffffff', fontSize: 16, fontWeight: 800, display: 'block', marginBottom: 8, background: '#1e3a8a', padding: '10px 12px', borderRadius: 6 }
  const inputUpper: React.CSSProperties = { ...inputStyle, textTransform: 'uppercase' }
  const btnStyle: React.CSSProperties = { padding: '10px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    if (selected.id) updatePersonal(selected.id, selected)
    else addPersonal({ ...selected, id: crypto.randomUUID() })
    setIsForm(false); setSelected(null)
  }

  if (isForm && selected) {
    return (
      <div>
        <button onClick={() => { setIsForm(false); setSelected(null) }} style={{ ...btnStyle, background: '#000', color: '#fff', border: '1px solid #333', marginBottom: 16 }}>← Volver</button>
        <form onSubmit={handleSave} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.15)', maxWidth: 800 }}>
          <h2 style={{ color: '#ffffff', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{selected.id ? 'Editar' : 'Nuevo'} Personal</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Código</label>
              <input value={selected.codigo} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Fecha de Registro</label>
              <input value={fDate(selected.fecha_registro)} readOnly style={{ ...inputStyle, opacity: 0.5 }} />
            </div>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input value={selected.nombre || ''} onChange={e => setSelected({ ...selected, nombre: e.target.value.toUpperCase() })} required style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input value={selected.apellido || ''} onChange={e => setSelected({ ...selected, apellido: e.target.value.toUpperCase() })} required style={inputUpper} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Correo *</label>
              <input type="email" value={selected.correo || ''} onChange={e => setSelected({ ...selected, correo: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nro Móvil *</label>
              <input value={selected.nro_movil || ''} onChange={e => setSelected({ ...selected, nro_movil: e.target.value })} required placeholder="300 123 4567" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Departamento (área) *</label>
              <input value={selected.departamento || ''} onChange={e => setSelected({ ...selected, departamento: e.target.value.toUpperCase() })} required placeholder="Operaciones, RRHH, Comercial..." style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Cargo *</label>
              <input value={selected.cargo || ''} onChange={e => setSelected({ ...selected, cargo: e.target.value.toUpperCase() })} required style={inputUpper} />
            </div>
            <div>
              <label style={labelStyle}>Situación</label>
              <select value={selected.situacion} onChange={e => setSelected({ ...selected, situacion: e.target.value as 'Activo' | 'Inactivo' })} style={inputStyle}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
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

      {/* Backup / Restore — banner superior, siempre visible */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.25)', borderRadius: 12, border: '1px solid rgba(245,158,11,0.6)', boxShadow: '0 2px 12px rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ color: '#fef08a', fontSize: 14, fontWeight: 900, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>🗄️ Mantenimiento de datos:</span>
        <BackupRestoreButtons
          modulo="personal"
          label="Personal"
          registros={personal}
          onClear={() => usePersonalStore.setState({ personal: [] })}
          onRestore={(rs) => usePersonalStore.setState({ personal: rs })}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Personal de la Empresa</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Directorio interno de empleados de Nova Seguridad</p>
        </div>
        {permisos.editar && (
          <button onClick={() => { setSelected(empty(nextConsecutivo('PER-', personal.map(p => p.codigo)).codigo)); setIsForm(true) }}
            style={{ ...btnStyle, background: '#0f1b3d', color: '#fff' }}>+ Nuevo Personal</button>
        )}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, correo, cargo o departamento..."
        style={{ ...inputStyle, maxWidth: 460, marginBottom: 16 }} />

      <div style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Código', 'Nombre', 'Apellido', 'Correo', 'Nro Móvil', 'Departamento', 'Cargo', 'Situación', 'Acciones'].map(h => (
              <th key={h} style={{ padding: '12px 14px', background: '#1e3a5f', color: '#fff', fontSize: 12, textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#4ade80', fontSize: 13, fontFamily: 'monospace' }}>{p.codigo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{p.nombre}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 13 }}>{p.apellido}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.correo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.nro_movil}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.departamento}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{p.cargo}</td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: p.situacion === 'Activo' ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)', color: p.situacion === 'Activo' ? '#86efac' : '#d1d5db', border: '1px solid rgba(255,255,255,0.15)' }}>{p.situacion}</span>
                </td>
                <td style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {permisos.editar && <button onClick={() => { setSelected(p); setIsForm(true) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#15803d', color: '#fff', border: '1px solid #16a34a' }}>Editar</button>}
                    {permisos.eliminar && <button onClick={() => { if (confirm(`¿Eliminar a ${p.nombre} ${p.apellido}?`)) deletePersonal(p.id) }} style={{ ...btnStyle, padding: '4px 12px', fontSize: 11, background: '#b91c1c', color: '#fff', border: '1px solid #dc2626' }}>Eliminar</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>No hay personal registrado</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Reportes PDF/Excel */}
      <div style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#fbbf24', fontSize: 16, fontWeight: 800, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>📊 Generar Reporte de Personal</h3>
        <ReportPanel
          title="Reporte de Personal"
          columns={[
            { header: 'Código', key: 'codigo', width: 10 },
            { header: 'Nombre', key: 'nombre', width: 16 },
            { header: 'Apellido', key: 'apellido', width: 16 },
            { header: 'Correo', key: 'correo', width: 22 },
            { header: 'Móvil', key: 'nro_movil', width: 12 },
            { header: 'Departamento', key: 'departamento', width: 14 },
            { header: 'Cargo', key: 'cargo', width: 14 },
            { header: 'Situación', key: 'situacion', width: 10 },
          ]}
          rows={filtered.map(p => ({
            codigo: p.codigo, nombre: p.nombre, apellido: p.apellido,
            correo: p.correo, nro_movil: p.nro_movil,
            departamento: p.departamento, cargo: p.cargo, situacion: p.situacion,
          }))}
        />
      </div>
    </div>
  )
}
